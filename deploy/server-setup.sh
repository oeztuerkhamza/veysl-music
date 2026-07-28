#!/usr/bin/env bash
# dj-veys.de — first-run VPS bootstrap. Debian 13 (trixie), minimal.
#
# Run ONCE, as root, over SSH on a fresh box:
#   ssh root@<SERVER_IP> 'bash -s' < deploy/server-setup.sh
# or copy it over first and run locally on the box. Safe to re-run — every
# step checks current state before changing anything (package installs are
# naturally idempotent via apt; user/dir/ufw/service steps are guarded).
#
# What it does, in order:
#   1. apt update + unattended-upgrades (security patches on autopilot)
#   2. swap file (only if the box has none and RAM is small)
#   3. Docker Engine + the compose plugin (docker compose v2)
#   4. ufw: allow 22/80/443, default-deny everything else
#   5. fail2ban: SSH brute-force protection
#   6. a non-root `deploy` user, in the `docker` group, SSH-key-only
#   7. SSH hardening: PasswordAuthentication no, root login disabled
#      — done LAST, and only after verifying the deploy user actually has a
#      working authorized_keys file, so this script cannot lock you out of
#      your own box.
#   8. the on-disk directory layout the rest of deploy/ expects
#
# Placeholders only — see .claude/CONTRACT.md-style guidance in the repo
# root README: this script and every other deploy/ file must never contain
# real hostnames/IPs/credentials. Everything domain/credential-shaped here is
# a variable the operator sets before running.

set -euo pipefail

# --- Configuration (override via env before running) ------------------------
DEPLOY_USER="${DEPLOY_USER:-deploy}"
APP_DIR="${APP_DIR:-/opt/veysl}"
# Public key(s) to authorize for $DEPLOY_USER. Defaults to whatever already
# authenticated this root session — i.e. whoever can SSH in as root today
# will be able to SSH in as $DEPLOY_USER afterwards. Override with your own
# key material if you want a different one:
#   DEPLOY_SSH_PUBKEY="ssh-ed25519 AAAA... you@laptop" bash server-setup.sh
DEPLOY_SSH_PUBKEY="${DEPLOY_SSH_PUBKEY:-}"
# Minimum total RAM (MiB) below which we add a swap file if none exists.
SWAP_THRESHOLD_MB="${SWAP_THRESHOLD_MB:-4096}"
SWAP_SIZE="${SWAP_SIZE:-2G}"

log() { printf '\n\033[1;32m==> %s\033[0m\n' "$1"; }
warn() { printf '\033[1;33m!! %s\033[0m\n' "$1" >&2; }

if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root (this provisions system packages, users and SSH config)." >&2
  exit 1
fi

# -----------------------------------------------------------------------------
log "1/8 — apt update + unattended-upgrades"
# -----------------------------------------------------------------------------
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq --no-install-recommends \
  ca-certificates curl gnupg lsb-release ufw fail2ban unattended-upgrades \
  apt-listchanges sqlite3 git >/dev/null

if [ ! -f /etc/apt/apt.conf.d/20auto-upgrades ]; then
  cat >/etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF
fi
systemctl enable --now unattended-upgrades >/dev/null 2>&1 || true

# -----------------------------------------------------------------------------
log "2/8 — swap file"
# -----------------------------------------------------------------------------
total_mem_mb=$(awk '/MemTotal/ {printf "%d", $2/1024}' /proc/meminfo)
if [ -f /swapfile ]; then
  echo "  /swapfile already exists — skipping."
elif swapon --show | grep -q .; then
  echo "  swap already active on this box — skipping."
elif [ "$total_mem_mb" -ge "$SWAP_THRESHOLD_MB" ]; then
  echo "  ${total_mem_mb}MiB RAM >= ${SWAP_THRESHOLD_MB}MiB threshold — skipping swap."
else
  echo "  ${total_mem_mb}MiB RAM < ${SWAP_THRESHOLD_MB}MiB — creating ${SWAP_SIZE} swap file."
  fallocate -l "$SWAP_SIZE" /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >>/etc/fstab
  # Conservative swappiness — prefer RAM, swap is a safety net on a small VPS.
  if ! grep -q '^vm.swappiness' /etc/sysctl.conf 2>/dev/null; then
    echo 'vm.swappiness=10' >>/etc/sysctl.conf
    sysctl -w vm.swappiness=10 >/dev/null
  fi
fi

# -----------------------------------------------------------------------------
log "3/8 — Docker Engine + compose plugin"
# -----------------------------------------------------------------------------
if command -v docker >/dev/null 2>&1; then
  echo "  Docker already installed ($(docker --version)) — skipping install."
else
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  # shellcheck disable=SC1091
  . /etc/os-release
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian ${VERSION_CODENAME} stable" \
    >/etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq \
    docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin >/dev/null
fi
systemctl enable --now docker >/dev/null 2>&1 || true

# -----------------------------------------------------------------------------
log "4/8 — ufw (22, 80, 443)"
# -----------------------------------------------------------------------------
ufw --force reset >/dev/null
ufw default deny incoming >/dev/null
ufw default allow outgoing >/dev/null
ufw allow 22/tcp comment 'SSH' >/dev/null
ufw allow 80/tcp comment 'HTTP' >/dev/null
ufw allow 443/tcp comment 'HTTPS' >/dev/null
ufw --force enable >/dev/null
ufw status verbose

# -----------------------------------------------------------------------------
log "5/8 — fail2ban (SSH jail)"
# -----------------------------------------------------------------------------
if [ ! -f /etc/fail2ban/jail.local ]; then
  cat >/etc/fail2ban/jail.local <<'EOF'
[sshd]
enabled = true
maxretry = 5
findtime = 10m
bantime = 1h
EOF
fi
systemctl enable --now fail2ban >/dev/null 2>&1 || true

# -----------------------------------------------------------------------------
log "6/8 — non-root deploy user"
# -----------------------------------------------------------------------------
if id "$DEPLOY_USER" >/dev/null 2>&1; then
  echo "  User '$DEPLOY_USER' already exists — skipping creation."
else
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
fi
usermod -aG sudo,docker "$DEPLOY_USER"

install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
authorized_keys="/home/$DEPLOY_USER/.ssh/authorized_keys"

if [ -n "$DEPLOY_SSH_PUBKEY" ]; then
  echo "$DEPLOY_SSH_PUBKEY" >>"$authorized_keys"
elif [ -f /root/.ssh/authorized_keys ]; then
  cat /root/.ssh/authorized_keys >>"$authorized_keys"
fi
sort -u "$authorized_keys" -o "$authorized_keys" 2>/dev/null || true
chmod 600 "$authorized_keys"
chown "$DEPLOY_USER:$DEPLOY_USER" "$authorized_keys"

# -----------------------------------------------------------------------------
log "7/8 — SSH hardening (only after verifying the deploy user can log in)"
# -----------------------------------------------------------------------------
if [ ! -s "$authorized_keys" ]; then
  warn "No authorized_keys for '$DEPLOY_USER' — refusing to disable password/root SSH login."
  warn "Set DEPLOY_SSH_PUBKEY and re-run this script, or add a key to $authorized_keys manually,"
  warn "confirm you can 'ssh ${DEPLOY_USER}@<SERVER_IP>', THEN re-run to finish hardening."
else
  sshd_config="/etc/ssh/sshd_config"
  set_sshd_option() {
    local key="$1" value="$2"
    if grep -qE "^\s*#?\s*${key}\b" "$sshd_config"; then
      sed -i -E "s/^\s*#?\s*${key}\b.*/${key} ${value}/" "$sshd_config"
    else
      echo "${key} ${value}" >>"$sshd_config"
    fi
  }
  set_sshd_option "PasswordAuthentication" "no"
  set_sshd_option "PermitRootLogin" "no"
  set_sshd_option "KbdInteractiveAuthentication" "no"
  set_sshd_option "PubkeyAuthentication" "yes"
  sshd -t # fail loudly before reloading if the config is broken
  systemctl reload ssh 2>/dev/null || systemctl reload sshd 2>/dev/null || true
  echo "  SSH hardened: key-only auth, root login disabled."
  echo "  IMPORTANT: keep this session open and verify 'ssh ${DEPLOY_USER}@<SERVER_IP>' works"
  echo "  from a NEW terminal before closing this one."
fi

# -----------------------------------------------------------------------------
log "8/8 — directory layout"
# -----------------------------------------------------------------------------
install -d -m 750 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$APP_DIR"
install -d -m 750 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$APP_DIR/backups"
install -d -m 750 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$APP_DIR/backups/db"
install -d -m 750 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$APP_DIR/backups/media"

cat <<EOF

------------------------------------------------------------------------------
Done. Next steps (see docs/DEPLOYMENT.md for the full runbook):

  1. As ${DEPLOY_USER}: clone the repo into ${APP_DIR}
       ssh ${DEPLOY_USER}@<SERVER_IP>
       git clone <REPO_URL> ${APP_DIR}/app   # or rsync/scp if the repo is private without deploy keys set up yet
  2. Copy env.production.example to ${APP_DIR}/app/.env and fill in real values
     (PAYLOAD_SECRET generated fresh ON THIS BOX — see docs/DEPLOYMENT.md)
  3. Point DNS at this server's IP, then run deploy/setup-ssl.sh once
  4. Run deploy/deploy.sh
------------------------------------------------------------------------------
EOF
