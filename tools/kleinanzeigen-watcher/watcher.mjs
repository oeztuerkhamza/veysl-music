#!/usr/bin/env node
// Kleinanzeigen-Watcher — meldet neue Anzeigen einer Suche per Telegram.
//
//   node watcher.mjs                 dauerhaft ueberwachen
//   node watcher.mjs --once          einmal abfragen (Test, ohne Schleife)
//   node watcher.mjs --dry-run       nur in der Konsole ausgeben, nichts senden
//   node watcher.mjs --chat-id       eigene Telegram-Chat-ID herausfinden
//   node watcher.mjs --add URL       weitere Suche aufnehmen
//   node watcher.mjs --list          eingerichtete Suchen zeigen
//   node watcher.mjs --remove ID     Suche entfernen
//   node watcher.mjs --config PFAD   andere Konfigurationsdatei
//
// Siehe README.md fuer die Einrichtung.

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

import { pollCommands } from './src/commands.mjs';
import { loadConfig, matchesFilters, withFilterDefaults } from './src/config.mjs';
import { fetchAds, BlockedError } from './src/kleinanzeigen.mjs';
import { addWatch, listWatches, removeWatch } from './src/manage.mjs';
import { State } from './src/state.mjs';
import { Telegram } from './src/telegram.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

// Nach einer Sperre wird der Abstand verdoppelt, bis zu dieser Obergrenze.
// Weiter hochzugehen bringt nichts — dann ist die Suche ohnehin blind.
const MAX_BACKOFF_MULTIPLIER = 16;

/** Liest einen Zahlenwert und weist eine fehlende Angabe frueh zurueck. */
function numberArg(value, flag) {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`${flag} braucht eine Zahl (bekam "${value}").`);
  return n;
}

function listArg(value, flag) {
  if (value === undefined) throw new Error(`${flag} braucht eine Liste, z. B. defekt,bastler`);
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseArgs(argv) {
  // `null` heisst "Flag nicht benutzt", `undefined` entsteht nur, wenn das
  // Flag da war, der Wert dahinter aber fehlt — das faengt die Pruefung unten.
  const args = { once: false, dryRun: false, chatId: false, config: null, add: null, remove: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--once') args.once = true;
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--chat-id') args.chatId = true;
    else if (a === '--list') args.list = true;
    else if (a === '--add') args.add = argv[++i];
    else if (a === '--remove') args.remove = argv[++i];
    else if (a === '--config') args.config = argv[++i];
    else if (a === '--label') args.label = argv[++i];
    else if (a === '--id') args.id = argv[++i];
    else if (a === '--interval') args.intervalSeconds = numberArg(argv[++i], a);
    else if (a === '--min-price') args.minPrice = numberArg(argv[++i], a);
    else if (a === '--max-price') args.maxPrice = numberArg(argv[++i], a);
    else if (a === '--exclude') args.exclude = listArg(argv[++i], a);
    else if (a === '--include') args.include = listArg(argv[++i], a);
    else if (a === '--private-only') args.privateOnly = true;
    else if (a === '--help' || a === '-h') args.help = true;
    else throw new Error(`Unbekannte Option: ${a}`);
  }
  if (args.add === undefined) throw new Error('--add braucht eine URL.');
  if (args.remove === undefined) throw new Error('--remove braucht eine id.');
  return args;
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stamp = () => new Date().toLocaleTimeString('de-DE');
const log = (...m) => console.log(`[${stamp()}]`, ...m);

/** Laedt eine .env-Datei neben dem Skript, falls vorhanden. */
function loadEnvFile() {
  const envPath = resolve(HERE, '.env');
  if (existsSync(envPath)) process.loadEnvFile(envPath);
}

/**
 * Eine Abfragerunde fuer eine Suche.
 * Gibt die Anzahl gemeldeter Anzeigen zurueck.
 */
async function runCycle(watch, { state, telegram, config, dryRun }) {
  const ads = await fetchAds(watch.url, {
    timeoutMs: config.requestTimeoutMs,
    userAgent: config.userAgent,
  });

  // Erster Lauf: der vorhandene Bestand ist nicht "neu", sondern Vergangenheit.
  // Ohne diesen Zweig kaeme beim Start die halbe Suchseite als Alarm an.
  if (state.isNew(watch.id)) {
    state.remember(
      watch.id,
      ads.map((a) => a.id),
    );
    await state.flush();
    log(`${watch.label}: ${ads.length} vorhandene Anzeigen gemerkt, ab jetzt nur noch neue.`);
    return 0;
  }

  const fresh = ads.filter((ad) => !state.hasSeen(watch.id, ad.id));
  // Alles Gesehene wird gemerkt, auch was die Filter aussortieren. Sonst
  // wuerde dieselbe Anzeige bei jeder Runde erneut geprueft.
  state.remember(
    watch.id,
    ads.map((a) => a.id),
  );

  const hits = fresh.filter((ad) => matchesFilters(ad, watch.filters));
  // Aelteste zuerst, damit die Reihenfolge im Chat der Realitaet entspricht.
  hits.reverse();

  const capped = hits.slice(0, watch.maxAlertsPerCycle);
  const dropped = hits.length - capped.length;

  for (const ad of capped) {
    if (dryRun) {
      log(`  [dry-run] ${ad.price || '—'} · ${ad.title} · ${ad.url}`);
    } else {
      await telegram.sendAd(ad, watch.label);
    }
  }
  if (dropped > 0) {
    const note = `⚠️ ${watch.label}: ${dropped} weitere neue Anzeigen unterdrueckt (Limit ${watch.maxAlertsPerCycle}/Runde). Suche enger fassen.`;
    if (dryRun) log(note);
    else await telegram.sendText(note);
  }

  await state.flush();

  if (fresh.length > 0) {
    log(
      `${watch.label}: ${fresh.length} neu, ${hits.length} nach Filter, ${capped.length} gesendet.`,
    );
  }
  return capped.length;
}

/**
 * Fuehrt eine faellige Suche aus und bestimmt, wann sie das naechste Mal dran
 * ist. `runtime` haelt Sperr- und Laufzustand ueber die Runden hinweg fest.
 */
async function tickWatch(watch, runtime, ctx) {
  try {
    await runCycle(watch, ctx);
    if (runtime.backoff > 1) {
      log(`${watch.label}: wieder erreichbar, normaler Takt.`);
      runtime.backoff = 1;
      runtime.blockedNotified = false;
    }
  } catch (err) {
    if (err instanceof BlockedError) {
      runtime.backoff = Math.min(runtime.backoff * 2, MAX_BACKOFF_MULTIPLIER);
      log(`${watch.label}: ${err.message} — Takt x${runtime.backoff}.`);
      // Nur einmal pro Sperrphase melden, nicht bei jedem Fehlversuch.
      if (runtime.backoff >= 8 && !runtime.blockedNotified && !ctx.dryRun) {
        runtime.blockedNotified = true;
        await ctx.telegram
          .sendText(
            `⚠️ ${watch.label}: Kleinanzeigen blockt die Abfragen (HTTP ${err.status}). Der Watcher versucht es weiter in groesseren Abstaenden.`,
          )
          .catch(() => {});
      }
    } else {
      log(`${watch.label}: Fehler — ${err.message}`);
    }
  }

  const jitter = Math.random() * watch.jitterSeconds * 1000;
  runtime.nextRunAt = Date.now() + watch.intervalSeconds * 1000 * runtime.backoff + jitter;
}

/**
 * Der Taktgeber. Eine Schleife fuer alle Suchen statt einer je Suche — nur so
 * kann eine per Telegram hinzugefuegte Suche sofort mitlaufen und eine
 * geloeschte sofort verschwinden, ohne den Prozess neu zu starten.
 */
async function scheduler(ctx, abortSignal) {
  const runtimes = new Map();
  let stagger = 0;

  while (!abortSignal.aborted) {
    const watches = ctx.getWatches();

    // Verschwundene Suchen nicht mitschleppen: sonst waechst die Map, und
    // eine spaeter gleichnamige Suche erbte den alten Sperrzustand.
    for (const id of runtimes.keys()) {
      if (!watches.some((w) => w.id === id)) runtimes.delete(id);
    }

    const due = [];
    for (const watch of watches) {
      let runtime = runtimes.get(watch.id);
      if (!runtime) {
        // Neue Suchen leicht versetzt starten, damit nicht alle gleichzeitig
        // abfragen.
        runtime = { backoff: 1, blockedNotified: false, nextRunAt: Date.now() + stagger, running: false };
        stagger += 2000;
        runtimes.set(watch.id, runtime);
      }
      if (!runtime.running && Date.now() >= runtime.nextRunAt) due.push([watch, runtime]);
    }
    stagger = 0;

    // Faellige Suchen nebeneinander laufen lassen, aber nicht auf sie warten:
    // eine haengende Abfrage darf die anderen nicht aufhalten.
    for (const [watch, runtime] of due) {
      runtime.running = true;
      tickWatch(watch, runtime, ctx).finally(() => {
        runtime.running = false;
      });
    }

    await sleep(1000);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(
      [
        'Kleinanzeigen-Watcher',
        '',
        'Ueberwachen:',
        '  node watcher.mjs                 dauerhaft ueberwachen',
        '  node watcher.mjs --once          einmal abfragen und beenden',
        '  node watcher.mjs --dry-run       nur Konsole, kein Telegram',
        '',
        'Suchen verwalten:',
        '  node watcher.mjs --list          eingerichtete Suchen zeigen',
        '  node watcher.mjs --add URL       weitere Suche aufnehmen',
        '  node watcher.mjs --remove ID     Suche entfernen',
        '',
        '  Zusaetzlich zu --add:',
        '    --label "Text"       eigene Bezeichnung',
        '    --id name            eigene id (sonst aus der URL abgeleitet)',
        '    --interval 60        Abstand in Sekunden (min. 30)',
        '    --min-price 50       Preisuntergrenze',
        '    --max-price 400      Preisobergrenze',
        '    --include a,b        Titel muss eins davon enthalten',
        '    --exclude defekt,bastler   Titel darf keins davon enthalten',
        '    --private-only       gewerbliche Anbieter ueberspringen',
        '',
        'Sonstiges:',
        '  node watcher.mjs --chat-id       eigene Chat-ID ermitteln',
        '  node watcher.mjs --config PFAD   andere Konfigurationsdatei',
      ].join('\n'),
    );
    return;
  }

  const configPath = resolve(args.config ?? resolve(HERE, 'watches.json'));

  if (args.list) {
    const watches = await listWatches(configPath);
    if (watches.length === 0) {
      console.log('Noch keine Suche eingerichtet. Anlegen mit: node watcher.mjs --add "<URL>"');
      return;
    }
    console.log(`${watches.length} Suche(n) in ${configPath}:\n`);
    for (const w of watches) {
      console.log(`  ${w.id}`);
      console.log(`    ${w.label ?? w.id}  ·  alle ${w.intervalSeconds ?? 60}s`);
      console.log(`    ${describeFilters(w.filters)}`);
      console.log(`    ${w.url}\n`);
    }
    return;
  }

  if (args.remove) {
    const removed = await removeWatch(configPath, args.remove);
    console.log(`Entfernt: ${removed.label ?? removed.id}`);
    return;
  }

  if (args.add) {
    const { watch, needsChatId } = await addWatch(configPath, args.add, args);
    console.log(`Aufgenommen als "${watch.id}": ${watch.label}`);
    console.log(`  alle ${watch.intervalSeconds}s  ·  ${describeFilters(watch.filters)}`);

    // Sofort einmal abfragen: so merkt man auf der Stelle, ob die URL wirklich
    // Treffer liefert — und nicht erst, wenn tagelang nichts ankommt.
    try {
      const ads = await fetchAds(watch.url, { timeoutMs: 20_000 });
      const probeFilters = withFilterDefaults(watch.filters);
      const passing = ads.filter((ad) => matchesFilters(ad, probeFilters));
      console.log(`  Probeabruf: ${ads.length} Anzeigen auf Seite 1, davon ${passing.length} nach Filter.`);
      if (ads.length > 0 && passing.length === 0) {
        console.log('  Hinweis: Die Filter lassen gerade nichts durch — zu eng gesetzt?');
      }
    } catch (err) {
      console.log(`  Probeabruf fehlgeschlagen: ${err.message}`);
    }

    if (needsChatId) {
      console.log('\nNoch offen: chatId in watches.json eintragen (node watcher.mjs --chat-id).');
    }
    return;
  }

  loadEnvFile();
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (args.chatId) {
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN fehlt (in .env oder Umgebung).');
    const chats = await Telegram.discoverChats(token);
    if (chats.length === 0) {
      console.log(
        'Keine Chats gefunden. Schreibe deinem Bot in Telegram zuerst eine Nachricht\n' +
          '(z. B. /start) und rufe diesen Befehl dann erneut auf.',
      );
      return;
    }
    console.log('Gefundene Chats — trage die passende id in watches.json ein:\n');
    for (const c of chats) {
      const name = c.title ?? [c.first_name, c.last_name].filter(Boolean).join(' ');
      console.log(`  ${c.id}   ${c.type.padEnd(10)} ${name ?? ''}`);
    }
    return;
  }

  const config = await loadConfig(configPath);
  // Der Zustand gehoert neben die Konfiguration, nicht neben das Skript. Im
  // Container liegt watches.json auf einem gemounteten Volume — nur so
  // ueberlebt das Gedaechtnis einen Rebuild des Images.
  const state = await State.load(resolve(dirname(configPath), 'state.json'));

  const telegram = args.dryRun
    ? null
    : new Telegram(token, config.telegram.chatId, {
        bridgeBaseUrl: config.telegram.bridgeBaseUrl,
      });
  const ctx = { state, telegram, config, dryRun: args.dryRun };

  if (config.watches.length === 0) {
    log('Keine Suche eingerichtet — der Watcher wartet auf eine URL per Telegram.');
  } else {
    log(`${config.watches.length} Suche(n) geladen${args.dryRun ? ' (dry-run)' : ''}.`);
    for (const w of config.watches) {
      log(`  · ${w.label} — alle ${w.intervalSeconds}s`);
    }
  }

  if (args.once) {
    for (const watch of config.watches) {
      try {
        await runCycle(watch, ctx);
      } catch (err) {
        log(`${watch.label}: Fehler — ${err.message}`);
        process.exitCode = 1;
      }
    }
    return;
  }

  const controller = new AbortController();
  let shuttingDown = false;
  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    log('Beende, Zustand wird gesichert …');
    controller.abort();
    await state.flush().catch(() => {});
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Die Suchen liegen ab hier hinter einem Getter statt in einer festen Liste:
  // per Telegram angelegte Suchen sollen sofort mitlaufen, geloeschte sofort
  // verstummen — ohne den Container neu zu starten.
  let current = config.watches;
  ctx.getWatches = () => current;

  const reload = async () => {
    try {
      const fresh = await loadConfig(configPath);
      const before = current.map((w) => w.id).join(',');
      current = fresh.watches;
      if (before !== current.map((w) => w.id).join(',')) {
        log(`Suchen neu geladen: ${current.length} aktiv.`);
      }
    } catch (err) {
      // Eine kaputte Datei darf den laufenden Watcher nicht umbringen; er
      // arbeitet mit dem letzten funktionierenden Stand weiter.
      log(`Neu laden fehlgeschlagen, behalte den bisherigen Stand: ${err.message}`);
    }
  };

  const tasks = [scheduler(ctx, controller.signal)];

  if (!args.dryRun) {
    log('Botbefehle aktiv — schick eine Such-URL an den Bot.');
    tasks.push(
      pollCommands(
        { telegram, configPath, timeoutMs: config.requestTimeoutMs, log, onConfigChanged: reload },
        controller.signal,
      ),
    );
  }

  await Promise.all(tasks);
}

main().catch((err) => {
  console.error(`\nFehler: ${err.message}`);
  process.exit(1);
});
