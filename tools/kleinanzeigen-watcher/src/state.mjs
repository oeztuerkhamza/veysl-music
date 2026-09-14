// Gedaechtnis des Watchers: welche Anzeigen-IDs pro Suche schon gemeldet sind.
//
// Ohne diese Datei wuerde jeder Neustart die komplette erste Seite als "neu"
// verschicken. Sie liegt neben der Konfiguration und ist bewusst ein simples
// JSON — man kann sie loeschen, um eine Suche zurueckzusetzen.

import { readFile, writeFile, rename, unlink } from 'node:fs/promises';

// Eine Suchseite zeigt ~25 Anzeigen. Ein paar hundert IDs reichen also weit
// zurueck; der Deckel verhindert nur, dass die Datei jahrelang waechst.
const MAX_IDS_PER_WATCH = 3000;

export class State {
  #path;
  #data;
  #dirty = false;
  #writing = Promise.resolve();
  #seq = 0;

  constructor(path, data) {
    this.#path = path;
    this.#data = data;
  }

  static async load(path, log) {
    let raw;
    try {
      raw = await readFile(path, 'utf8');
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      return new State(path, { watches: {} });
    }

    try {
      const parsed = JSON.parse(raw);
      return new State(path, parsed?.watches ? parsed : { watches: {} });
    } catch (err) {
      // Frueher flog hier eine Ausnahme — und der Container lief im Kreis, weil
      // eine kaputte Datei bei jedem Start erneut kaputt ist. Das Gedaechtnis
      // ist ersetzbar (im schlimmsten Fall eine stille Neuaufnahme), der
      // laufende Watcher nicht. Die kaputte Datei bleibt zur Ansicht liegen.
      const aside = `${path}.kaputt`;
      await rename(path, aside).catch(() => {});
      log?.(`Zustandsdatei war unlesbar (${err.message}), liegt jetzt unter ${aside}. Fange neu an.`);
      return new State(path, { watches: {} });
    }
  }

  /** True, wenn diese Suche noch nie gelaufen ist. */
  isNew(watchId) {
    return this.#data.watches[watchId] === undefined;
  }

  /**
   * Wirft das Gedaechtnis geloeschter Suchen weg.
   *
   * Ohne das wuchs die Datei bei jedem Loeschen und Neuanlegen weiter — 3000
   * IDs je verwaister Eintrag, die nie wieder jemand liest, aber bei jedem
   * Speichern mitgeschrieben werden.
   */
  forget(keepIds) {
    const keep = new Set(keepIds);
    let entfernt = 0;
    for (const id of Object.keys(this.#data.watches)) {
      if (!keep.has(id)) {
        delete this.#data.watches[id];
        entfernt++;
      }
    }
    if (entfernt > 0) this.#dirty = true;
    return entfernt;
  }

  hasSeen(watchId, adId) {
    return Boolean(this.#data.watches[watchId]?.seen?.includes(adId));
  }

  /** Merkt IDs vor und schneidet den aeltesten Ueberhang ab. */
  remember(watchId, adIds) {
    const entry = (this.#data.watches[watchId] ??= { seen: [] });
    for (const id of adIds) {
      if (!entry.seen.includes(id)) entry.seen.push(id);
    }
    if (entry.seen.length > MAX_IDS_PER_WATCH) {
      entry.seen = entry.seen.slice(-MAX_IDS_PER_WATCH);
    }
    entry.lastRunAt = new Date().toISOString();
    this.#dirty = true;
  }

  /**
   * Schreibt ueber eine temporaere Datei. Ein Absturz mitten im Schreiben
   * wuerde sonst eine halbe JSON-Datei hinterlassen und beim naechsten Start
   * alle IDs vergessen — also die gesamte Seite erneut verschicken.
   *
   * Die Schreibvorgaenge sind aneinandergereiht, und das ist keine Vorsicht,
   * sondern die Reparatur eines echten Fehlers: zwei Suchen mit gleichem
   * Intervall werden staendig gleichzeitig fertig, und zwei parallele Laeufe
   * schrieben dieselbe .tmp-Datei. Nachgemessen endeten 19 von 40 solcher
   * Paare mit einer unlesbaren oder verschwundenen state.json.
   */
  async flush() {
    if (!this.#dirty) return this.#writing;
    // Vor dem ersten await zuruecksetzen, sonst schreibt ein zweiter Aufruf
    // denselben Stand noch einmal.
    this.#dirty = false;
    const snapshot = JSON.stringify(this.#data, null, 2);

    this.#writing = this.#writing.then(
      () => this.#write(snapshot),
      () => this.#write(snapshot),
    );
    return this.#writing;
  }

  async #write(snapshot) {
    // Eigener Name je Schreibvorgang: falls doch einmal ein zweiter Prozess
    // danebengreift, zerstoeren sich die beiden nicht gegenseitig.
    const tmp = `${this.#path}.${process.pid}.${++this.#seq}.tmp`;
    try {
      await writeFile(tmp, snapshot, 'utf8');
      await rename(tmp, this.#path);
    } catch (err) {
      await unlink(tmp).catch(() => {});
      // Nicht weiterwerfen: ein misslungener Schreibvorgang darf den Watcher
      // nicht beenden. Der Stand steht weiter im Speicher, der naechste
      // Durchlauf versucht es erneut.
      this.#dirty = true;
      throw err;
    }
  }
}
