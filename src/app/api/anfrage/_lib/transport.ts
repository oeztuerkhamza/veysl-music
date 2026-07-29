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
import { createTransport, type Transporter } from 'nodemailer';
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

/**
 * SMTP über nodemailer — der Weg für den selbst gehosteten Mailserver aus
 * `docs/MAIL-SELFHOSTED.md`. Ohne diesen Transport gäbe es dort überhaupt
 * keinen Versandweg: Resend ist ein externer Anbieter, und das eigene
 * Postfach ist per SMTP erreichbar, nicht per REST.
 *
 * Anders als bei Resend wird hier eine Bibliothek benutzt statt `fetch`
 * (CONTRACT §2 verlangt Zurückhaltung bei Abhängigkeiten). Begründung: Resend
 * ist genau ein POST, SMTP dagegen ist ein zustandsbehaftetes Protokoll mit
 * STARTTLS-Aushandlung, AUTH-Mechanismen, Dot-Stuffing und MIME-/UTF-8-
 * Kodierung. Das von Hand zu schreiben, wäre auf dem geschäftskritischsten
 * Pfad der Seite die falsche Sparsamkeit.
 *
 * Der Transporter wird pro Instanz einmal gebaut; nodemailer hält den Pool
 * selbst offen. Wirft bei jedem Fehlschlag — dieselbe Bedingung, auf die sich
 * `EnquiryTransport.notifyOwner` verlässt.
 */
class SmtpMailSender implements MailSender {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM_EMAIL;
    // Früh und deutlich scheitern, exakt wie bei Resend: ein Transport ohne
    // Zugangsdaten würde sonst erst beim ersten echten Lead auffallen.
    if (!host) throw new Error('BOOKING_TRANSPORT=smtp, aber SMTP_HOST ist nicht gesetzt (siehe .env.example)');
    if (!user) throw new Error('BOOKING_TRANSPORT=smtp, aber SMTP_USER ist nicht gesetzt (siehe .env.example)');
    if (!pass) throw new Error('BOOKING_TRANSPORT=smtp, aber SMTP_PASS ist nicht gesetzt (siehe .env.example)');
    if (!from) throw new Error('BOOKING_TRANSPORT=smtp, aber SMTP_FROM_EMAIL ist nicht gesetzt (siehe .env.example)');

    const port = Number(process.env.SMTP_PORT ?? 587);
    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
      throw new Error(`SMTP_PORT ist kein gültiger Port: ${process.env.SMTP_PORT}`);
    }

    this.from = from;
    this.transporter = createTransport({
      host,
      port,
      // Nur 465 ist "implicit TLS". Auf 587 startet die Verbindung im Klartext
      // und wird per STARTTLS hochgestuft — `secure: true` auf 587 zu setzen
      // lässt den Handshake hängen, bis das Zeitlimit greift.
      secure: port === 465,
      // Auf 587 ist unverschlüsselter Versand keine akzeptable Rückfallebene:
      // hier gehen Klarnamen, Telefonnummern und Hochzeitsdaten über die
      // Leitung. Lieber scheitern als im Klartext ausliefern.
      requireTLS: port !== 465,
      auth: { user, pass },
      connectionTimeout: SEND_TIMEOUT_MS,
      greetingTimeout: SEND_TIMEOUT_MS,
      socketTimeout: SEND_TIMEOUT_MS,
      // Ohne das bleibt die Namensauflösung bei nodemailers Standard von 30 s
      // und läuft *vor* `connectionTimeout` — das Zeitlimit oben würde also
      // erst greifen, nachdem schon 30 s vergangen sind, und der Handler
      // hinge dreimal so lange wie beabsichtigt.
      dnsTimeout: SEND_TIMEOUT_MS,
      // Der Kommentar oben verspricht einen offenen Pool; ohne dieses Flag
      // baut nodemailer für jede einzelne Mail eine neue Verbindung samt
      // TLS-Handshake und AUTH auf. Zwei Mails pro Anfrage (Betreiber +
      // Bestätigung) sind damit zwei komplette Anmeldungen statt einer.
      pool: true,
      maxConnections: 3,
    });
  }

  async send(message: MailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      ...(message.replyTo ? { replyTo: message.replyTo } : {}),
    });
  }
}

/**
 * Über den ganzen Prozess hinweg genau eine Instanz — sonst ist der
 * Verbindungspool aus `SmtpMailSender` wirkungslos: Jede Anfrage baute ihren
 * eigenen Transporter samt eigenem Pool, benutzte ihn für zwei Mails und warf
 * ihn weg.
 *
 * Bewusst nur im Erfolgsfall zwischengespeichert. Ein fehlgeschlagener
 * Konstruktor (fehlende Zugangsdaten) wird nicht festgehalten, damit die
 * Fehlermeldung bei jedem Versuch erneut im Log steht, statt einmal
 * aufzutauchen und dann zu verschwinden.
 */
let cachedSender: MailSender | undefined;

/** Selects the underlying mail sender via `BOOKING_TRANSPORT` (defaults to the console stand-in). Shared by both `EnquiryTransport` and `ContactTransport`. */
function getMailSender(): MailSender {
  if (cachedSender) return cachedSender;

  const kind = process.env.BOOKING_TRANSPORT ?? 'console';
  const sender: MailSender =
    kind === 'resend' ? new ResendMailSender() : kind === 'smtp' ? new SmtpMailSender() : new ConsoleMailSender();

  cachedSender = sender;
  return sender;
}

/**
 * Wirft, wenn `BOOKING_NOTIFY_EMAIL` fehlt, statt einen Platzhalter
 * zurückzugeben. Vorher stand hier der Text
 * `'(BOOKING_NOTIFY_EMAIL not set — see .env.example)'` — der wurde als
 * Empfängeradresse an den Versand durchgereicht. Bei `console` fiel das nicht
 * auf, bei Resend/SMTP wird eine solche Adresse abgewiesen, und übrig blieb
 * eine Fehlermeldung über ungültige Syntax, die nicht verrät, dass schlicht
 * eine Variable fehlt.
 *
 * Werfen ist hier gefahrlos: beide Routen fangen den Fehlschlag des
 * Versands ab, nachdem die Anfrage gespeichert wurde, und melden ihn als
 * `ownerNotified: false`.
 */
function ownerRecipient(): string {
  const recipient = process.env.BOOKING_NOTIFY_EMAIL;
  if (!recipient) throw new Error('BOOKING_NOTIFY_EMAIL ist nicht gesetzt — die Benachrichtigung hat keinen Empfänger (siehe .env.example)');
  return recipient;
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
