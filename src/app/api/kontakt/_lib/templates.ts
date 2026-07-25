/**
 * Plain-text email bodies for `/api/kontakt`. Same rationale as
 * `src/app/api/anfrage/_lib/templates.ts`: backend transactional copy, not
 * UI strings, so deliberately not routed through `messages/*.json`.
 */
import { localeTags, type Locale } from '@/i18n/routing';
import { site } from '@/content/site';
import type { ContactMessageOutput } from '@/lib/contact';

function formatSubmittedAt(locale: Locale): string {
  return new Intl.DateTimeFormat(localeTags[locale], {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
}

const SUBJECT_LABELS_DE: Record<ContactMessageOutput['subject'], string> = {
  general: 'Allgemeine Frage',
  booking: 'Frage zu einer Buchung',
  technical: 'Technik / Verleih',
  partnership: 'Location- / Planer-Partnerschaft',
  press: 'Presse',
  other: 'Sonstiges',
};

const PREFERRED_CONTACT_LABELS_DE: Record<NonNullable<ContactMessageOutput['preferredContact']>, string> = {
  email: 'E-Mail',
  phone: 'Telefon',
  whatsapp: 'WhatsApp',
};

export interface EmailContent {
  subject: string;
  text: string;
}

/** Internal notification to the DJ — always German, always full detail. */
export function buildContactOwnerNotification(message: ContactMessageOutput, locale: Locale): EmailContent {
  const lines = [
    `Neue Kontaktnachricht — ${SUBJECT_LABELS_DE[message.subject]}`,
    '',
    `Name: ${message.firstName} ${message.lastName}`,
    `E-Mail: ${message.email}`,
    message.phone ? `Telefon: ${message.phone}` : undefined,
    message.company ? `Firma / Location: ${message.company}` : undefined,
    message.preferredContact
      ? `Bevorzugter Kontaktweg: ${PREFERRED_CONTACT_LABELS_DE[message.preferredContact]}`
      : undefined,
    message.eventDate ? `Genanntes Datum: ${message.eventDate}` : undefined,
    `Sprache der Seite: ${locale}`,
    `Eingegangen: ${formatSubmittedAt('de')}`,
    '',
    'Nachricht:',
    message.message,
  ].filter((line): line is string => line !== undefined);

  return {
    subject: `[Kontakt] ${SUBJECT_LABELS_DE[message.subject]} — ${message.firstName} ${message.lastName}`,
    text: lines.join('\n'),
  };
}

const CONTACT_REPLY: Record<Locale, (args: { name: string }) => EmailContent> = {
  de: ({ name }) => ({
    subject: `Ihre Nachricht bei ${site.name} ist angekommen`,
    text: [
      `Hallo ${name},`,
      '',
      'vielen Dank für Ihre Nachricht. Wir melden uns so schnell wie möglich persönlich bei Ihnen zurück.',
      '',
      `Schneller geht es per WhatsApp: https://wa.me/${site.contact.whatsapp}`,
      `Oder per Telefon: ${site.contact.phone}`,
      '',
      'Herzliche Grüße',
      site.owner,
    ].join('\n'),
  }),
  en: ({ name }) => ({
    subject: `Your message to ${site.name} has arrived`,
    text: [
      `Hi ${name},`,
      '',
      "thank you for your message. We'll get back to you personally as soon as possible.",
      '',
      `WhatsApp is even faster: https://wa.me/${site.contact.whatsapp}`,
      `Or call: ${site.contact.phone}`,
      '',
      'Best regards',
      site.owner,
    ].join('\n'),
  }),
  tr: ({ name }) => ({
    subject: `${site.name} mesajınız ulaştı`,
    text: [
      `Merhaba ${name},`,
      '',
      'mesajınız için teşekkür ederiz. En kısa sürede size şahsen dönüş yapacağız.',
      '',
      `En hızlısı WhatsApp: https://wa.me/${site.contact.whatsapp}`,
      `Ya da telefon: ${site.contact.phone}`,
      '',
      'Saygılarımızla',
      site.owner,
    ].join('\n'),
  }),
  fr: ({ name }) => ({
    subject: `Votre message à ${site.name} est bien arrivé`,
    text: [
      `Bonjour ${name},`,
      '',
      'merci pour votre message. Nous vous répondrons personnellement dès que possible.',
      '',
      `Le plus rapide reste WhatsApp : https://wa.me/${site.contact.whatsapp}`,
      `Ou par téléphone : ${site.contact.phone}`,
      '',
      'Cordialement',
      site.owner,
    ].join('\n'),
  }),
  es: ({ name }) => ({
    subject: `Tu mensaje a ${site.name} ha llegado`,
    text: [
      `Hola ${name},`,
      '',
      'gracias por tu mensaje. Te responderemos personalmente lo antes posible.',
      '',
      `Por WhatsApp es aún más rápido: https://wa.me/${site.contact.whatsapp}`,
      `O llama al: ${site.contact.phone}`,
      '',
      'Un cordial saludo',
      site.owner,
    ].join('\n'),
  }),
  // TODO(kunde): Kurmanji-Text von einer Muttersprachlerin/einem Muttersprachler
  // prüfen lassen, bevor er live geht (gleiche Vorsicht wie in anfrage/_lib/templates.ts).
  ku: ({ name }) => ({
    subject: `Peyama we ya li ${site.name} gihîşt`,
    text: [
      `Silav ${name},`,
      '',
      'spas ji bo peyama we. Em ê di zûtirîn dem de bi we re bersivê bidin.',
      '',
      `Riya herî zû WhatsApp e: https://wa.me/${site.contact.whatsapp}`,
      `An jî telefon bikin: ${site.contact.phone}`,
      '',
      'Bi rêz',
      site.owner,
    ].join('\n'),
  }),
  // TODO(kunde): Nederlandse tekst laten nakijken door een moedertaalspreker
  // vóór livegang (zelfde voorzichtigheid als bij het Koerdisch hierboven).
  nl: ({ name }) => ({
    subject: `Uw bericht aan ${site.name} is binnengekomen`,
    text: [
      `Hallo ${name},`,
      '',
      'bedankt voor uw bericht. We nemen zo snel mogelijk persoonlijk contact met u op.',
      '',
      `Sneller gaat het via WhatsApp: https://wa.me/${site.contact.whatsapp}`,
      `Of telefonisch: ${site.contact.phone}`,
      '',
      'Met vriendelijke groet',
      site.owner,
    ].join('\n'),
  }),
};

/** Confirmation to the sender, in the locale they submitted from. */
export function buildContactConfirmation(message: ContactMessageOutput, locale: Locale): EmailContent {
  return CONTACT_REPLY[locale]({ name: message.firstName });
}
