#!/usr/bin/env node
/**
 * GitHub login bridge for the admin panel (Decap CMS at /admin).
 *
 * Decap runs in the browser and cannot hold a GitHub OAuth client secret, so
 * something on the server has to trade GitHub's one-time `code` for a token.
 * That is all this does: two routes, no dependencies, no storage, no logging
 * of tokens.
 *
 *   GET /oauth/auth      → redirects to GitHub's login page
 *   GET /oauth/callback  → exchanges the code, hands the token to the panel
 *                          window via postMessage, then the window closes
 *
 * What it does NOT decide is who may edit: GitHub does. The token only works
 * for repositories the GitHub user can already write to, so a stranger who
 * logs in gets a token that can change nothing here.
 *
 * E-mail login (for people without a GitHub account): /oauth/auth shows a
 * form. A correct e-mail + password pair gets the practice's shared
 * GitHub token (CMS_GITHUB_TOKEN, a fine-grained PAT limited to the praxis
 * repo, contents: write). Passwords never leave this server in clear text;
 * CMS_USERS holds only scrypt hashes (make them with hash-password.mjs).
 *
 * On-page editor (www.praxis-gueltekin.de/bearbeiten): the same e-mail login,
 * but instead of a token the browser gets a session cookie, and the texts are
 * saved through this server. The token never reaches the browser.
 *   GET  /oauth/edit     → login form; afterwards back to the site in edit mode
 *   GET  /oauth/session  → who is logged in (401 if nobody)
 *   POST /oauth/save     → writes changed texts to the repo, one commit per file
 *   POST /oauth/logout
 *
 * Env (see docker-compose.yml next to this file):
 *   CMS_USERS            "mail:hash,mail:hash" (hash from hash-password.mjs)
 *   CMS_GITHUB_TOKEN     token handed to users who log in by e-mail
 *   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET   from the GitHub OAuth App
 *                    (optional once CMS_USERS is set: enables the GitHub button)
 *   ALLOWED_ORIGIN   the site origin the token may be sent to,
 *                    e.g. https://www.praxis-gueltekin.de
 *   PORT             default 8787
 *   HOST             default 127.0.0.1; the container sets 0.0.0.0 so the
 *                    nginx container can reach it over the docker network
 *   GITHUB_SCOPE     default "repo" (use "public_repo" if the repo is public)
 *   CMS_REPO / CMS_BRANCH   where the on-page editor saves; default
 *                    oeztuerkhamza/praxis-gueltekin, master
 *   GITHUB_URL / GITHUB_API   only for tests against a fake GitHub
 */
import { createServer } from 'node:http';
import { randomBytes, timingSafeEqual, scryptSync } from 'node:crypto';

const {
  GITHUB_CLIENT_ID: CLIENT_ID,
  GITHUB_CLIENT_SECRET: CLIENT_SECRET,
  ALLOWED_ORIGIN,
  PORT = '8787',
  HOST = '127.0.0.1',
  GITHUB_SCOPE = 'repo',
  GITHUB_URL = 'https://github.com',
  GITHUB_API = 'https://api.github.com',
  CMS_USERS = '',
  CMS_GITHUB_TOKEN,
  CMS_REPO = 'oeztuerkhamza/praxis-gueltekin',
  CMS_BRANCH = 'master',
} = process.env;

const GITHUB_LOGIN = Boolean(CLIENT_ID && CLIENT_SECRET);

/** "mail:salt.hash" pairs; the salt and hash are hex, so ':' and ',' are safe separators. */
const USERS = new Map(
  CMS_USERS.split(',')
    .map((e) => e.trim())
    .filter(Boolean)
    .map((e) => {
      const i = e.indexOf(':');
      return [e.slice(0, i).toLowerCase(), e.slice(i + 1)];
    }),
);
const MAIL_LOGIN = USERS.size > 0 && Boolean(CMS_GITHUB_TOKEN);

if (!ALLOWED_ORIGIN || (!GITHUB_LOGIN && !MAIL_LOGIN)) {
  console.error('ALLOWED_ORIGIN and either GITHUB_CLIENT_ID/SECRET or CMS_USERS/CMS_GITHUB_TOKEN must be set.');
  process.exit(1);
}

/** Same scrypt parameters as hash-password.mjs. A missing user is still hashed, so timing does not reveal which mails exist. */
function checkPassword(mail, password) {
  const [salt = '00', hash = '00'] = (USERS.get(mail) ?? '').split('.');
  const got = scryptSync(password, Buffer.from(salt, 'hex'), 32);
  const want = Buffer.from(hash, 'hex');
  return USERS.has(mail) && want.length === got.length && timingSafeEqual(got, want);
}

/** 5 failures per mail+IP per 15 minutes; in memory is enough for one small container. */
const failures = new Map();
const WINDOW_MS = 15 * 60_000;
const tooMany = (key) => (failures.get(key) ?? []).filter((t) => Date.now() - t < WINDOW_MS).length >= 5;
const fail = (key) => failures.set(key, [...(failures.get(key) ?? []).filter((t) => Date.now() - t < WINDOW_MS), Date.now()]);

/**
 * The visitor's address as nginx saw it. nginx overwrites X-Real-IP on every
 * request; X-Forwarded-For it passes through as the client sent it, so
 * keying the limit on that would let anyone pick a fresh "address" per try.
 */
const clientIp = (req) => req.headers['x-real-ip'] ?? req.socket.remoteAddress;

/** Sessions of the on-page editor. In memory: a restart (every deploy) just means logging in again. */
const sessions = new Map();
const SESSION_MS = 8 * 60 * 60_000;
const SESSION_COOKIE = 'cms_session';
/** Readable by the page script, holds no secret: only tells every page to load the editor. */
const EDIT_HINT = 'cms_edit';

function sessionOf(req) {
  const id = cookieOf(req, SESSION_COOKIE);
  const s = id && sessions.get(id);
  if (!s) return null;
  if (s.expires < Date.now()) {
    sessions.delete(id);
    return null;
  }
  return s;
}

/** Only a path on the site itself, never "//other.host" or "/\other.host". */
const safeNext = (n) => (typeof n === 'string' && /^\/(?![/\\])[^\\\s]*$/.test(n) ? n : '/');

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** `next` set: the on-page editor's login, which returns to that page instead of handing out a token. */
function loginPage(state, error = '', next = null) {
  return `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Anmelden – Praxis Gültekin</title>
<style>body{font:16px system-ui,sans-serif;max-width:22rem;margin:3rem auto;padding:0 1rem}label{display:block;margin:1rem 0 .25rem}input{width:100%;box-sizing:border-box;padding:.6rem;font:inherit}button,.gh{display:block;width:100%;box-sizing:border-box;margin-top:1.25rem;padding:.7rem;font:inherit;text-align:center;border:0;border-radius:6px;background:#0b5c5c;color:#fff;text-decoration:none;cursor:pointer}.gh{background:#24292f}.err{color:#b00020}</style>
<h1>Anmelden</h1>${error ? `<p class="err" role="alert">${esc(error)}</p>` : ''}
${
  MAIL_LOGIN
    ? `<form method="post" action="/oauth/login"><input type="hidden" name="state" value="${esc(state)}">${next === null ? '' : `<input type="hidden" name="next" value="${esc(next)}">`}
<label for="m">E-Mail</label><input id="m" name="email" type="email" autocomplete="username" required autofocus>
<label for="p">Passwort</label><input id="p" name="password" type="password" autocomplete="current-password" required>
<button type="submit">Anmelden</button></form>`
    : ''
}
${GITHUB_LOGIN && next === null ? `<a class="gh" href="/oauth/github">Mit GitHub anmelden</a>` : ''}</html>`;
}

async function readBody(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error('too large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

const readForm = async (req) => new URLSearchParams(await readBody(req, 4096));

const STATE_COOKIE = 'cms_oauth_state';

const cookieOf = (req, name) =>
  (req.headers.cookie ?? '')
    .split(/;\s*/)
    .map((c) => c.split('='))
    .find(([k]) => k === name)?.[1];

const safeEqual = (a = '', b = '') => a.length === b.length && a.length > 0 && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** The page that gives the token to the panel window. Decap's own protocol. */
function resultPage(status, payload) {
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
  return `<!doctype html><meta charset="utf-8"><title>Anmeldung</title>
<p>${status === 'success' ? 'Angemeldet. Dieses Fenster schließt sich.' : 'Anmeldung fehlgeschlagen. Sie können dieses Fenster schließen.'}</p>
<script>
  (function () {
    var allowed = ${JSON.stringify(ALLOWED_ORIGIN)};
    function receive(e) {
      if (e.origin !== allowed) return;
      window.opener.postMessage(${JSON.stringify(message)}, allowed);
      window.removeEventListener('message', receive);
    }
    window.addEventListener('message', receive);
    window.opener && window.opener.postMessage('authorizing:github', allowed);
  })();
</script>`;
}

const send = (res, code, body, headers = {}) => {
  res.writeHead(code, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers });
  res.end(body);
};

const sendJson = (res, code, body, headers = {}) =>
  send(res, code, JSON.stringify(body), { 'Content-Type': 'application/json; charset=utf-8', ...headers });

/** The text files the on-page editor may change. Blog posts and images stay with the panel. */
const EDITABLE_FILE = /^src\/(i18n\/(locales|legal)\/[a-z]{2}|data\/topics)\.json$/;
const PATH_PART = /^[A-Za-z0-9_-]{1,64}$/;

/**
 * One change: { file, path: ["home", "hero", "title"], value }. Only an
 * existing string may be replaced — the editor can reword a text, never add
 * keys, change the shape of the file or touch a URL slug.
 */
function validChange(c) {
  return (
    c &&
    typeof c.file === 'string' &&
    EDITABLE_FILE.test(c.file) &&
    Array.isArray(c.path) &&
    c.path.length > 0 &&
    c.path.length <= 12 &&
    c.path.every((p) => (typeof p === 'string' && PATH_PART.test(p)) || (Number.isInteger(p) && p >= 0 && p < 1000)) &&
    c.path.at(-1) !== 'slug' &&
    typeof c.value === 'string' &&
    c.value.length <= 10_000
  );
}

/** Sets an existing string inside parsed JSON. Returns false if the path does not lead to one. */
function setText(data, path, value) {
  let node = data;
  for (const p of path.slice(0, -1)) {
    if (node === null || typeof node !== 'object' || !Object.hasOwn(node, p)) return false;
    node = node[p];
  }
  const last = path.at(-1);
  if (node === null || typeof node !== 'object' || !Object.hasOwn(node, last) || typeof node[last] !== 'string') return false;
  node[last] = value;
  return true;
}

class SaveError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const github = (path, init = {}) =>
  fetch(`${GITHUB_API}/repos/${CMS_REPO}/contents/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${CMS_GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'praxis-cms',
      ...init.headers,
    },
  });

/**
 * Applies the changes to one file and commits it. The file is written back
 * the way it is stored (2-space JSON, final newline), so the commit shows only
 * the changed lines. If someone else committed the file in between, GitHub
 * refuses the stale sha and the whole thing is redone once on the new version.
 */
async function saveFile(file, changes, mail) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const got = await github(`${file}?ref=${encodeURIComponent(CMS_BRANCH)}`);
    if (!got.ok) throw new SaveError(502, `read ${file}: GitHub ${got.status}`);
    const { content, sha } = await got.json();
    const before = Buffer.from(content, 'base64').toString('utf8');
    const data = JSON.parse(before);
    for (const c of changes) {
      if (!setText(data, c.path, c.value)) throw new SaveError(422, `Unbekannter Text: ${file} ${c.path.join('.')}`);
    }
    const after = JSON.stringify(data, null, 2) + '\n';
    if (after === before) return null;
    const n = changes.length;
    const put = await github(file, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Seitentext geändert: ${file} (${n} ${n === 1 ? 'Text' : 'Texte'}, Seiteneditor)`,
        content: Buffer.from(after, 'utf8').toString('base64'),
        sha,
        branch: CMS_BRANCH,
        // Who changed it, so the history tells the editors apart even though they share one token.
        author: { name: mail, email: mail },
      }),
    });
    if (put.ok) return (await put.json()).commit?.sha ?? null;
    if (put.status !== 409 || attempt === 1) throw new SaveError(502, `write ${file}: GitHub ${put.status}`);
  }
  return null;
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname.replace(/^\/oauth/, '');

  const stateCookie = (state) => `${STATE_COOKIE}=${state}; HttpOnly; Secure; SameSite=Strict; Path=/oauth; Max-Age=600`;
  const showLogin = (code, error = '', next = null) => {
    const state = randomBytes(16).toString('hex');
    return send(res, code, loginPage(state, error, next), { 'Set-Cookie': stateCookie(state), 'X-Frame-Options': 'DENY' });
  };

  if (path === '/auth' && MAIL_LOGIN) return showLogin(200);

  if (path === '/edit' && MAIL_LOGIN) return showLogin(200, '', safeNext(url.searchParams.get('next')));

  if (path === '/login' && req.method === 'POST' && MAIL_LOGIN) {
    let form;
    try {
      form = await readForm(req);
    } catch {
      return send(res, 413, 'Too large');
    }
    const next = form.has('next') ? safeNext(form.get('next')) : null;
    const state = form.get('state') ?? '';
    if (!safeEqual(state, cookieOf(req, STATE_COOKIE))) return showLogin(400, 'Sitzung abgelaufen. Bitte erneut versuchen.', next);
    const mail = (form.get('email') ?? '').trim().toLowerCase();
    const key = `${mail}|${clientIp(req)}`;
    const retry = (msg) => send(res, 401, loginPage(state, msg, next), { 'Set-Cookie': stateCookie(state), 'X-Frame-Options': 'DENY' });
    if (tooMany(key)) return retry('Zu viele Versuche. Bitte in 15 Minuten erneut versuchen.');
    if (!checkPassword(mail, form.get('password') ?? '')) {
      fail(key);
      return retry('E-Mail oder Passwort falsch.');
    }
    const clearState = `${STATE_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/oauth; Max-Age=0`;
    if (next !== null) {
      for (const [id, s] of sessions) if (s.expires < Date.now()) sessions.delete(id);
      const id = randomBytes(32).toString('hex');
      sessions.set(id, { mail, expires: Date.now() + SESSION_MS });
      const age = SESSION_MS / 1000;
      return send(res, 303, '', {
        Location: new URL(next, ALLOWED_ORIGIN).toString(),
        'Set-Cookie': [
          clearState,
          `${SESSION_COOKIE}=${id}; HttpOnly; Secure; SameSite=Strict; Path=/oauth; Max-Age=${age}`,
          `${EDIT_HINT}=1; Secure; SameSite=Strict; Path=/; Max-Age=${age}`,
        ],
      });
    }
    return send(res, 200, resultPage('success', { token: CMS_GITHUB_TOKEN, provider: 'github' }), { 'Set-Cookie': clearState });
  }

  if (path === '/session' && MAIL_LOGIN) {
    const s = sessionOf(req);
    return s ? sendJson(res, 200, { mail: s.mail }) : sendJson(res, 401, {});
  }

  // Changes only from the site itself: the session cookie is SameSite=Strict
  // already, the Origin check makes a forged cross-site request fail twice.
  if ((path === '/save' || path === '/logout') && req.method === 'POST' && MAIL_LOGIN) {
    if (req.headers.origin !== ALLOWED_ORIGIN) return sendJson(res, 403, { error: 'Falscher Ursprung.' });
    const s = sessionOf(req);

    if (path === '/logout') {
      sessions.delete(cookieOf(req, SESSION_COOKIE));
      return send(res, 204, '', {
        'Set-Cookie': [
          `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/oauth; Max-Age=0`,
          `${EDIT_HINT}=; Secure; SameSite=Strict; Path=/; Max-Age=0`,
        ],
      });
    }

    if (!s) return sendJson(res, 401, { error: 'Nicht angemeldet.' });
    if (!(req.headers['content-type'] ?? '').startsWith('application/json')) return sendJson(res, 415, { error: 'JSON erwartet.' });
    let changes;
    try {
      changes = JSON.parse(await readBody(req, 256 * 1024)).changes;
    } catch {
      return sendJson(res, 400, { error: 'Ungültige Anfrage.' });
    }
    if (!Array.isArray(changes) || changes.length === 0 || changes.length > 200 || !changes.every(validChange)) {
      return sendJson(res, 400, { error: 'Ungültige Änderung.' });
    }
    const byFile = Map.groupBy(changes, (c) => c.file);
    const commits = [];
    try {
      for (const [file, list] of byFile) {
        const sha = await saveFile(file, list, s.mail);
        if (sha) commits.push(sha);
      }
    } catch (err) {
      console.error('save failed:', err instanceof Error ? err.message : err);
      const status = err instanceof SaveError ? err.status : 502;
      // Files saved before the failure stay saved; the editor reports the rest as not saved.
      return sendJson(res, status, { error: status === 422 ? err.message : 'Speichern bei GitHub fehlgeschlagen.', commits });
    }
    console.log(`saved ${changes.length} text(s) in ${byFile.size} file(s) for ${s.mail}`);
    return sendJson(res, 200, { saved: changes.length, commits });
  }

  if (path === '/github' || path === '/auth') {
    if (!GITHUB_LOGIN) return send(res, 404, 'Not found');
    const state = randomBytes(16).toString('hex');
    const login = new URL('/login/oauth/authorize', GITHUB_URL);
    login.search = new URLSearchParams({ client_id: CLIENT_ID, scope: GITHUB_SCOPE, state }).toString();
    return send(res, 302, '', {
      Location: login.toString(),
      'Set-Cookie': `${STATE_COOKIE}=${state}; HttpOnly; Secure; SameSite=Lax; Path=/oauth; Max-Age=600`,
    });
  }

  if (path === '/callback' && GITHUB_LOGIN) {
    const code = url.searchParams.get('code');
    if (!code || !safeEqual(url.searchParams.get('state') ?? '', cookieOf(req, STATE_COOKIE))) {
      return send(res, 400, resultPage('error', { message: 'invalid state' }));
    }
    try {
      const tokenRes = await fetch(new URL('/login/oauth/access_token', GITHUB_URL), {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
      });
      const body = await tokenRes.json();
      if (!body.access_token) return send(res, 400, resultPage('error', { message: body.error ?? 'no token' }));
      return send(res, 200, resultPage('success', { token: body.access_token, provider: 'github' }), {
        'Set-Cookie': `${STATE_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/oauth; Max-Age=0`,
      });
    } catch (err) {
      console.error('token exchange failed:', err instanceof Error ? err.message : err);
      return send(res, 502, resultPage('error', { message: 'github unreachable' }));
    }
  }

  send(res, 404, 'Not found');
}).listen(Number(PORT), HOST, () => console.log(`CMS OAuth bridge on ${HOST}:${PORT}`));
