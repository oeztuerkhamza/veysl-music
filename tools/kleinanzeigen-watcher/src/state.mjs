// Gedaechtnis des Watchers: welche Anzeigen-IDs pro Suche schon gemeldet sind.
//
// Ohne diese Datei wuerde jeder Neustart die komplette erste Seite als "neu"
// verschicken. Sie liegt neben der Konfiguration und ist bewusst ein simples
// JSON — man kann sie loeschen, um eine Suche zurueckzusetzen.

import { readFile, writeFile, rename } from 'node:fs/promises';

// Eine Suchseite zeigt ~25 Anzeigen. Ein paar hundert IDs reichen also weit
// zurueck; der Deckel verhindert nur, dass die Datei jahrelang waechst.
const MAX_IDS_PER_WATCH = 3000;

export class State {
  #path;
  #data;
  #dirty = false;

  constructor(path, data) {
    this.#path = path;
    this.#data = data;
  }

  static async load(path) {
    try {
      const parsed = JSON.parse(await readFile(path, 'utf8'));
      return new State(path, parsed?.watches ? parsed : { watches: {} });
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw new Error(`Zustandsdatei ${path} ist unlesbar: ${err.message}`);
      }
      return new State(path, { watches: {} });
    }
  }

  /** True, wenn diese Suche noch nie gelaufen ist. */
  isNew(watchId) {
    return this.#data.watches[watchId] === undefined;
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
   */
  async flush() {
    if (!this.#dirty) return;
    const tmp = `${this.#path}.tmp`;
    await writeFile(tmp, JSON.stringify(this.#data, null, 2), 'utf8');
    await rename(tmp, this.#path);
    this.#dirty = false;
  }
}
