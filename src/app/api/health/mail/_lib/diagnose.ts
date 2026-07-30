/**
 * Turns the mail configuration plus a live connection probe into a list of
 * named problems.
 *
 * The judgement lives here, in TypeScript, rather than in the GitHub Actions
 * workflow that reads it. A workflow that greps `docker logs` has to
 * re-derive what a log line means every time one is reworded; this way the
 * application states its own verdict and CI only has to render it. Adding a
 * newly understood failure mode is a change in this file, not in YAML.
 */
import {
  checkMailConnection,
  getMailTransportKind,
  type MailConnectionCheck,
  type MailTransportKind,
} from '@/app/api/anfrage/_lib/transport';
import { getMailHistory, recipientDomain, type MailHistory } from '@/lib/mail-health';

export type ProblemSeverity = 'critical' | 'warning' | 'info';

export interface MailProblem {
  /** Stable machine-readable identifier — safe to match on in CI. */
  code: string;
  severity: ProblemSeverity;
  /** What is wrong. */
  message: string;
  /** What to do about it. Present whenever there is a concrete action. */
  fix?: string;
}

/** A single env var, described without ever revealing a secret. */
export interface ConfigEntry {
  set: boolean;
  /**
   * Domain part only, for address-valued vars. The local part is left out:
   * `SMTP_USER` and `BOOKING_NOTIFY_EMAIL` are the owner's own addresses, but
   * this response travels into CI logs, and the domain is the only part any
   * diagnosis here needs.
   */
  domain?: string;
  /**
   * Character count, for secret-valued vars. Not the secret, and it catches
   * the documented failure it exists for: an unquoted `#` in a password ends
   * the line in a `.env` file, so a password that is "obviously right" is
   * silently truncated and rejected.
   */
  length?: number;
  /** Verbatim, for values that are not secret and are worth reading: host and port. */
  value?: string;
}

export interface MailDiagnosis {
  /**
   * `false` when at least one problem is `critical`.
   *
   * Read it as "nothing detectable from inside the application is wrong", NOT
   * as "mail is arriving" — `limits` says why those are different, and it is
   * not a pedantic difference: the single most likely remaining fault after
   * the configuration is right (Postfix accepting mail it then cannot deliver)
   * is invisible here by construction.
   */
  ok: boolean;
  /**
   * What this check cannot establish, in the caller's own words. Always
   * populated, so a green result is never reported without its caveats.
   */
  limits: string[];
  checkedAt: string;
  nodeEnv: string;
  transport: {
    /** Raw `BOOKING_TRANSPORT`, exactly as configured — including an unrecognised value. */
    configured: string;
    /** `null` when the configured value is not one of the three understood ones. */
    kind: MailTransportKind | null;
    /** `false` means nothing leaves the process, whatever the rest of this response says. */
    delivers: boolean;
  };
  config: Record<string, ConfigEntry>;
  connection: MailConnectionCheck;
  history: MailHistory;
  problems: MailProblem[];
}

function entry(value: string | undefined, shape: 'address' | 'secret' | 'plain'): ConfigEntry {
  const trimmed = value?.trim();
  if (!trimmed) return { set: false };
  if (shape === 'address') return { set: true, domain: recipientDomain(trimmed) };
  if (shape === 'secret') return { set: true, length: trimmed.length };
  return { set: true, value: trimmed };
}

/** Own domain, so "delivery to outsiders is broken" can be told from "everything is broken". */
function ownDomain(): string | undefined {
  return (
    recipientDomain(process.env.BOOKING_NOTIFY_EMAIL ?? '') ??
    recipientDomain(process.env.SMTP_FROM_EMAIL ?? '') ??
    recipientDomain(process.env.RESEND_FROM_EMAIL ?? '')
  );
}

function inspectConfig(kind: MailTransportKind | null): Record<string, ConfigEntry> {
  const config: Record<string, ConfigEntry> = {
    BOOKING_NOTIFY_EMAIL: entry(process.env.BOOKING_NOTIFY_EMAIL, 'address'),
  };

  if (kind === 'smtp') {
    // Host and port are public information — they are in DNS. Printing them is
    // what makes "pointing at the wrong host" or "port 25 instead of 587"
    // visible at a glance.
    config.SMTP_HOST = entry(process.env.SMTP_HOST, 'plain');
    config.SMTP_PORT = entry(process.env.SMTP_PORT ?? '587', 'plain');
    config.SMTP_USER = entry(process.env.SMTP_USER, 'address');
    config.SMTP_PASS = entry(process.env.SMTP_PASS, 'secret');
    config.SMTP_FROM_EMAIL = entry(process.env.SMTP_FROM_EMAIL, 'address');
  }

  if (kind === 'resend') {
    config.RESEND_API_KEY = entry(process.env.RESEND_API_KEY, 'secret');
    config.RESEND_FROM_EMAIL = entry(process.env.RESEND_FROM_EMAIL, 'address');
  }

  return config;
}

function diagnoseTransport(kind: MailTransportKind | null, configured: string, problems: MailProblem[]): void {
  if (kind === null) {
    problems.push({
      code: 'transport_unrecognised',
      severity: 'critical',
      message: `BOOKING_TRANSPORT="${configured}" is not one of console, resend, smtp. No mail can be sent.`,
      fix: 'Correct the value in /opt/veysl/app/.env, then `docker compose up -d app`.',
    });
    return;
  }

  if (kind === 'console') {
    const inProduction = process.env.NODE_ENV === 'production';
    problems.push({
      code: 'transport_console',
      severity: inProduction ? 'critical' : 'info',
      message: inProduction
        ? 'BOOKING_TRANSPORT=console — every mail is written to the container log and NOTHING is sent. Neither the owner notification nor the customer confirmation leaves the machine. Enquiries are still saved (/admin → Anfragen).'
        : 'BOOKING_TRANSPORT=console — the development stand-in. Mail is printed, not sent.',
      fix: inProduction
        ? 'Set BOOKING_TRANSPORT=smtp with SMTP_HOST/PORT/USER/PASS/FROM_EMAIL (self-hosted mailserver, docs/MAIL-SELFHOSTED.md), or BOOKING_TRANSPORT=resend with RESEND_API_KEY/RESEND_FROM_EMAIL (docs/MAIL-SETUP.md). Then `docker compose up -d app` — the transport is cached per process, so a restart is required.'
        : undefined,
    });
  }
}

function diagnoseCredentials(
  kind: MailTransportKind | null,
  config: Record<string, ConfigEntry>,
  problems: MailProblem[]
): void {
  if (!config.BOOKING_NOTIFY_EMAIL.set) {
    problems.push({
      code: 'notify_email_missing',
      severity: 'critical',
      message: 'BOOKING_NOTIFY_EMAIL is not set — the owner notification has no recipient and throws before it is sent.',
      fix: 'Set BOOKING_NOTIFY_EMAIL=info@dj-veys.de in /opt/veysl/app/.env.',
    });
  }

  const required = kind === 'smtp'
    ? ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM_EMAIL']
    : kind === 'resend'
      ? ['RESEND_API_KEY', 'RESEND_FROM_EMAIL']
      : [];

  const missing = required.filter((name) => !config[name]?.set);
  if (missing.length > 0) {
    problems.push({
      code: 'credentials_missing',
      severity: 'critical',
      message: `BOOKING_TRANSPORT=${kind} but ${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} not set. The transport throws on construction, so both notifications are lost — the enquiry itself is still saved.`,
      fix: 'Fill the missing values in /opt/veysl/app/.env, then `docker compose up -d app`.',
    });
  }

  if (kind !== 'smtp') return;

  const port = Number(process.env.SMTP_PORT ?? 587);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    problems.push({
      code: 'smtp_port_invalid',
      severity: 'critical',
      message: `SMTP_PORT="${process.env.SMTP_PORT}" is not a valid port (a blank value becomes 0, because Number('') is 0).`,
      fix: 'Set SMTP_PORT=587 for authenticated submission.',
    });
  } else if (port === 25) {
    problems.push({
      code: 'smtp_port_25',
      severity: 'warning',
      message: 'SMTP_PORT=25 is the server-to-server delivery port, not the submission port. Authenticated submission belongs on 587 (or 465 for implicit TLS).',
      fix: 'Set SMTP_PORT=587.',
    });
  }
}

function diagnoseConnection(
  kind: MailTransportKind | null,
  connection: MailConnectionCheck,
  problems: MailProblem[]
): void {
  if (!connection.attempted || connection.ok) return;

  if (connection.code === 'EAUTH' || connection.responseCode === 535) {
    problems.push({
      code: 'connection_auth_rejected',
      severity: 'critical',
      message: `The mailserver rejected the login (${connection.code ?? connection.responseCode}): ${connection.message ?? ''}`.trim(),
      fix: 'SMTP_USER/SMTP_PASS do not match the mailbox. Reset it with `docker exec -it mailserver setup email update <address>` and update .env. Quote the value, and beware a `#` in the password — it ends the line in a .env file and silently truncates it.',
    });
    return;
  }

  if (['ETIMEDOUT', 'ECONNREFUSED', 'ESOCKET', 'EDNS', 'ENOTFOUND'].includes(connection.code ?? '')) {
    problems.push({
      code: 'connection_unreachable',
      severity: 'critical',
      message: `No connection to the mailserver (${connection.code}): ${connection.message ?? ''}`.trim(),
      fix: kind === 'smtp'
        ? 'Check the mail stack is running (`docker ps | grep mailserver`) and that SMTP_HOST/SMTP_PORT are reachable from the app container.'
        : undefined,
    });
    return;
  }

  problems.push({
    code: 'connection_failed',
    severity: 'critical',
    message: `The credential/reachability check failed: ${connection.message ?? 'no detail'}`,
  });
}

function diagnoseHistory(history: MailHistory, problems: MailProblem[]): void {
  const failed = history.attempts.filter((attempt) => attempt.outcome === 'failed');
  const domain = ownDomain();

  // The decisive pattern, and the reason recipient domains are recorded at
  // all: mail to our own domain is delivered locally by the same Postfix and
  // never touches the open internet, while a customer address needs outbound
  // TCP/25. Everything external failing while our own domain succeeds is that
  // exact split, not a coincidence.
  const externalFailures = failed.filter((attempt) => attempt.recipientDomain && attempt.recipientDomain !== domain);
  const internalAccepted = history.attempts.some(
    (attempt) => attempt.outcome === 'accepted' && attempt.recipientDomain === domain
  );

  if (externalFailures.length > 0 && internalAccepted) {
    const domains = [...new Set(externalFailures.map((attempt) => attempt.recipientDomain))].join(', ');
    problems.push({
      code: 'external_delivery_failing',
      severity: 'critical',
      message: `Mail to ${domain} is accepted but mail to external recipients (${domains}) is failing. That is the signature of a mailserver that delivers locally and cannot reach the outside world.`,
      fix: 'On the server: `docker exec mailserver postqueue -p` (queued = not delivered) and `docker exec mailserver nc -zv gmail-smtp-in.l.google.com 25`. A timeout means the provider blocks outbound TCP/25 — prerequisite 1 in docs/MAIL-SELFHOSTED.md, unblocked only by a support ticket.',
    });
  } else if (failed.length > 0) {
    problems.push({
      code: 'recent_failures',
      severity: 'critical',
      message: `${failed.length} notification${failed.length === 1 ? '' : 's'} failed since ${history.since}. Most recent: ${failed[failed.length - 1]?.error ?? 'no detail'}`,
    });
  }

  if (history.attempts.length === 0) {
    problems.push({
      code: 'no_traffic',
      severity: 'info',
      message: `No enquiry or contact message has been submitted since this container started (${history.since}), so the history proves nothing either way. The configuration and connection checks above still do.`,
    });
  }
}

/**
 * The blind spot, reported rather than left implicit.
 *
 * `accepted` means our own mailserver took the message for delivery. If
 * outbound TCP/25 is blocked — the default on this VPS provider, and
 * prerequisite 1 in docs/MAIL-SELFHOSTED.md — Postfix accepts every message,
 * queues it, and delivers none of it to an external recipient. Nothing the
 * application can observe distinguishes that from success: no exception, no
 * error code, an `accepted` outcome every time.
 *
 * That is precisely the reported symptom (owner mail arrives because
 * BOOKING_NOTIFY_EMAIL is a mailbox on the same Postfix and never leaves the
 * machine; the couple's confirmation does not). So a green result from this
 * endpoint alone must never be presented as "mail is arriving", and where real
 * messages have been accepted for external domains, the uncertainty is
 * concrete rather than theoretical and gets its own finding.
 */
function diagnoseDeliveryVisibility(
  kind: MailTransportKind | null,
  history: MailHistory,
  problems: MailProblem[]
): void {
  if (kind !== 'smtp') return;

  const domain = ownDomain();
  const externalAccepted = history.attempts.filter(
    (attempt) => attempt.outcome === 'accepted' && attempt.recipientDomain && attempt.recipientDomain !== domain
  );
  if (externalAccepted.length === 0) return;

  const domains = [...new Set(externalAccepted.map((attempt) => attempt.recipientDomain))].join(', ');
  problems.push({
    code: 'delivery_unverified',
    severity: 'info',
    message: `${externalAccepted.length} message(s) to external recipients (${domains}) were accepted by our own mailserver. Whether they were then delivered cannot be determined from here — a blocked outbound port 25 looks identical to success at this layer.`,
    fix: 'Run the mail-doctor workflow with the SSH secrets configured; its server job reads `postqueue -p` and tests outbound TCP/25, which is the only proof of delivery.',
  });
}

/**
 * The standing caveats on a green result. Kept as data rather than prose in a
 * comment so the workflow that renders this response cannot present `ok: true`
 * without them.
 */
function buildLimits(kind: MailTransportKind | null, history: MailHistory): string[] {
  const limits = [
    `The notification history is held in memory and starts empty at each restart (this process: ${history.since}). An empty history is not evidence of health.`,
    'A failed database write makes POST /api/anfrage answer 500 before mail is attempted. This check would still report the mail path as fine — it only ever looks at mail.',
  ];

  if (kind === 'smtp') {
    limits.push(
      'For SMTP, "accepted" means our own mailserver took the message — not that the recipient received it. If outbound TCP/25 is blocked, every message is accepted and none is delivered externally, and that is indistinguishable from success here. Only `postqueue -p` on the server can tell the difference.'
    );
  }
  if (kind === 'console') {
    limits.push('With the console transport active there is nothing to connect to, so the connection probe is skipped rather than failed.');
  }

  limits.push(
    'Deliverability is not checked here: correct SPF, DKIM, DMARC and rDNS decide whether a delivered mail lands in the inbox or in spam. The mail-doctor workflow checks those over DNS.'
  );
  return limits;
}

/**
 * Runs every check. Never throws — an unavailable transport is a finding, not
 * an error, and a diagnostic that 500s tells you nothing.
 */
export async function diagnoseMail(): Promise<MailDiagnosis> {
  const configured = (process.env.BOOKING_TRANSPORT ?? 'console').trim() || 'console';

  let kind: MailTransportKind | null = null;
  try {
    kind = getMailTransportKind();
  } catch {
    // Left null; `diagnoseTransport` reports it as `transport_unrecognised`.
  }

  const problems: MailProblem[] = [];
  const config = inspectConfig(kind);

  diagnoseTransport(kind, configured, problems);
  diagnoseCredentials(kind, config, problems);

  // Skipped when a credential is already known to be missing: the transport
  // constructor would throw, and reporting that as a connection failure on top
  // of the credential problem is one cause presented as two.
  const skipConnection = kind === null || kind === 'console' || problems.some((p) => p.code === 'credentials_missing');
  const connection: MailConnectionCheck = skipConnection
    ? { attempted: false, ok: false }
    : await checkMailConnection();
  diagnoseConnection(kind, connection, problems);

  const history = getMailHistory();
  diagnoseHistory(history, problems);
  diagnoseDeliveryVisibility(kind, history, problems);

  return {
    ok: !problems.some((problem) => problem.severity === 'critical'),
    limits: buildLimits(kind, history),
    checkedAt: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV ?? 'unknown',
    transport: { configured, kind, delivers: kind === 'resend' || kind === 'smtp' },
    config,
    connection,
    history,
    problems,
  };
}
