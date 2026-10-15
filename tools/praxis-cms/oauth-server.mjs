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
 * Env (see docker-compose.yml next to this file):
 *   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET   from the GitHub OAuth App
 *   ALLOWED_ORIGIN   the site origin the token may be sent to,
 *                    e.g. https://www.praxis-gueltekin.de
 *   PORT             default 8787
 *   HOST             default 127.0.0.1; the container sets 0.0.0.0 so the
 *                    nginx container can reach it over the docker network
 *   GITHUB_SCOPE     default "repo" (use "public_repo" if the repo is public)
 *   GITHUB_URL / GITHUB_API   only for tests against a fake GitHub
 */
import { createServer } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';

const {
  GITHUB_CLIENT_ID: CLIENT_ID,
  GITHUB_CLIENT_SECRET: CLIENT_SECRET,
  ALLOWED_ORIGIN,
  PORT = '8787',
  HOST = '127.0.0.1',
  GITHUB_SCOPE = 'repo',
  GITHUB_URL = 'https://github.com',
} = process.env;

if (!CLIENT_ID || !CLIENT_SECRET || !ALLOWED_ORIGIN) {
  console.error('GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET and ALLOWED_ORIGIN must be set.');
  process.exit(1);
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

  if (path === '/auth') {
    const state = randomBytes(16).toString('hex');
    const login = new URL('/login/oauth/authorize', GITHUB_URL);
    login.search = new URLSearchParams({ client_id: CLIENT_ID, scope: GITHUB_SCOPE, state }).toString();
    return send(res, 302, '', {
      Location: login.toString(),
      'Set-Cookie': `${STATE_COOKIE}=${state}; HttpOnly; Secure; SameSite=Lax; Path=/oauth; Max-Age=600`,
    });
  }

  if (path === '/callback') {
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
