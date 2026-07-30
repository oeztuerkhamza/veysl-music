/**
 * In-process record of what the mail path actually did — the piece that makes
 * "why did no enquiry mail arrive?" answerable from outside the server.
 *
 * Every failure on that path is already logged by `/api/anfrage` and
 * `/api/kontakt`, but reading a `console.error` means `docker logs` on the
 * VPS, which needs SSH, which is exactly what nobody has to hand at the
 * moment an enquiry goes missing. `GET /api/health/mail` reads this buffer
 * instead, so a scheduled GitHub Actions run can report the same facts.
 *
 * Deliberately in-memory and deliberately small:
 *   - It resets on every container restart. That is a real limitation and the
 *     health endpoint reports `since` so a reader can tell an empty buffer
 *     ("nothing has been submitted since the last deploy") apart from a
 *     healthy one. Persisting this would mean a Payload collection, a
 *     migration and a write on the booking path — cost out of proportion to
 *     a diagnostic, and the DB write that matters (the enquiry itself) is
 *     already there.
 *   - Only outcomes are kept, never message content. The recipient is reduced
 *     to its domain (`gmail.com`), which is what makes the decisive pattern —
 *     every external domain fails while `dj-veys.de` succeeds, the signature
 *     of a mailserver that delivers locally but cannot reach the outside
 *     world — readable without putting a single customer address into a
 *     diagnostic endpoint or a CI log.
 */

/** Which of the four notifications this was. Named so a reader needs no cross-reference. */
export type MailChannel =
  | 'anfrage:owner'
  | 'anfrage:customer'
  | 'kontakt:owner'
  | 'kontakt:sender';

export type MailOutcome =
  /**
   * The transport accepted the message. For SMTP that means *our own* mail
   * server took it for delivery — NOT that it reached the recipient. A
   * message sitting in the Postfix queue because outbound TCP/25 is blocked
   * is recorded here as `accepted`, and only the queue on the server can
   * tell the difference (see docs/MAIL-SELFHOSTED.md).
   */
  | 'accepted'
  /** The transport threw — no message left the process. */
  | 'failed'
  /**
   * Nothing was even attempted: no transport could be built, or the active
   * transport is the `console` stand-in, which prints and sends nothing.
   * A silent no-op is the failure mode this whole module exists to expose,
   * so it gets its own outcome rather than being filed under success.
   */
  | 'suppressed';

export interface MailAttempt {
  at: string;
  channel: MailChannel;
  outcome: MailOutcome;
  /** Recipient domain only — never the address. `undefined` if unparsable. */
  recipientDomain?: string;
  /** Which transport was active, so a config change is visible in the history. */
  transport: string;
  /** Truncated error message. Never the message body. */
  error?: string;
}

/**
 * Two days of a quiet site's enquiries, and small enough that the whole
 * buffer fits in one glance of a CI job summary.
 */
const MAX_ATTEMPTS = 25;
/** Long enough to identify an SMTP failure, short enough not to smuggle a mail body into the log. */
const MAX_ERROR_LENGTH = 300;

const attempts: MailAttempt[] = [];
const since = new Date().toISOString();

/**
 * Domain part of an address — the only part of it safe to record.
 *
 * Handles both bare (`a@b.de`) and display-name (`DJ Veys <a@b.de>`) forms,
 * because the same helper reads `SMTP_FROM_EMAIL`/`RESEND_FROM_EMAIL`, which
 * are written in the second form. A `split('@')[1]` would return `b.de>` for
 * those and no domain comparison would ever match.
 */
export function recipientDomain(email: string): string | undefined {
  return /@([^\s>@]+)/.exec(email)?.[1]?.toLowerCase();
}

export function recordMailAttempt(attempt: Omit<MailAttempt, 'at'>): void {
  attempts.push({
    ...attempt,
    at: new Date().toISOString(),
    error: attempt.error?.slice(0, MAX_ERROR_LENGTH),
  });
  if (attempts.length > MAX_ATTEMPTS) attempts.splice(0, attempts.length - MAX_ATTEMPTS);
}

export interface MailHistory {
  /** Process start, i.e. how far back an empty history actually proves anything. */
  since: string;
  counts: Record<MailOutcome, number>;
  /** Newest last. */
  attempts: readonly MailAttempt[];
}

export function getMailHistory(): MailHistory {
  const counts: Record<MailOutcome, number> = { accepted: 0, failed: 0, suppressed: 0 };
  for (const attempt of attempts) counts[attempt.outcome] += 1;
  return { since, counts, attempts: [...attempts] };
}
