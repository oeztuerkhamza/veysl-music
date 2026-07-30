/**
 * One notification attempt: send it, record what happened for
 * `GET /api/health/mail`, and report whether it actually went out.
 *
 * Shared by `/api/anfrage` (owner + customer) and `/api/kontakt` (owner +
 * sender) because the rule that is easiest to get wrong is the same in all
 * four places, and it is not obvious: **a `send()` that resolves does not
 * mean a mail was sent.** The `console` transport prints and resolves. Four
 * copies of that reasoning is four chances to reintroduce
 * `ownerNotified: true` on a deployment that mails nobody.
 */
import type { MailChannel } from '@/lib/mail-health';
import { recipientDomain, recordMailAttempt } from '@/lib/mail-health';

/** The part of `EnquiryTransport`/`ContactTransport` this helper needs — structural, so it accepts both. */
interface NotifyingTransport {
  readonly kind: string;
  readonly delivers: boolean;
}

export interface NotificationAttempt {
  channel: MailChannel;
  transport: NotifyingTransport;
  /** Recipient address. Only its domain is ever recorded or logged. */
  recipient: string;
  /** Log prefix, e.g. `[anfrage] owner notification`. */
  label: string;
  send: () => Promise<void>;
}

/**
 * Returns `true` only when the message was handed to a transport that really
 * delivers. Never throws — a failed notification must not take down a
 * request whose enquiry is already persisted.
 */
export async function runNotification({
  channel,
  transport,
  recipient,
  label,
  send,
}: NotificationAttempt): Promise<boolean> {
  const domain = recipientDomain(recipient);

  try {
    await send();
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    recordMailAttempt({ channel, outcome: 'failed', transport: transport.kind, recipientDomain: domain, error });
    // Domain, never the address — the address is personal data. A run of
    // failures that all share an external domain while dj-veys.de succeeds is
    // the signature of a mailserver that delivers locally but cannot reach
    // the outside world (docs/MAIL-SELFHOSTED.md, prerequisite 1).
    console.error(`${label} failed — recipient domain=${domain ?? '(unparsable)'}`, error);
    return false;
  }

  if (!transport.delivers) {
    // The console stand-in already logged its own "NOT SENT" line; recording
    // the outcome is what makes it visible over HTTP as well.
    recordMailAttempt({ channel, outcome: 'suppressed', transport: transport.kind, recipientDomain: domain });
    return false;
  }

  recordMailAttempt({ channel, outcome: 'accepted', transport: transport.kind, recipientDomain: domain });
  return true;
}

/**
 * Records that no notification was even attempted because the transport could
 * not be constructed — a missing credential, or an unrecognised
 * `BOOKING_TRANSPORT`. Called with every channel the request would have used.
 */
export function recordTransportUnavailable(channels: readonly MailChannel[], error: string): void {
  const transport = (process.env.BOOKING_TRANSPORT ?? 'console').trim() || 'console';
  for (const channel of channels) {
    recordMailAttempt({ channel, outcome: 'suppressed', transport, error });
  }
}
