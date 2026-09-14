// Bedienung per Telegram: eine Such-URL schicken statt sich einzuloggen.
//
// Erlaubt sind nur Nachrichten aus dem konfigurierten Chat. Der Bot ist ueber
// seinen Namen oeffentlich auffindbar, und ohne diese Pruefung koennte jeder
// Fremde die Suchen lesen, aendern und loeschen.

import { addWatch, listWatches, removeWatch, updateWatch } from './manage.mjs';
import { fetchAds } from './kleinanzeigen.mjs';
import { matchesFilters, withFilterDefaults } from './config.mjs';
import { escapeHtml } from './telegram.mjs';

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
  '  <code>takt 30</code> — alle 30 s statt 60 (min. 30)',
  '',
  '<b>Befehle</b>',
  '  /list — meine Suchen, mit Tasten für Takt, Text und Löschen',
  '  /takt &lt;id&gt; 30 — Abstand aendern',
  '  /text &lt;id&gt; …  — Erstnachricht fuer diese Suche',
  '  /help — diese Hilfe',
  '',
  'Am schnellsten geht alles ueber /list: unter jeder Suche stehen',
  '⏱ Takt, ✏️ Text und 🗑 Löschen.',
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

  // "takt 30" oder "alle 30" direkt beim Anlegen — spart den Umweg ueber /list.
  const takt = rest.match(/\b(?:takt|alle)\s+(\d+)\s*(?:s|sek|sekunden)?\b/);
  if (takt) options.intervalSeconds = Number(takt[1]);

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

async function handleAdd(text, { configPath, telegram, timeoutMs }) {
  const url = extractUrl(text);
  const options = parseOptions(text);

  let watch;
  try {
    ({ watch } = await addWatch(configPath, url, options));
  } catch (err) {
    await telegram.sendText(`⚠️ ${escapeHtml(err.message)}`);
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
  await telegram.sendText(lines.join('\n'));
  return true;
}

/** Auswahl fuer den Takt. Bewusst Tasten statt Tippen — das hier passiert am Telefon. */
const TAKTE = [30, 60, 120, 300, 900];

function watchCard(w) {
  const vorlage = w.messageTemplate
    ? `\n✏️ <i>${escapeHtml(w.messageTemplate.slice(0, 90))}${w.messageTemplate.length > 90 ? '…' : ''}</i>`
    : w.messageTemplate === ''
      ? '\n✏️ <i>keine Vorlage (Kopiertext aus)</i>'
      : '';
  return [
    `<b>${escapeHtml(w.label ?? w.id)}</b>`,
    `${escapeHtml(describeFilters(w.filters))}  ·  alle ${w.intervalSeconds ?? 60}s`,
    `<a href="${escapeHtml(w.url)}">Suche oeffnen</a>${vorlage}`,
  ].join('\n');
}

function watchButtons(id) {
  return [
    [
      { text: '⏱ Takt', callback_data: `takt:${id}` },
      { text: '✏️ Text', callback_data: `text:${id}` },
      { text: '🗑 Löschen', callback_data: `rm:${id}` },
    ],
  ];
}

async function handleList(configPath, telegram) {
  const watches = await listWatches(configPath);
  if (watches.length === 0) {
    await telegram.sendText('Noch keine Suche. Schick mir eine Such-URL von kleinanzeigen.de.');
    return;
  }

  // Eine Nachricht je Suche, damit die Tasten eindeutig dazugehoeren.
  await telegram.sendText(`<b>${watches.length} Suche(n)</b>`);
  for (const w of watches) {
    await telegram.sendText(watchCard(w), { buttons: watchButtons(w.id) });
  }
}

/**
 * Zeigt die Taktauswahl in derselben Nachricht.
 *
 * Der Umweg ueber Tasten statt einer Eingabe ist Absicht: eine Zahl auf einer
 * Telefontastatur zu tippen, um dann die id danebenzuschreiben, ist genau die
 * Art Reibung, wegen der man sich sonst doch wieder einloggt.
 */
async function showTaktChoices(id, { configPath, telegram, callbackId, messageId }) {
  const watch = (await listWatches(configPath)).find((w) => w.id === id);
  if (!watch) {
    await telegram.answerCallback(callbackId, 'Suche gibt es nicht mehr');
    return false;
  }
  await telegram.answerCallback(callbackId);
  await telegram.editText(messageId, watchCard(watch), {
    buttons: [
      TAKTE.map((s) => ({
        text: (s === (watch.intervalSeconds ?? 60) ? '• ' : '') + (s < 60 ? `${s}s` : `${s / 60}min`),
        callback_data: `takt:${id}:${s}`,
      })),
      [{ text: '‹ zurück', callback_data: `card:${id}` }],
    ],
  });
  return false;
}

async function setTakt(id, sekunden, { configPath, telegram, callbackId, messageId }) {
  try {
    const watch = await updateWatch(configPath, id, { intervalSeconds: Number(sekunden) });
    await telegram.answerCallback(callbackId, `alle ${sekunden}s`);
    await telegram.editText(messageId, watchCard(watch), { buttons: watchButtons(id) });
    return true;
  } catch (err) {
    await telegram.answerCallback(callbackId, 'Ging nicht');
    await telegram.sendText(`⚠️ ${escapeHtml(err.message)}`);
    return false;
  }
}

async function showCard(id, { configPath, telegram, callbackId, messageId }) {
  const watch = (await listWatches(configPath)).find((w) => w.id === id);
  await telegram.answerCallback(callbackId);
  if (watch) await telegram.editText(messageId, watchCard(watch), { buttons: watchButtons(id) });
  return false;
}

/**
 * Fragt die neue Vorlage per Antwort ab.
 *
 * Die id steht am Ende der Frage (`#<id>`) und wird aus der zitierten
 * Nachricht zurueckgelesen. Ein Merkzettel im Arbeitsspeicher waere kuerzer,
 * ginge aber bei jedem Neustart verloren — und dann liefe die Antwort des
 * Nutzers ins Leere, ohne dass er versteht, warum.
 */
async function askForTemplate(id, { configPath, telegram, callbackId }) {
  const watch = (await listWatches(configPath)).find((w) => w.id === id);
  if (!watch) {
    await telegram.answerCallback(callbackId, 'Suche gibt es nicht mehr');
    return false;
  }
  await telegram.answerCallback(callbackId);
  await telegram.sendText(
    [
      `✏️ <b>Neuer Text für „${escapeHtml(watch.label ?? id)}"</b>`,
      '',
      'Antworte auf diese Nachricht mit dem Text.',
      'Platzhalter: <code>{title}</code> <code>{price}</code> <code>{location}</code>',
      '',
      '<code>-</code> schaltet den Kopiertext für diese Suche ab,',
      '<code>*</code> stellt den allgemeinen wieder her.',
      '',
      `<i>#${escapeHtml(id)}</i>`,
    ].join('\n'),
    { forceReply: true },
  );
  return false;
}

/** Liest die id aus der zitierten Frage zurueck. */
function watchIdFromReply(message) {
  const zitiert = message.reply_to_message?.text ?? '';
  return zitiert.match(/#([A-Za-z0-9_.~:@+-]{1,200})\s*$/)?.[1] ?? null;
}

async function applyTemplateReply(message, { configPath, telegram }) {
  const id = watchIdFromReply(message);
  if (!id) return false;

  const eingabe = message.text.trim();
  const patch =
    eingabe === '-' ? { messageTemplate: '' } : eingabe === '*' ? { messageTemplate: null } : { messageTemplate: eingabe };

  try {
    const watch = await updateWatch(configPath, id, patch);
    const wie =
      eingabe === '-'
        ? 'Kopiertext für diese Suche aus.'
        : eingabe === '*'
          ? 'Wieder der allgemeine Text.'
          : 'Text gesetzt.';
    await telegram.sendText(`✅ ${wie}`);
    await telegram.sendText(watchCard(watch), { buttons: watchButtons(id) });
    return true;
  } catch (err) {
    await telegram.sendText(`⚠️ ${escapeHtml(err.message)}`);
    return false;
  }
}

/**
 * `/takt <id> <sekunden>` und `/text <id> <vorlage>` — der getippte Weg.
 *
 * Die Tasten aus /list sind bequemer, aber ohne diesen Weg gaebe es keinen,
 * einer Suche einen Text zu geben, ohne vorher /list aufzurufen.
 */
async function handleEditCommand(command, text, { configPath, telegram }) {
  const [, id, ...rest] = text.split(/\s+/);
  const wert = text.slice(text.indexOf(id) + (id?.length ?? 0)).trim();

  if (!id) {
    const ids = (await listWatches(configPath)).map((w) => w.id);
    await telegram.sendText(
      [
        command === '/takt'
          ? 'So: <code>/takt &lt;id&gt; 60</code>'
          : 'So: <code>/text &lt;id&gt; Hallo, ist {title} noch da?</code>',
        '',
        ids.length ? 'Deine Suchen:\n' + ids.map((i) => '<code>' + escapeHtml(i) + '</code>').join('\n') : 'Noch keine Suche.',
        '',
        'Bequemer geht es mit /list und den Tasten darunter.',
      ].join('\n'),
    );
    return false;
  }

  try {
    if (command === '/takt') {
      if (!rest.length) throw new Error('Es fehlt die Anzahl Sekunden.');
      const watch = await updateWatch(configPath, id, { intervalSeconds: rest[0] });
      await telegram.sendText(`✅ <b>${escapeHtml(watch.label ?? id)}</b> läuft jetzt alle ${watch.intervalSeconds}s.`);
    } else {
      const vorlage = wert === '-' ? '' : wert === '*' ? null : wert;
      if (vorlage !== null && vorlage !== '' && vorlage.length < 5) {
        throw new Error('Das ist sehr kurz für eine Erstnachricht — sicher? Sonst „-" zum Abschalten.');
      }
      const watch = await updateWatch(configPath, id, { messageTemplate: vorlage });
      await telegram.sendText(`✅ Text für <b>${escapeHtml(watch.label ?? id)}</b> gesetzt.`);
    }
    return true;
  } catch (err) {
    await telegram.sendText(`⚠️ ${escapeHtml(err.message)}`);
    return false;
  }
}

async function handleRemove(id, { configPath, telegram, callbackId, messageId }) {
  try {
    const removed = await removeWatch(configPath, id);
    await telegram.answerCallback(callbackId, 'Gelöscht');
    if (messageId) {
      await telegram.editText(messageId, `🗑 <s>${escapeHtml(removed.label ?? removed.id)}</s>`);
    }
    return true;
  } catch (err) {
    await telegram.answerCallback(callbackId, 'Ging nicht');
    await telegram.sendText(`⚠️ ${escapeHtml(err.message)}`);
    return false;
  }
}

/**
 * Verarbeitet ein einzelnes Update.
 * Gibt true zurueck, wenn sich die Konfiguration geaendert hat.
 */
export async function handleUpdate(update, ctx) {
  const { telegram, configPath, timeoutMs, log } = ctx;
  const owner = String(telegram.chatId);

  const callback = update.callback_query;
  if (callback) {
    if (String(callback.message?.chat?.id) !== owner) {
      log?.(`Tastendruck aus fremdem Chat ${callback.message?.chat?.id} verworfen.`);
      return false;
    }
    const data = String(callback.data ?? '');
    const ctx2 = {
      configPath,
      telegram,
      callbackId: callback.id,
      messageId: callback.message?.message_id,
    };

    if (data.startsWith('rm:')) return handleRemove(data.slice(3), ctx2);
    if (data.startsWith('card:')) return showCard(data.slice(5), ctx2);
    if (data.startsWith('text:')) return askForTemplate(data.slice(5), ctx2);
    if (data.startsWith('takt:')) {
      // takt:<id>            -> Auswahl zeigen
      // takt:<id>:<sekunden> -> setzen
      const rest = data.slice(5);
      const trenner = rest.lastIndexOf(':');
      if (trenner === -1) return showTaktChoices(rest, ctx2);
      return setTakt(rest.slice(0, trenner), rest.slice(trenner + 1), ctx2);
    }

    await telegram.answerCallback(callback.id);
    return false;
  }

  const message = update.message;
  if (!message?.text) return false;
  if (String(message.chat?.id) !== owner) {
    log?.(`Nachricht aus fremdem Chat ${message.chat?.id} verworfen.`);
    return false;
  }

  const text = message.text.trim();
  const command = text.split(/\s+/)[0].toLowerCase().replace(/@.*$/, '');

  // Antwort auf die Vorlagen-Frage? Muss vor allem anderen geprueft werden,
  // sonst landet ein Vorlagentext mit einer URL darin beim Anlegen einer Suche.
  if (message.reply_to_message && watchIdFromReply(message)) {
    return applyTemplateReply(message, { configPath, telegram });
  }

  if (command === '/start' || command === '/help') {
    await telegram.sendText(HELP);
    return false;
  }
  if (command === '/list') {
    await handleList(configPath, telegram);
    return false;
  }
  if (command === '/takt' || command === '/text') {
    return handleEditCommand(command, text, { configPath, telegram });
  }
  if (extractUrl(text)) {
    return handleAdd(text, { configPath, telegram, timeoutMs });
  }

  await telegram.sendText(
    'Damit kann ich nichts anfangen. Schick mir eine Such-URL von kleinanzeigen.de, oder /help.',
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
