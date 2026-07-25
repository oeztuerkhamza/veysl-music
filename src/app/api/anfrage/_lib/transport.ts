/**
 * Delivery is pluggable so swapping the "console" stand-in for a real
 * provider (Resend, SMTP, ...) later touches only this file (and whichever
 * new `*MailSender` class you add) — callers only ever talk to the
 * `EnquiryTransport`/`ContactTransport` interfaces below.
 *
 * Both the `/anfrage` booking funnel and the `/kontakt` general contact form
 * share the same low-level `MailSender` (the actual "how do we send an
 * email" plumbing and the `BOOKING_TRANSPORT` env var that selects it) —
 * that's the "one mail path" the two features reuse — while keeping
 * separate higher-level interfaces/templates, since an enquiry and a
 * contact message genuinely have a different shape and different triage.
 */
import type { Locale } from '@/i18n/routing';
import type { EnquiryOutput } from '@/lib/booking';
import type { ContactMessageOutput } from '@/lib/contact';
import { buildContactConfirmation, buildContactOwnerNotification } from '../../kontakt/_lib/templates';
import type { LeadScore } from './lead-score';
import { buildCustomerAutoReply, buildOwnerNotification } from './templates';

export interface EnquiryContext {
  enquiry: EnquiryOutput;
  score: LeadScore;
  locale: Locale;
  submittedAt: string;
}

export interface EnquiryTransport {
  /**
   * Deliver the business-critical notification to the DJ. Must be awaited
   * and its failure treated as fatal by the caller — a lead that never
   * reaches the owner is a lost booking.
   */
  notifyOwner(ctx: EnquiryContext): Promise<void>;
  /**
   * Deliver the customer's auto-reply. Nice-to-have: caller should log a
   * failure here but not fail the whole request over it.
   */
  sendCustomerAutoReply(ctx: EnquiryContext): Promise<void>;
}

export interface ContactMessageContext {
  message: ContactMessageOutput;
  locale: Locale;
  submittedAt: string;
}

export interface ContactTransport {
  /** Notify the owner of a new `/kontakt` message. `ownerEmail` is resolved by the caller from `getSite().contact.email` — never hardcoded here. */
  notifyOwner(ctx: ContactMessageContext, ownerEmail: string): Promise<void>;
  /** Short confirmation to the sender, in the locale they submitted from. Best-effort — never blocks the request. */
  sendConfirmation(ctx: ContactMessageContext): Promise<void>;
}

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  /** Set on owner-facing notifications so a reply goes straight to the sender, not to the no-reply/console sink. */
  replyTo?: string;
}

interface MailSender {
  send(message: MailMessage): Promise<void>;
}

/**
 * Dev/staging stand-in — there are no email credentials yet (see
 * `.env.example` at the repo root for what a real deployment needs).
 *
 * This intentionally prints the full email body, personal data included:
 * it stands in for an actual email being sent, so redacting it here would
 * defeat its purpose as a way to eyeball what customers/the owner receive.
 * Do NOT point `BOOKING_TRANSPORT` at "console" in production — swap in a
 * real transport (Resend/SMTP) before launch so PII doesn't end up in
 * server/process logs.
 */
class ConsoleMailSender implements MailSender {
  async send(message: MailMessage): Promise<void> {
    console.log(
      `\n----- [ConsoleTransport] -----\nTo: ${message.to}${message.replyTo ? `\nReply-To: ${message.replyTo}` : ''}\nSubject: ${message.subject}\n\n${message.text}\n---------------------------------------------------\n`
    );
  }
}

/** Zeitlimit für einen einzelnen Sendeversuch. Ohne das kann ein hängender Request den Handler blockieren, bis die Plattform ihn abschneidet. */
const SEND_TIMEOUT_MS = 10_000;

/**
 * Resend über die REST-API — bewusst mit `fetch` statt dem `resend`-SDK:
 * es geht um genau einen POST, und `.claude/CONTRACT.md` verlangt, keine
 * Abhängigkeit ohne Not aufzunehmen.
 *
 * Wirft bei jedem Fehlschlag. Das ist die Bedingung, auf die sich
 * `EnquiryTransport.notifyOwner` verlässt: eine Anfrage, die den DJ nicht
 * erreicht, muss laut scheitern statt still verloren zu gehen.
 */
class ResendMailSender implements MailSender {
  private readonly apiKey: string;
  private readonly from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    // Früh und deutlich scheitern: ein Transport, der ohne Zugangsdaten
    // gebaut wird, würde sonst erst beim ersten echten Lead auffallen.
    if (!apiKey) throw new Error('BOOKING_TRANSPORT=resend, aber RESEND_API_KEY ist nicht gesetzt (siehe .env.example)');
    if (!from) throw new Error('BOOKING_TRANSPORT=resend, aber RESEND_FROM_EMAIL ist nicht gesetzt (siehe .env.example)');
    this.apiKey = apiKey;
    this.from = from;
  }

  async send(message: MailMessage): Promise<void> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.from,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        // Resends REST-Feld heißt snake_case, anders als im SDK.
        ...(message.replyTo ? { reply_to: [message.replyTo] } : {}),
      }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });

    if (!response.ok) {
      // Fehlertext mitnehmen, aber nie den Body der Mail — der enthält
      // personenbezogene Daten und landet sonst im Log.
      const detail = await response.text().catch(() => '');
      throw new Error(`Resend antwortete ${response.status}: ${detail.slice(0, 300)}`);
    }
  }
}

/** Selects the underlying mail sender via `BOOKING_TRANSPORT` (defaults to the console stand-in). Shared by both `EnquiryTransport` and `ContactTransport`. */
function getMailSender(): MailSender {
  const kind = process.env.BOOKING_TRANSPORT ?? 'console';
  switch (kind) {
    case 'resend':
      return new ResendMailSender();
    // Future: case 'smtp': return new SmtpMailSender();
    case 'console':
    default:
      return new ConsoleMailSender();
  }
}

function ownerRecipient(): string {
  return process.env.BOOKING_NOTIFY_EMAIL ?? '(BOOKING_NOTIFY_EMAIL not set — see .env.example)';
}

/**
 * Antwortadresse für die Auto-Antwort an das Paar. `undefined`, solange
 * `BOOKING_NOTIFY_EMAIL` fehlt — der Platzhalter aus `ownerRecipient()` ist
 * keine gültige Adresse und würde als Reply-To-Header von Resend abgelehnt.
 */
function ownerReplyTo(): string | undefined {
  return process.env.BOOKING_NOTIFY_EMAIL || undefined;
}

class MailEnquiryTransport implements EnquiryTransport {
  constructor(private readonly sender: MailSender) {}

  async notifyOwner(ctx: EnquiryContext): Promise<void> {
    const { subject, text } = buildOwnerNotification(ctx.enquiry, ctx.score, ctx.locale);
    await this.sender.send({ to: ownerRecipient(), subject, text, replyTo: ctx.enquiry.email });
  }

  async sendCustomerAutoReply(ctx: EnquiryContext): Promise<void> {
    const { subject, text } = buildCustomerAutoReply(ctx.enquiry, ctx.locale);
    // Ohne Reply-To antwortet das Paar an die no-reply-Absenderadresse und
    // die Antwort verschwindet — docs/MAIL-SETUP.md, Schritt 4.
    await this.sender.send({ to: ctx.enquiry.email, subject, text, replyTo: ownerReplyTo() });
  }
}

class MailContactTransport implements ContactTransport {
  constructor(private readonly sender: MailSender) {}

  async notifyOwner(ctx: ContactMessageContext, ownerEmail: string): Promise<void> {
    const { subject, text } = buildContactOwnerNotification(ctx.message, ctx.locale);
    await this.sender.send({ to: ownerEmail, subject, text, replyTo: ctx.message.email });
  }

  async sendConfirmation(ctx: ContactMessageContext): Promise<void> {
    const { subject, text } = buildContactConfirmation(ctx.message, ctx.locale);
    await this.sender.send({ to: ctx.message.email, subject, text });
  }
}

export function getEnquiryTransport(): EnquiryTransport {
  return new MailEnquiryTransport(getMailSender());
}

export function getContactTransport(): ContactTransport {
  return new MailContactTransport(getMailSender());
}
