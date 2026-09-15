// Bedienung per Telegram: eine Such-URL schicken statt sich einzuloggen.
//
// Erlaubt ist nur, wer auf der Liste steht: der Besitzer (telegram.chatId) und
// die von ihm per /user aufgenommenen Kennungen. Der Bot ist ueber seinen
// Namen oeffentlich auffindbar — ohne diese Pruefung koennte jeder Fremde die
// Suchen lesen, aendern und loeschen. Jeder Aufgenommene hat nur die Rechte,
// die der Besitzer ihm gegeben hat.

import {
  MIN_INTERVAL_SECONDS,
  addUser,
  addWatch,
  listUsers,
  listWatches,
  removeUser,
  removeWatch,
  setUserRights,
  updateWatch,
} from './manage.mjs';
import { fetchAds } from './kleinanzeigen.mjs';
import { matchesFilters, withFilterDefaults } from './config.mjs';
import { escapeHtml, replyTo } from './telegram.mjs';
import { DEFAULT_RIGHTS, describeRights, may, parseRights, resolveActor } from './users.mjs';

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
  '  <code>takt 30</code> — alle 30 s statt 60 (min. 10)',
  '',
  '<b>Befehle</b>',
  '  /list — meine Suchen, mit Tasten für Takt, Text und Löschen',
  '  /schnell — alle Suchen auf den schnellsten Takt',
  '  /takt &lt;id&gt; 30 — Abstand aendern',
  '  /text &lt;id&gt; …  — Erstnachricht fuer diese Suche',
  '  /help — diese Hilfe',
  '',
  'Am schnellsten geht alles ueber /list: unter jeder Suche stehen',
  '⏱ Takt, ✏️ Text und 🗑 Löschen.',
].join('\n');

const OWNER_HELP = [
  '',
  '<b>Nur fuer dich: wer darf mitreden</b>',
  '  /user — die Liste, mit Entfernentaste',
  '  /user add 123456789 Name — aufnehmen (darf erstmal nur ansehen)',
  '  /user add 123456789 Name rechte: ansehen,aendern — gleich mit Rechten',
  '  /user rechte 123456789 alle — Rechte aendern',
  '  /user del 123456789 — wieder entfernen',
  '',
  'Rechte: <code>ansehen</code> (/list), <code>aendern</code> (Suche anlegen,',
  'Takt und Text setzen), <code>loeschen</code> (🗑). Die Kennung eines',
  'Fremden steht im Log, sobald er dem Bot schreibt — wer nicht auf der Liste',
  'steht, bekommt keine Antwort.',
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
const TAKTE = [10, 15, 30, 60, 300];

/**
 * Der Rueckstand, mit dem zu rechnen ist: im Mittel vergeht der halbe Takt,
 * bis eine neue Anzeige ueberhaupt gesehen wird. Genau diese Zahl entscheidet
 * darueber, ob man der Erste ist — und sie steht nirgends, wenn man sie nicht
 * hinschreibt.
 */
function taktFolgen(sekunden) {
  const schnitt = Math.round(sekunden / 2);
  const text = schnitt < 60 ? `${schnitt} s` : `${Math.round(schnitt / 60)} min`;
  return sekunden <= 15
    ? `⌀ ${text} Rueckstand — schnellster Takt, erhoeht aber das Sperrrisiko.`
    : `⌀ ${text} Rueckstand auf eine neue Anzeige.`;
}

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

/**
 * Die Tastenreihe unter einer Suche — nur, was der Absender auch darf. Eine
 * Taste anzubieten und den Druck darauf gleich darauf abzulehnen waere die
 * schlechtere Antwort.
 */
function watchButtons(id, actor) {
  const row = [];
  if (may(actor, 'edit')) {
    row.push({ text: '⏱ Takt', callback_data: `takt:${id}` });
    row.push({ text: '✏️ Text', callback_data: `text:${id}` });
  }
  if (may(actor, 'remove')) row.push({ text: '🗑 Löschen', callback_data: `rm:${id}` });
  return row.length > 0 ? [row] : undefined;
}

async function handleList(configPath, telegram, actor) {
  const watches = await listWatches(configPath);
  if (watches.length === 0) {
    await telegram.sendText(
      may(actor, 'edit')
        ? 'Noch keine Suche. Schick mir eine Such-URL von kleinanzeigen.de.'
        : 'Noch keine Suche eingerichtet.',
    );
    return;
  }

  // Eine Nachricht je Suche, damit die Tasten eindeutig dazugehoeren.
  await telegram.sendText(`<b>${watches.length} Suche(n)</b>`);
  for (const w of watches) {
    await telegram.sendText(watchCard(w), { buttons: watchButtons(w.id, actor) });
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
  await telegram.editText(messageId, `${watchCard(watch)}\n\n<i>${taktFolgen(watch.intervalSeconds ?? 60)}</i>`, {
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

async function setTakt(id, sekunden, { configPath, telegram, callbackId, messageId, actor }) {
  try {
    const watch = await updateWatch(configPath, id, { intervalSeconds: Number(sekunden) });
    await telegram.answerCallback(callbackId, `alle ${sekunden}s — ${taktFolgen(Number(sekunden))}`);
    await telegram.editText(messageId, watchCard(watch), { buttons: watchButtons(id, actor) });
    return true;
  } catch (err) {
    await telegram.answerCallback(callbackId, 'Ging nicht');
    await telegram.sendText(`⚠️ ${escapeHtml(err.message)}`);
    return false;
  }
}

async function showCard(id, { configPath, telegram, callbackId, messageId, actor }) {
  const watch = (await listWatches(configPath)).find((w) => w.id === id);
  await telegram.answerCallback(callbackId);
  if (watch) {
    await telegram.editText(messageId, watchCard(watch), { buttons: watchButtons(id, actor) });
  }
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

async function applyTemplateReply(message, { configPath, telegram, actor }) {
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
    await telegram.sendText(watchCard(watch), { buttons: watchButtons(id, actor) });
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

/**
 * /schnell — jede Suche auf die Untergrenze.
 *
 * Ueber die Tasten geht dasselbe, aber je Suche einzeln: antippen, Auswahl
 * abwarten, Takt waehlen, zurueck. Bei mehreren Suchen ist das genau die
 * Reibung, wegen der man es dann doch laesst — und der Takt bleibt, wo er war.
 */
async function handleSchnell({ configPath, telegram }) {
  const watches = await listWatches(configPath);
  if (watches.length === 0) {
    await telegram.sendText('Noch keine Suche, die schneller werden koennte.');
    return false;
  }

  const geaendert = [];
  const fehler = [];
  for (const w of watches) {
    if ((w.intervalSeconds ?? 60) === MIN_INTERVAL_SECONDS) continue;
    try {
      geaendert.push(await updateWatch(configPath, w.id, { intervalSeconds: MIN_INTERVAL_SECONDS }));
    } catch (err) {
      fehler.push(`${w.label ?? w.id}: ${err.message}`);
    }
  }

  const zeilen = [];
  if (geaendert.length === 0 && fehler.length === 0) {
    zeilen.push(`Alle Suchen laufen schon alle ${MIN_INTERVAL_SECONDS} s — schneller geht es nicht.`);
  } else {
    zeilen.push(`⚡ <b>${geaendert.length} Suche(n) auf ${MIN_INTERVAL_SECONDS} s</b>`);
    for (const w of geaendert) zeilen.push(`· ${escapeHtml(w.label ?? w.id)}`);
    zeilen.push('', taktFolgen(MIN_INTERVAL_SECONDS));
  }
  for (const f of fehler) zeilen.push(`⚠️ ${escapeHtml(f)}`);

  // Das gehoert dazugesagt, sonst wartet man auf eine Wirkung, die nicht
  // kommt: der schnellste Takt hilft nur gegen den Teil des Rueckstands, der
  // uns gehoert. Was die Seite selbst verspaetet, steht in der 🐢-Zeile.
  zeilen.push(
    '',
    'Achte auf die ⏱-Zeile der naechsten Meldungen. Steht darunter eine',
    '🐢-Zeile, lag die Anzeige schon eingestellt herum, bevor sie auf Seite 1',
    'kam — dagegen hilft auch dieser Takt nicht.',
  );

  await telegram.sendText(zeilen.join('\n'));
  return geaendert.length > 0;
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

function describeUser(user) {
  const name = user.name ? `${escapeHtml(user.name)} · ` : '';
  return `<b>${name}<code>${escapeHtml(user.id)}</code></b>\n${escapeHtml(describeRights(user.rights))}`;
}

const RECHTE_HILFE = 'Moeglich: ansehen, aendern, loeschen — oder alle.';

/**
 * /user — die Erlaubnisliste. Nur der Besitzer kommt hier herein; wer selbst
 * aufgenommen wurde, soll weder weitere Leute nachholen noch sich die eigenen
 * Rechte hochsetzen koennen.
 *
 *   /user                                  die Liste
 *   /user add 123456789 Ali                aufnehmen, erstmal nur ansehen
 *   /user add 123456789 Ali rechte: alle   aufnehmen, mit Rechten
 *   /user rechte 123456789 ansehen,aendern
 *   /user del 123456789
 */
async function handleUsers(text, { configPath, telegram }) {
  const [, aktion, rohId, ...rest] = text.split(/\s+/);
  const verb = (aktion ?? '').toLowerCase();

  if (!verb || verb === 'list' || verb === 'liste') {
    const users = await listUsers(configPath);
    if (users.length === 0) {
      await telegram.sendText(
        ['Ausser dir darf niemand.', '', 'Aufnehmen: <code>/user add 123456789 Name</code>'].join('\n'),
      );
      return false;
    }
    await telegram.sendText(`<b>${users.length} weitere(r) Berechtigte(r)</b>`);
    for (const user of users) {
      await telegram.sendText(describeUser(user), {
        buttons: [[{ text: '🚫 Entfernen', callback_data: `urm:${user.id}` }]],
      });
    }
    return false;
  }

  // Die Rechte stehen hinter "rechte:"; alles davor ist der Name. Beides in
  // einem Befehl, weil sonst jedes Aufnehmen zwei Nachrichten braucht.
  const schwanz = rest.join(' ');
  const geteilt = schwanz.match(/^(.*?)(?:\b(?:rechte|rights|recht)\s*:?\s*(.+))?$/is) ?? [];
  const name = (geteilt[1] ?? '').trim() || null;
  const rechteWorte = geteilt[2]?.trim() ?? null;

  try {
    if (verb === 'add' || verb === 'neu') {
      let rights = DEFAULT_RIGHTS;
      if (rechteWorte) {
        rights = parseRights(rechteWorte);
        if (!rights) throw new Error(`Unbekannte Rechte: "${rechteWorte}". ${RECHTE_HILFE}`);
      }
      const user = await addUser(configPath, rohId, { name, rights });
      await telegram.sendText(`✅ Aufgenommen\n${describeUser(user)}`);
      return false;
    }

    if (verb === 'del' || verb === 'remove' || verb === 'raus') {
      const entfernt = await removeUser(configPath, rohId);
      await telegram.sendText(
        `🚫 Entfernt: <code>${escapeHtml(entfernt.id)}</code>` +
          (entfernt.name ? ` (${escapeHtml(entfernt.name)})` : ''),
      );
      return false;
    }

    if (verb === 'rechte' || verb === 'rights' || verb === 'recht') {
      // Hier ist alles hinter der Kennung Rechteangabe — ein Name stuende beim
      // Aendern nur im Weg.
      const rights = parseRights(schwanz);
      if (!rights) throw new Error(`Unbekannte Rechte: "${schwanz}". ${RECHTE_HILFE}`);
      const user = await setUserRights(configPath, rohId, rights);
      await telegram.sendText(`✅ Geaendert\n${describeUser(user)}`);
      return false;
    }
  } catch (err) {
    await telegram.sendText(`⚠️ ${escapeHtml(err.message)}`);
    return false;
  }

  await telegram.sendText(OWNER_HELP);
  return false;
}

/** Entfernt jemanden ueber die Taste unter seinem Eintrag. */
async function removeUserByButton(id, { configPath, telegram, callbackId, messageId }) {
  try {
    const entfernt = await removeUser(configPath, id);
    await telegram.answerCallback(callbackId, 'Entfernt');
    if (messageId) {
      await telegram.editText(messageId, `🚫 <s><code>${escapeHtml(entfernt.id)}</code></s>`);
    }
  } catch (err) {
    await telegram.answerCallback(callbackId, 'Ging nicht');
    await telegram.sendText(`⚠️ ${escapeHtml(err.message)}`);
  }
  return false;
}

/**
 * Verarbeitet ein einzelnes Update.
 * Gibt true zurueck, wenn sich die Konfiguration geaendert hat.
 */
export async function handleUpdate(update, ctx) {
  const { configPath, timeoutMs, log } = ctx;

  const quelle = update.callback_query ?? update.message;
  const chatId = (update.callback_query?.message ?? update.message)?.chat?.id;

  const actor = resolveActor({
    ownerChatId: ctx.telegram.chatId,
    // Frisch aus der Datei gelesen: eine gerade vergebene Erlaubnis soll
    // sofort gelten, nicht erst nach einem Neustart des Watchers.
    users: await listUsers(configPath),
    fromId: quelle?.from?.id,
    chatId,
  });

  if (!actor) {
    // Fremde bekommen keine Antwort — sie wuerde nur verraten, dass hier
    // jemand zuhoert. Ins Log gehoert der Versuch trotzdem: dort steht die
    // Kennung, die der Besitzer zum Aufnehmen braucht.
    const wer = quelle?.from?.id ?? chatId;
    const name = [quelle?.from?.first_name, quelle?.from?.username].filter(Boolean).join(' @');
    log?.(`Nicht erlaubt: Kennung ${wer}${name ? ` (${name})` : ''} — aufnehmen mit: /user add ${wer}`);
    return false;
  }

  // Ab hier geht jede Antwort in den Chat, aus dem der Befehl kam.
  const telegram = replyTo(ctx.telegram, chatId);

  const callback = update.callback_query;
  if (callback) {
    const data = String(callback.data ?? '');
    const ctx2 = {
      configPath,
      telegram,
      actor,
      callbackId: callback.id,
      messageId: callback.message?.message_id,
    };

    if (data.startsWith('urm:')) {
      if (!actor.isOwner) {
        await telegram.answerCallback(callback.id, 'Das darf nur der Besitzer.');
        return false;
      }
      return removeUserByButton(data.slice(4), ctx2);
    }
    if (data.startsWith('rm:')) {
      if (!may(actor, 'remove')) {
        await telegram.answerCallback(callback.id, 'Dafuer fehlt dir das Recht.');
        return false;
      }
      return handleRemove(data.slice(3), ctx2);
    }
    if (data.startsWith('card:')) return showCard(data.slice(5), ctx2);
    if (data.startsWith('text:') || data.startsWith('takt:')) {
      if (!may(actor, 'edit')) {
        await telegram.answerCallback(callback.id, 'Dafuer fehlt dir das Recht.');
        return false;
      }
      if (data.startsWith('text:')) return askForTemplate(data.slice(5), ctx2);
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

  const text = message.text.trim();
  const command = text.split(/\s+/)[0].toLowerCase().replace(/@.*$/, '');

  // Antwort auf die Vorlagen-Frage? Muss vor allem anderen geprueft werden,
  // sonst landet ein Vorlagentext mit einer URL darin beim Anlegen einer Suche.
  if (message.reply_to_message && watchIdFromReply(message)) {
    if (!may(actor, 'edit')) {
      await telegram.sendText('Dafuer fehlt dir das Recht.');
      return false;
    }
    return applyTemplateReply(message, { configPath, telegram, actor });
  }

  if (command === '/start' || command === '/help') {
    await telegram.sendText(actor.isOwner ? `${HELP}\n${OWNER_HELP}` : HELP);
    return false;
  }
  if (command === '/user' || command === '/users') {
    if (!actor.isOwner) {
      await telegram.sendText('Wer mitmachen darf, entscheidet nur der Besitzer.');
      return false;
    }
    return handleUsers(text, { configPath, telegram });
  }
  if (command === '/list') {
    if (!may(actor, 'list')) {
      await telegram.sendText('Dafuer fehlt dir das Recht.');
      return false;
    }
    await handleList(configPath, telegram, actor);
    return false;
  }
  if (command === '/schnell' || command === '/turbo') {
    if (!may(actor, 'edit')) {
      await telegram.sendText('Dafuer fehlt dir das Recht.');
      return false;
    }
    return handleSchnell({ configPath, telegram });
  }
  if (command === '/takt' || command === '/text') {
    if (!may(actor, 'edit')) {
      await telegram.sendText('Dafuer fehlt dir das Recht.');
      return false;
    }
    return handleEditCommand(command, text, { configPath, telegram });
  }
  if (extractUrl(text)) {
    if (!may(actor, 'edit')) {
      await telegram.sendText('Du darfst keine Suchen anlegen.');
      return false;
    }
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
