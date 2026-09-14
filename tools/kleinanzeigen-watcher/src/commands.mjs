// Bedienung per Telegram: eine Such-URL schicken statt sich einzuloggen.
//
// Erlaubt ist nur, wer auf der Liste steht: der Besitzer (telegram.chatId) und
// die von ihm per /user aufgenommenen Kennungen. Der Bot ist ueber seinen
// Namen oeffentlich auffindbar — ohne diese Pruefung koennte jeder Fremde die
// Suchen lesen, aendern und loeschen. Jeder Aufgenommene hat nur die Rechte,
// die der Besitzer ihm gegeben hat.

import {
  addUser,
  addWatch,
  listUsers,
  listWatches,
  removeUser,
  removeWatch,
  setUserRights,
} from './manage.mjs';
import { fetchAds } from './kleinanzeigen.mjs';
import { matchesFilters, withFilterDefaults } from './config.mjs';
import { escapeHtml } from './telegram.mjs';
import {
  DEFAULT_RIGHTS,
  describeRights,
  may,
  parseRights,
  resolveActor,
} from './users.mjs';

const HELP = [
  '<b>Kleinanzeigen-Watcher</b>',
  '',
  'Schick mir einfach eine Such-URL von kleinanzeigen.de — ich beobachte sie',
  'und melde jede neue Anzeige.',
  '',
  '<b>Zusaetze hinter der URL</b> (alle freiwillig):',
  '  <code>max 300</code> — hoechstens 300 €',
  '  <code>min 50</code> — mindestens 50 €',
  '  <code>privat</code> — keine gewerblichen Anbieter',
  '  <code>ohne defekt,bastler</code> — Titel-Stoppwoerter',
  '',
  '<b>Befehle</b>',
  '  /list — meine Suchen, mit Loeschtaste',
  '  /help — diese Hilfe',
].join('\n');

const OWNER_HELP = [
  '',
  '<b>Nur fuer dich: wer darf mitreden</b>',
  '  /user — die Liste, mit Entfernentaste',
  '  /user add 123456789 Name — aufnehmen (darf erstmal nur ansehen)',
  '  /user add 123456789 Name rechte: ansehen,anlegen — gleich mit Rechten',
  '  /user rechte 123456789 ansehen,anlegen,loeschen — Rechte aendern',
  '  /user del 123456789 — wieder entfernen',
  '',
  'Die Kennung sieht man, sobald jemand dem Bot schreibt — der Versuch steht',
  'im Log. Wer nicht auf der Liste steht, bekommt keine Antwort.',
].join('\n');

/** Findet die erste Kleinanzeigen-URL in einem Text. */
function extractUrl(text) {
  const match = text.match(/https?:\/\/(?:www\.)?kleinanzeigen\.de\/\S+/i);
  return match ? match[0] : null;
}

/**
 * Liest die Zusaetze hinter der URL. Bewusst in Worten statt in Flags: das
 * hier wird auf einem Telefon getippt, und `--max-price` ist dort eine Zumutung.
 */
export function parseOptions(text) {
  const options = {};
  const rest = text.replace(/https?:\/\/\S+/gi, ' ').toLowerCase();

  const max = rest.match(/\bmax\w*\s+(\d+)/);
  if (max) options.maxPrice = Number(max[1]);

  const min = rest.match(/\bmin\w*\s+(\d+)/);
  if (min) options.minPrice = Number(min[1]);

  if (/\bprivat\b/.test(rest)) options.privateOnly = true;

  const without = rest.match(/\bohne\s+([a-z0-9äöüß,\s-]+)/);
  if (without) {
    options.exclude = without[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return options;
}

function describeFilters(filters = {}) {
  const parts = [];
  if (filters.minPrice != null) parts.push(`ab ${filters.minPrice} €`);
  if (filters.maxPrice != null) parts.push(`bis ${filters.maxPrice} €`);
  if (filters.titleMustInclude?.length) parts.push(`nur mit: ${filters.titleMustInclude.join('/')}`);
  if (filters.titleExclude?.length) parts.push(`ohne: ${filters.titleExclude.join('/')}`);
  if (filters.skipCommercial) parts.push('nur privat');
  return parts.length > 0 ? parts.join(', ') : 'keine Filter';
}

async function handleAdd(text, { configPath, telegram, timeoutMs, reply }) {
  const url = extractUrl(text);
  const options = parseOptions(text);

  let watch;
  try {
    ({ watch } = await addWatch(configPath, url, options));
  } catch (err) {
    await telegram.sendText(`⚠️ ${escapeHtml(err.message)}`, reply);
    return false;
  }

  const lines = [
    `✅ <b>${escapeHtml(watch.label)}</b>`,
    `${escapeHtml(describeFilters(watch.filters))}  ·  alle ${watch.intervalSeconds}s`,
  ];

  // Sofort nachsehen. Eine Suche, die nichts findet oder deren Filter alles
  // wegwerfen, faellt sonst erst dadurch auf, dass tagelang nichts kommt.
  try {
    const ads = await fetchAds(watch.url, { timeoutMs });
    const passing = ads.filter((ad) => matchesFilters(ad, withFilterDefaults(watch.filters)));
    lines.push(`Gerade auf Seite 1: ${ads.length} Anzeigen, ${passing.length} nach Filter.`);
    if (ads.length > 0 && passing.length === 0) {
      lines.push('⚠️ Die Filter lassen gerade nichts durch.');
    }
  } catch (err) {
    lines.push(`⚠️ Probeabruf fehlgeschlagen: ${escapeHtml(err.message)}`);
  }

  lines.push('', 'Die vorhandenen Anzeigen melde ich nicht — nur, was ab jetzt neu dazukommt.');
  await telegram.sendText(lines.join('\n'), reply);
  return true;
}

async function handleList(configPath, telegram, actor, reply) {
  const watches = await listWatches(configPath);
  if (watches.length === 0) {
    await telegram.sendText(
      may(actor, 'add')
        ? 'Noch keine Suche. Schick mir eine Such-URL von kleinanzeigen.de.'
        : 'Noch keine Suche eingerichtet.',
      reply,
    );
    return;
  }

  // Eine Nachricht je Suche, damit die Loeschtaste eindeutig dazugehoert.
  await telegram.sendText(`<b>${watches.length} Suche(n)</b>`, reply);
  for (const w of watches) {
    const text = [
      `<b>${escapeHtml(w.label ?? w.id)}</b>`,
      `${escapeHtml(describeFilters(w.filters))}  ·  alle ${w.intervalSeconds ?? 60}s`,
      `<a href="${escapeHtml(w.url)}">Suche oeffnen</a>`,
    ].join('\n');
    // Die Loeschtaste nur, wer auch loeschen darf — sonst bietet der Bot etwas
    // an, das er gleich darauf verweigert.
    await telegram.sendText(text, {
      ...reply,
      ...(may(actor, 'remove')
        ? { buttons: [[{ text: '🗑 Löschen', callback_data: `rm:${w.id}` }]] }
        : {}),
    });
  }
}

async function handleRemove(id, { configPath, telegram, callbackId, messageId, reply }) {
  try {
    const removed = await removeWatch(configPath, id);
    await telegram.answerCallback(callbackId, 'Gelöscht');
    if (messageId) {
      await telegram.editText(messageId, `🗑 <s>${escapeHtml(removed.label ?? removed.id)}</s>`, reply);
    }
    return true;
  } catch (err) {
    await telegram.answerCallback(callbackId, 'Ging nicht');
    await telegram.sendText(`⚠️ ${escapeHtml(err.message)}`, reply);
    return false;
  }
}

function describeUser(user) {
  const name = user.name ? `${escapeHtml(user.name)} · ` : '';
  return `<b>${name}<code>${escapeHtml(user.id)}</code></b>\n${escapeHtml(describeRights(user.rights))}`;
}

/**
 * /user — die Erlaubnisliste. Nur der Besitzer kommt hier herein; wer selbst
 * aufgenommen wurde, soll nicht weitere Leute nachholen koennen.
 *
 *   /user                                 die Liste
 *   /user add 123456789 Ali               aufnehmen, Grundrechte
 *   /user add 123456789 Ali rechte: alle  aufnehmen, mit Rechten
 *   /user rechte 123456789 ansehen,anlegen
 *   /user del 123456789
 */
async function handleUsers(text, { configPath, telegram, reply }) {
  const [, action, rawId, ...rest] = text.split(/\s+/);
  const verb = (action ?? '').toLowerCase();

  if (!verb || verb === 'list' || verb === 'liste') {
    const users = await listUsers(configPath);
    if (users.length === 0) {
      await telegram.sendText(
        ['Ausser dir darf niemand.', '', 'Aufnehmen: <code>/user add 123456789 Name</code>'].join('\n'),
        reply,
      );
      return false;
    }
    await telegram.sendText(`<b>${users.length} weitere(r) Berechtigte(r)</b>`, reply);
    for (const user of users) {
      await telegram.sendText(describeUser(user), {
        ...reply,
        buttons: [[{ text: '🚫 Entfernen', callback_data: `urm:${user.id}` }]],
      });
    }
    return false;
  }

  // Rechte stehen hinter "rechte:" bzw. "rights:"; alles davor ist der Name.
  const tail = rest.join(' ');
  const split = tail.match(/^(.*?)(?:\b(?:rechte|rights|recht)\s*:?\s*(.+))?$/is) ?? [];
  const name = (split[1] ?? '').trim() || null;
  const rightsWords = split[2]?.trim() ?? null;

  try {
    if (verb === 'add' || verb === 'neu') {
      let rights = DEFAULT_RIGHTS;
      if (rightsWords) {
        rights = parseRights(rightsWords);
        if (!rights) throw new Error(`Unbekannte Rechte: "${rightsWords}". Moeglich: ansehen, anlegen, loeschen, alle.`);
      }
      const user = await addUser(configPath, rawId, { name, rights });
      await telegram.sendText(`✅ Aufgenommen\n${describeUser(user)}`, reply);
      return false;
    }

    if (verb === 'del' || verb === 'remove' || verb === 'raus') {
      const removed = await removeUser(configPath, rawId);
      await telegram.sendText(
        `🚫 Entfernt: <code>${escapeHtml(removed.id)}</code>${removed.name ? ` (${escapeHtml(removed.name)})` : ''}`,
        reply,
      );
      return false;
    }

    if (verb === 'rechte' || verb === 'rights' || verb === 'recht') {
      // Hier ist alles hinter der Kennung eine Rechteangabe — ein Name stuende
      // beim Aendern nur im Weg.
      const rights = parseRights(tail);
      if (!rights) {
        throw new Error(`Unbekannte Rechte: "${tail}". Moeglich: ansehen, anlegen, loeschen, alle.`);
      }
      const user = await setUserRights(configPath, rawId, rights);
      await telegram.sendText(`✅ Geaendert\n${describeUser(user)}`, reply);
      return false;
    }
  } catch (err) {
    await telegram.sendText(`⚠️ ${escapeHtml(err.message)}`, reply);
    return false;
  }

  await telegram.sendText(OWNER_HELP, reply);
  return false;
}

/**
 * Verarbeitet ein einzelnes Update.
 * Gibt true zurueck, wenn sich die Konfiguration geaendert hat.
 */
export async function handleUpdate(update, ctx) {
  const { telegram, configPath, timeoutMs, log } = ctx;

  const source = update.callback_query ?? update.message;
  const chatId = (update.callback_query?.message ?? update.message)?.chat?.id;
  const actor = resolveActor({
    ownerChatId: telegram.chatId,
    // Frisch aus der Datei: eine gerade vergebene Erlaubnis soll sofort
    // gelten, nicht erst nach einem Neustart des Watchers.
    users: await listUsers(configPath),
    fromId: source?.from?.id,
    chatId,
  });

  if (!actor) {
    // Keine Antwort an Fremde: sie wuerde nur verraten, dass hier jemand
    // zuhoert. Ins Log gehoert es trotzdem — dort steht die Kennung, die der
    // Besitzer braucht, um jemanden aufzunehmen.
    const who = source?.from?.id ?? chatId;
    const name = [source?.from?.first_name, source?.from?.username].filter(Boolean).join(' @');
    log?.(`Nicht erlaubt: Kennung ${who}${name ? ` (${name})` : ''} — aufnehmen mit: /user add ${who}`);
    return false;
  }

  const reply = { chatId };

  const callback = update.callback_query;
  if (callback) {
    const data = String(callback.data ?? '');
    if (data.startsWith('rm:')) {
      if (!may(actor, 'remove')) {
        await telegram.answerCallback(callback.id, 'Dafuer fehlt dir das Recht.');
        return false;
      }
      return handleRemove(data.slice(3), {
        configPath,
        telegram,
        callbackId: callback.id,
        messageId: callback.message?.message_id,
        reply,
      });
    }
    if (data.startsWith('urm:')) {
      if (!actor.isOwner) {
        await telegram.answerCallback(callback.id, 'Das darf nur der Besitzer.');
        return false;
      }
      try {
        const removed = await removeUser(configPath, data.slice(4));
        await telegram.answerCallback(callback.id, 'Entfernt');
        if (callback.message?.message_id) {
          await telegram.editText(
            callback.message.message_id,
            `🚫 <s><code>${escapeHtml(removed.id)}</code></s>`,
            reply,
          );
        }
      } catch (err) {
        await telegram.answerCallback(callback.id, 'Ging nicht');
        await telegram.sendText(`⚠️ ${escapeHtml(err.message)}`, reply);
      }
      return false;
    }
    await telegram.answerCallback(callback.id);
    return false;
  }

  const message = update.message;
  if (!message?.text) return false;

  const text = message.text.trim();
  const command = text.split(/\s+/)[0].toLowerCase().replace(/@.*$/, '');

  if (command === '/start' || command === '/help') {
    await telegram.sendText(actor.isOwner ? `${HELP}\n${OWNER_HELP}` : HELP, reply);
    return false;
  }
  if (command === '/user' || command === '/users') {
    if (!actor.isOwner) {
      await telegram.sendText('Wer mitmachen darf, entscheidet nur der Besitzer.', reply);
      return false;
    }
    return handleUsers(text, { configPath, telegram, reply });
  }
  if (command === '/list') {
    if (!may(actor, 'list')) {
      await telegram.sendText('Dafuer fehlt dir das Recht.', reply);
      return false;
    }
    await handleList(configPath, telegram, actor, reply);
    return false;
  }
  if (extractUrl(text)) {
    if (!may(actor, 'add')) {
      await telegram.sendText('Du darfst keine Suchen anlegen.', reply);
      return false;
    }
    return handleAdd(text, { configPath, telegram, timeoutMs, reply });
  }

  await telegram.sendText(
    'Damit kann ich nichts anfangen. Schick mir eine Such-URL von kleinanzeigen.de, oder /help.',
    reply,
  );
  return false;
}

/**
 * Lauscht dauerhaft auf Befehle. Ruft `onConfigChanged`, sobald eine Suche
 * dazugekommen oder verschwunden ist, damit der Watcher sie sofort
 * beruecksichtigt statt erst nach einem Neustart.
 */
export async function pollCommands(ctx, abortSignal) {
  const { telegram, log, onConfigChanged } = ctx;
  let offset;
  let quietFailures = 0;

  while (!abortSignal.aborted) {
    try {
      const updates = await telegram.getUpdates(offset);
      quietFailures = 0;

      for (const update of updates) {
        // Vor dem Verarbeiten hochzaehlen: ein Befehl, an dem der Bot
        // scheitert, darf nicht bei jedem Durchlauf erneut ankommen.
        offset = update.update_id + 1;
        try {
          if (await handleUpdate(update, ctx)) await onConfigChanged?.();
        } catch (err) {
          log?.(`Befehl fehlgeschlagen: ${err.message}`);
        }
      }
    } catch (err) {
      if (abortSignal.aborted) return;
      // Ein abgebrochenes Long Polling ist der Normalfall, kein Vorfall.
      quietFailures++;
      if (quietFailures === 1 || quietFailures % 10 === 0) {
        log?.(`Befehlsabruf: ${err.message}`);
      }
      await new Promise((r) => setTimeout(r, Math.min(quietFailures * 2000, 30_000)));
    }
  }
}
