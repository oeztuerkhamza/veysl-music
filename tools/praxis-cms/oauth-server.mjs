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
  CMS_USERS = '',
  CMS_GITHUB_TOKEN,
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

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function loginPage(state, error = '') {
  return `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Anmelden – Praxis Gültekin</title>
<style>body{font:16px system-ui,sans-serif;max-width:22rem;margin:3rem auto;padding:0 1rem}label{display:block;margin:1rem 0 .25rem}input{width:100%;box-sizing:border-box;padding:.6rem;font:inherit}button,.gh{display:block;width:100%;box-sizing:border-box;margin-top:1.25rem;padding:.7rem;font:inherit;text-align:center;border:0;border-radius:6px;background:#0b5c5c;color:#fff;text-decoration:none;cursor:pointer}.gh{background:#24292f}.err{color:#b00020}</style>
<h1>Anmelden</h1>${error ? `<p class="err" role="alert">${esc(error)}</p>` : ''}
${
  MAIL_LOGIN
    ? `<form method="post" action="/oauth/login"><input type="hidden" name="state" value="${esc(state)}">
<label for="m">E-Mail</label><input id="m" name="email" type="email" autocomplete="username" required autofocus>
<label for="p">Passwort</label><input id="p" name="password" type="password" autocomplete="current-password" required>
<button type="submit">Anmelden</button></form>`
    : ''
}
${GITHUB_LOGIN ? `<a class="gh" href="/oauth/github">Mit GitHub anmelden</a>` : ''}</html>`;
}

async function readForm(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 4096) throw new Error('too large');
  }
  return new URLSearchParams(raw);
}

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

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname.replace(/^\/oauth/, '');

  if (path === '/auth' && MAIL_LOGIN) {
    const state = randomBytes(16).toString('hex');
    return send(res, 200, loginPage(state), {
      'Set-Cookie': `${STATE_COOKIE}=${state}; HttpOnly; Secure; SameSite=Strict; Path=/oauth; Max-Age=600`,
      'X-Frame-Options': 'DENY',
    });
  }

  if (path === '/login' && req.method === 'POST' && MAIL_LOGIN) {
    let form;
    try {
      form = await readForm(req);
    } catch {
      return send(res, 413, 'Too large');
    }
    const state = form.get('state') ?? '';
    if (!safeEqual(state, cookieOf(req, STATE_COOKIE))) return send(res, 400, loginPage(randomBytes(16).toString('hex'), 'Sitzung abgelaufen. Bitte erneut versuchen.'));
    const mail = (form.get('email') ?? '').trim().toLowerCase();
    const key = `${mail}|${req.headers['x-forwarded-for'] ?? req.socket.remoteAddress}`;
    const retry = (msg) =>
      send(res, 401, loginPage(state, msg), { 'Set-Cookie': `${STATE_COOKIE}=${state}; HttpOnly; Secure; SameSite=Strict; Path=/oauth; Max-Age=600` });
    if (tooMany(key)) return retry('Zu viele Versuche. Bitte in 15 Minuten erneut versuchen.');
    if (!checkPassword(mail, form.get('password') ?? '')) {
      fail(key);
      return retry('E-Mail oder Passwort falsch.');
    }
    return send(res, 200, resultPage('success', { token: CMS_GITHUB_TOKEN, provider: 'github' }), {
      'Set-Cookie': `${STATE_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/oauth; Max-Age=0`,
    });
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
