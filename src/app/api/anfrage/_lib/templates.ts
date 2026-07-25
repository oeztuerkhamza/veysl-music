/**
 * Plain-text email bodies for the two notifications the enquiry route sends.
 * Deliberately NOT wired through `messages/*.json`: these are backend
 * transactional templates (one always-German internal notification, one
 * customer-facing auto-reply in the enquiry's locale), not UI copy. Keeping
 * them here as plain functions is what makes swapping in Resend/react-email
 * later a one-file change (see `transport.ts`).
 */
import { localeTags, type Locale } from '@/i18n/routing';
import { site } from '@/content/site';
import type { EnquiryOutput } from '@/lib/booking';
import type { LeadScore } from './lead-score';

function formatEventDate(iso: string, locale: Locale): string {
  const date = new Date(`${iso}T00:00:00`);
  // Kurdish (Kurmanji) has no dedicated ICU locale data in Node's ICU build;
  // Intl falls back gracefully, but German is the safer, unambiguous choice
  // for the always-German owner notification specifically (see call below).
  return new Intl.DateTimeFormat(localeTags[locale], { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}

// Internal-only label maps for the owner's German notification — separate
// from messages/de.json on purpose (see file header).
const EVENT_TYPE_LABELS_DE: Record<EnquiryOutput['eventType'], string> = {
  wedding: 'Hochzeit',
  engagement: 'Verlobung / Nişan',
  henna: 'Henna-Abend / Kına',
  afterparty: 'After-Party',
  corporate: 'Firmenevent',
  birthday: 'Geburtstag / Jubiläum',
  other: 'Sonstiges',
};

const BUDGET_LABELS_DE: Record<NonNullable<EnquiryOutput['budget']>, string> = {
  unsure: 'noch unklar',
  a: 'bis 1.500 €',
  b: '1.500 – 2.500 €',
  c: '2.500 – 4.000 €',
  d: 'über 4.000 €',
};

const PACKAGE_LABELS_DE: Record<NonNullable<EnquiryOutput['package']>, string> = {
  essential: 'Essential',
  signature: 'Signature',
  prestige: 'Prestige',
  custom: 'Individuell / noch unsicher',
};

const SOURCE_LABELS_DE: Record<NonNullable<EnquiryOutput['source']>, string> = {
  google: 'Google-Suche',
  instagram: 'Instagram',
  recommendation: 'Empfehlung',
  venue: 'Location / Planerin',
  ai: 'ChatGPT / KI-Assistent',
  other: 'Sonstiges',
};

const SERVICE_LABELS_DE: Record<NonNullable<EnquiryOutput['services']>[number], string> = {
  dj: 'DJ & Musik',
  hosting: 'Moderation',
  liveMusic: 'Live-Musik (Saz & Gitarre)',
  avRental: 'Ton-/Licht-/Veranstaltungstechnik',
};

const HOSTING_LANGUAGE_LABELS_DE: Record<NonNullable<EnquiryOutput['hostingLanguage']>, string> = {
  noPreference: 'keine Präferenz',
  de: 'Deutsch',
  tr: 'Türkisch',
  en: 'Englisch',
};

export interface EmailContent {
  subject: string;
  text: string;
}

/**
 * Internal notification to the DJ — always German, always full detail
 * (this IS the working document he triages leads from, not a diagnostic log).
 */
export function buildOwnerNotification(enquiry: EnquiryOutput, score: LeadScore, locale: Locale): EmailContent {
  const dateLabel = formatEventDate(enquiry.eventDate, 'de');
  const tierLabel = { hot: 'HEISS', warm: 'WARM', cold: 'KALT' }[score.tier];

  const lines = [
    `Neue Anfrage — Priorität: ${tierLabel} (Score ${score.score})`,
    '',
    `Termin: ${dateLabel} (${enquiry.eventDate})`,
    `Anlass: ${EVENT_TYPE_LABELS_DE[enquiry.eventType]}`,
    `Stadt: ${enquiry.city}`,
    enquiry.venue ? `Location: ${enquiry.venue}` : undefined,
    enquiry.guests !== undefined ? `Gäste: ${enquiry.guests}` : 'Gäste: keine Angabe',
    enquiry.startTime || enquiry.endTime ? `Zeit: ${enquiry.startTime ?? '?'} – ${enquiry.endTime ?? '?'}` : undefined,
    enquiry.package ? `Interessantes Paket: ${PACKAGE_LABELS_DE[enquiry.package]}` : undefined,
    enquiry.budget ? `Budget: ${BUDGET_LABELS_DE[enquiry.budget]}` : 'Budget: keine Angabe',
    enquiry.services && enquiry.services.length > 0
      ? `Leistungen: ${enquiry.services.map((s) => SERVICE_LABELS_DE[s]).join(', ')}`
      : undefined,
    enquiry.hostingLanguage ? `Moderationssprache: ${HOSTING_LANGUAGE_LABELS_DE[enquiry.hostingLanguage]}` : undefined,
    '',
    `Name: ${enquiry.firstName} ${enquiry.lastName}`,
    enquiry.partnerName ? `Partner/in: ${enquiry.partnerName}` : undefined,
    `E-Mail: ${enquiry.email}`,
    `Telefon: ${enquiry.phone}`,
    enquiry.source ? `Gefunden über: ${SOURCE_LABELS_DE[enquiry.source]}` : undefined,
    `Anfragesprache der Seite: ${locale}`,
    '',
    enquiry.message ? `Nachricht:\n${enquiry.message}` : undefined,
    '',
    'Score-Begründung:',
    ...score.reasons.map((r) => `- ${r}`),
  ].filter((line): line is string => line !== undefined);

  return {
    subject: `[${tierLabel}] Neue Anfrage: ${EVENT_TYPE_LABELS_DE[enquiry.eventType]} am ${enquiry.eventDate} — ${enquiry.firstName} ${enquiry.lastName}`,
    text: lines.join('\n'),
  };
}

const CUSTOMER_REPLY: Record<
  Locale,
  (args: { name: string; dateLabel: string; whatsappUrl: string }) => EmailContent
> = {
  de: ({ name, dateLabel, whatsappUrl }) => ({
    subject: `Ihre Anfrage bei ${site.name} ist angekommen`,
    text: [
      `Hallo ${name},`,
      '',
      `vielen Dank für Ihre Anfrage zu Ihrem Termin am ${dateLabel}.`,
      `Sie erhalten innerhalb von 24 Stunden eine persönliche Rückmeldung von ${site.owner}.`,
      '',
      `Schneller geht es per WhatsApp: ${whatsappUrl}`,
      `Oder per Telefon: ${site.contact.phone}`,
      '',
      'Herzliche Grüße',
      site.owner,
    ].join('\n'),
  }),
  en: ({ name, dateLabel, whatsappUrl }) => ({
    subject: `Your enquiry with ${site.name} has arrived`,
    text: [
      `Hi ${name},`,
      '',
      `thank you for your enquiry about your date on ${dateLabel}.`,
      `You'll receive a personal reply from ${site.owner} within 24 hours.`,
      '',
      `WhatsApp is even faster: ${whatsappUrl}`,
      `Or call: ${site.contact.phone}`,
      '',
      'Best regards',
      site.owner,
    ].join('\n'),
  }),
  tr: ({ name, dateLabel, whatsappUrl }) => ({
    subject: `${site.name} talebiniz ulaştı`,
    text: [
      `Merhaba ${name},`,
      '',
      `${dateLabel} tarihiniz için talebiniz için teşekkür ederiz.`,
      `24 saat içinde ${site.owner} tarafından size dönüş yapılacaktır.`,
      '',
      `En hızlısı WhatsApp: ${whatsappUrl}`,
      `Ya da telefon: ${site.contact.phone}`,
      '',
      'Saygılarımızla',
      site.owner,
    ].join('\n'),
  }),
  fr: ({ name, dateLabel, whatsappUrl }) => ({
    subject: `Votre demande auprès de ${site.name} est bien arrivée`,
    text: [
      `Bonjour ${name},`,
      '',
      `merci pour votre demande concernant votre date du ${dateLabel}.`,
      `Vous recevrez une réponse personnelle de ${site.owner} sous 24 heures.`,
      '',
      `Le plus rapide reste WhatsApp : ${whatsappUrl}`,
      `Ou par téléphone : ${site.contact.phone}`,
      '',
      'Cordialement',
      site.owner,
    ].join('\n'),
  }),
  es: ({ name, dateLabel, whatsappUrl }) => ({
    subject: `Tu solicitud a ${site.name} ha llegado`,
    text: [
      `Hola ${name},`,
      '',
      `gracias por tu solicitud para tu fecha del ${dateLabel}.`,
      `Recibirás una respuesta personal de ${site.owner} en un plazo de 24 horas.`,
      '',
      `Por WhatsApp es aún más rápido: ${whatsappUrl}`,
      `O llama al: ${site.contact.phone}`,
      '',
      'Un cordial saludo',
      site.owner,
    ].join('\n'),
  }),
  // TODO(kunde): Kurmanji-Text unten von einer Muttersprachlerin/einem
  // Muttersprachler prüfen lassen, bevor er live geht — dieselbe Vorsicht wie
  // bei den kurdischen Slugs in src/i18n/routing.ts.
  ku: ({ name, dateLabel, whatsappUrl }) => ({
    subject: `Daxwaza we ya li ${site.name} gihîşt`,
    text: [
      `Silav ${name},`,
      '',
      `spas ji bo daxwaza we ya bo dîroka ${dateLabel}.`,
      `Hûn ê di nav 24 saetan de ji ${site.owner} bersiveke kesane wergirin.`,
      '',
      `Riya herî zû WhatsApp e: ${whatsappUrl}`,
      `An jî telefon bikin: ${site.contact.phone}`,
      '',
      'Bi rêz',
      site.owner,
    ].join('\n'),
  }),
  // TODO(kunde): Nederlandse tekst laten nakijken door een moedertaalspreker
  // vóór livegang — zelfde voorzichtigheid als bij het Koerdisch hierboven.
  nl: ({ name, dateLabel, whatsappUrl }) => ({
    subject: `Uw aanvraag bij ${site.name} is binnengekomen`,
    text: [
      `Hallo ${name},`,
      '',
      `bedankt voor uw aanvraag voor uw datum op ${dateLabel}.`,
      `U ontvangt binnen 24 uur een persoonlijke reactie van ${site.owner}.`,
      '',
      `Sneller gaat het via WhatsApp: ${whatsappUrl}`,
      `Of telefonisch: ${site.contact.phone}`,
      '',
      'Met vriendelijke groet',
      site.owner,
    ].join('\n'),
  }),
};

/** Customer-facing auto-reply, in the locale the enquiry was submitted from. */
export function buildCustomerAutoReply(enquiry: EnquiryOutput, locale: Locale): EmailContent {
  const dateLabel = formatEventDate(enquiry.eventDate, locale);
  const whatsappUrl = `https://wa.me/${site.contact.whatsapp}`;
  return CUSTOMER_REPLY[locale]({ name: enquiry.firstName, dateLabel, whatsappUrl });
}
