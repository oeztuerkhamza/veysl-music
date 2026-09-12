// Bedienung per Telegram: eine Such-URL schicken statt sich einzuloggen.
//
// Erlaubt sind nur Nachrichten aus dem konfigurierten Chat. Der Bot ist ueber
// seinen Namen oeffentlich auffindbar, und ohne diese Pruefung koennte jeder
// Fremde die Suchen lesen, aendern und loeschen.

import { addWatch, listWatches, removeWatch } from './manage.mjs';
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
  '',
  '<b>Befehle</b>',
  '  /list — meine Suchen, mit Loeschtaste',
  '  /help — diese Hilfe',
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

async function handleList(configPath, telegram) {
  const watches = await listWatches(configPath);
  if (watches.length === 0) {
    await telegram.sendText('Noch keine Suche. Schick mir eine Such-URL von kleinanzeigen.de.');
    return;
  }

  // Eine Nachricht je Suche, damit die Loeschtaste eindeutig dazugehoert.
  await telegram.sendText(`<b>${watches.length} Suche(n)</b>`);
  for (const w of watches) {
    const text = [
      `<b>${escapeHtml(w.label ?? w.id)}</b>`,
      `${escapeHtml(describeFilters(w.filters))}  ·  alle ${w.intervalSeconds ?? 60}s`,
      `<a href="${escapeHtml(w.url)}">Suche oeffnen</a>`,
    ].join('\n');
    await telegram.sendText(text, {
      buttons: [[{ text: '🗑 Löschen', callback_data: `rm:${w.id}` }]],
    });
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
    if (data.startsWith('rm:')) {
      return handleRemove(data.slice(3), {
        configPath,
        telegram,
        callbackId: callback.id,
        messageId: callback.message?.message_id,
      });
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

  if (command === '/start' || command === '/help') {
    await telegram.sendText(HELP);
    return false;
  }
  if (command === '/list') {
    await handleList(configPath, telegram);
    return false;
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
