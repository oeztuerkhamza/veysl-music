# syntax=docker/dockerfile:1

# dj-veys.de — Next.js 16 (App Router) + Payload CMS 3, multi-stage build.
#
# Produces a minimal runtime image using Next's `output: 'standalone'` trace
# (see next.config.ts) — the final stage ships only the files Next
# determined the server actually needs, not the full node_modules tree.
#
# Build (from repo root):
#   docker build \
#     --build-arg NEXT_PUBLIC_SITE_URL=https://dj-veys.de \
#     --build-arg NEXT_PUBLIC_PLAUSIBLE_DOMAIN=dj-veys.de \
#     -t veysl-app:latest .
# (docker-compose.yml passes these automatically from .env — see docs/DEPLOYMENT.md)
#
# No PAYLOAD_SECRET / DATABASE_URI / booking-mail credentials are needed at
# build time: payload.config.ts's `buildConfig()` only touches those at
# request/runtime, and every build-time caller that might read from the CMS
# (getSite(), the site-image slot resolver) already fails soft to the
# static src/content/site.ts defaults when Payload can't init — confirmed by
# running `npm run build` locally with no .env at all: it completes clean,
# just logging the fallbacks. Only NEXT_PUBLIC_* vars need to be build args,
# because Next.js inlines those into the client bundle at build time; every
# other env var is read live by the Node process at container start.

# Muss mit .nvmrc und der node-version im CI-Workflow übereinstimmen.
# Gerät das auseinander, löst npm die optionalen Peer-Dependencies anders
# auf als beim Erzeugen von package-lock.json und `npm ci` bricht mit EUSAGE
# ab — erst hier im Image-Build, nicht lokal.
ARG NODE_VERSION=24-alpine

# ---------------------------------------------------------------------------
# Stage 1 — dependencies (cached separately from source so `npm ci` doesn't
# re-run on every source change, only when package*.json changes)
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS deps
# sharp/Next's native bindings expect glibc-shaped symbols not present on
# bare musl; this is the standard fix for Next.js on Alpine.
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
# `npm ci` needs devDependencies too (typescript, tailwind, eslint types) —
# `next build` type-checks and compiles with them. They never reach the
# final runtime image; only `.next/standalone`'s traced node_modules do.
RUN npm ci

# ---------------------------------------------------------------------------
# Stage 2 — build
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Inlined into the client bundle at build time — see the comment at the top
# of this file. Values come from docker-compose.yml's `build.args`, sourced
# from .env (see env.production.example / docs/DEPLOYMENT.md). All optional:
# each one degrades to "feature off" if left empty, same as local dev.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_PLAUSIBLE_DOMAIN
ARG NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL
ARG NEXT_PUBLIC_GA4_MEASUREMENT_ID
ARG NEXT_PUBLIC_CLARITY_PROJECT_ID
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN=$NEXT_PUBLIC_PLAUSIBLE_DOMAIN \
    NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL=$NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL \
    NEXT_PUBLIC_GA4_MEASUREMENT_ID=$NEXT_PUBLIC_GA4_MEASUREMENT_ID \
    NEXT_PUBLIC_CLARITY_PROJECT_ID=$NEXT_PUBLIC_CLARITY_PROJECT_ID

# `next build` unconditionally sets NODE_ENV=production itself; setting it
# here too just keeps any other tooling in this stage consistent.
ENV NODE_ENV=production
# Turbopack/Next telemetry pings home by default — off for CI/production builds.
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3 — runtime
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# `node:22-alpine` already ships an unprivileged `node` user (uid/gid 1000).
# Create the two runtime-data mount points and hand them to that user BEFORE
# the volumes are attached: Docker seeds a brand-new named volume from
# whatever already exists at the mount point in the image — including
# ownership — so the app can write to both from the first boot without a
# root-then-drop-privileges entrypoint.
#   /app/data  — Payload's SQLite DB (DATABASE_URI=file:/app/data/veysl-cms.db)
#   /app/media — Payload upload storage (src/payload/collections/media.ts
#                `staticDir: path.resolve(process.cwd(), 'media')`, and
#                process.cwd() for `node server.js` is this WORKDIR)
#   /app/social-cache — first-party copies of Instagram/YouTube thumbnails
#                (src/lib/social/media-cache.ts, via SOCIAL_MEDIA_CACHE_DIR).
#                Needs a volume for the same reason as the two above: without
#                one it lives in the container layer and every deploy wipes it,
#                leaving /api/social/media/<id> answering 404 for thumbnails
#                the already-rendered HTML still points at.
RUN mkdir -p /app/data /app/media /app/social-cache \
  && chown -R node:node /app/data /app/media /app/social-cache

# Standalone output: a self-contained server.js + the exact node_modules
# subset Next traced as actually required. `.next/static` and `public/` are
# NOT included by `output: standalone` and must be copied in manually per
# Next.js docs.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

# sharp, in full, over whatever the tracer produced.
#
# Next's file tracing follows `require`/`import` graphs. sharp loads its
# native binding at runtime, and that binding in turn dlopen()s libvips from a
# SEPARATE package (`@img/sharp-libvips-linuxmusl-x64`) that appears nowhere
# in the import graph. The tracer therefore shipped `@img/sharp-linuxmusl-x64`
# and left its libvips behind, and the container failed at runtime with
#
#   ERR_DLOPEN_FAILED: Error loading shared library libvips-cpp.so.8.18.3
#
# The public pages survive that — they never touch sharp — so the failure
# surfaced only on /admin, as a 500 with a healthy container and a green
# healthcheck. Copying the whole `@img` scope plus `sharp` is a few MB and
# removes the entire class of problem, rather than naming the one .so that
# happened to be missing on this architecture.
COPY --from=builder --chown=node:node /app/node_modules/sharp ./node_modules/sharp
COPY --from=builder --chown=node:node /app/node_modules/@img ./node_modules/@img

# The operational scripts, plus the one dependency they need that the standalone
# output does not leave importable.
#
# `scripts/mail-test.mjs` is the tool that tells a mail problem apart from the
# outside: wrong password (SMTP 535/EAUTH) vs. unreachable host vs. accepted-
# but-never-delivered. It is worthless on a laptop — the mailserver, the
# credentials and the blocked-or-not port 25 all live on this box — so it has
# to be *in the image*, and it wasn't: the runtime stage copies only the
# standalone bundle, `.next/static` and `public/`, and `docker exec ... node
# scripts/mail-test.mjs` failed with MODULE_NOT_FOUND on the script itself.
#
# nodemailer needs its own line for a subtler reason. Next bundles it *into* a
# server chunk (verified: `SMTPTransport` appears in
# .next/standalone/.next/server/chunks/), so the application's SMTP transport
# works without this copy — but a bundled-in copy is not an importable package,
# and a standalone script doing `import 'nodemailer'` resolves against
# /app/node_modules, where it is absent. It has zero dependencies, so this is a
# self-contained few hundred KB.
COPY --from=builder --chown=node:node /app/node_modules/nodemailer ./node_modules/nodemailer
COPY --from=builder --chown=node:node /app/scripts ./scripts

USER node

EXPOSE 3000

# `/` is the German homepage, prerendered (ISR, 5 min revalidate) — cheap to
# hit repeatedly and, post skipProxyUrlNormalize fix (see next.config.ts),
# reliably returns 200 rather than looping. wget is busybox-builtin on
# alpine, no extra package needed.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget --quiet --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
