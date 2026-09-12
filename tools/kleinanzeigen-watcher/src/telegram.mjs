// Versand der Treffer und Empfang der Befehle ueber die Telegram-Bot-API.

const API = 'https://api.telegram.org';

// Telegram drosselt Nachrichten in denselben Chat bei etwa einer pro Sekunde.
// Wer schneller sendet, kassiert 429 und verliert Zeit — genau die Zeit, um
// die es hier geht.
const MIN_GAP_MS = 1100;

// Long Polling: die Anfrage bleibt so lange offen, bis etwas ankommt. Das
// spart Abfragen und laesst einen Befehl trotzdem sofort ankommen.
const POLL_TIMEOUT_S = 30;

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Hier stand ein zweiter Link im `ebayk://`-Schema, um die Anzeige direkt in
// der Kleinanzeigen-App zu oeffnen. Er ist wieder raus: die Bot-API nimmt das
// Schema zwar an, aber der iOS-Client macht daraus keinen antippbaren Link —
// in jeder Meldung stand also ein toter Link.
//
// Der Weg in die App fuehrt ohnehin ueber den gewoehnlichen https-Link.
// Kleinanzeigen veroeffentlicht Android App Links und iOS Universal Links;
// die Adresse oeffnet die App von selbst, sobald Telegram sie ans
// Betriebssystem weiterreicht statt sie im eingebauten Browser zu oeffnen.
// Das ist eine Einstellung im Telegram-Client, siehe README.

export class Telegram {
  #token;
  #chatId;
  #nextSlot = 0;

  constructor(token, chatId) {
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN fehlt.');
    if (!chatId) throw new Error('Keine chatId konfiguriert.');
    this.#token = token;
    this.#chatId = String(chatId);
  }

  get chatId() {
    return this.#chatId;
  }

  async #call(method, payload, { timeoutMs = 20_000 } = {}) {
    const res = await fetch(`${API}/bot${this.#token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const body = await res.json().catch(() => ({}));
    if (!body.ok) {
      throw new Error(`Telegram ${method}: ${body.description ?? `HTTP ${res.status}`}`);
    }
    return body.result;
  }

  /** Haelt den Mindestabstand zwischen zwei Nachrichten ein. */
  async #throttle() {
    const wait = this.#nextSlot - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    this.#nextSlot = Date.now() + MIN_GAP_MS;
  }

  async sendText(text, { buttons } = {}) {
    await this.#throttle();
    return this.#call('sendMessage', {
      chat_id: this.#chatId,
      text,
      parse_mode: 'HTML',
      // Die Vorschau wuerde die Nachricht um ein grosses Bild verlaengern und
      // das Antippen des Links nach unten schieben.
      link_preview_options: { is_disabled: true },
      ...(buttons ? { reply_markup: { inline_keyboard: buttons } } : {}),
    });
  }

  /** Formatiert eine Anzeige als Alarmnachricht. */
  async sendAd(ad, watchLabel) {
    const lines = [`🆕 <b>${escapeHtml(ad.title || 'Ohne Titel')}</b>`];

    const facts = [];
    if (ad.price) facts.push(`💶 ${escapeHtml(ad.price)}`);
    if (ad.location) facts.push(`📍 ${escapeHtml(ad.location)}`);
    if (ad.postedAt) facts.push(`🕒 ${escapeHtml(ad.postedAt)}`);
    facts.push(ad.isCommercial ? '🏪 Gewerblich' : '👤 Privat');
    if (ad.shipping) facts.push('📦 Versand');
    lines.push(facts.join('  ·  '));

    // Der App-Link zuerst: wer eine frische Anzeige sieht, will schreiben,
    // und das geht in der App mit einem Tipp statt ueber einen Login im
    // Browser. Der https-Link bleibt daneben stehen — er ist der einzige, der
    // sicher irgendwo landet, falls die App nicht installiert ist.
    lines.push('', `<a href="${escapeHtml(ad.url)}">Anzeige oeffnen</a>`);
    lines.push(`<i>${escapeHtml(watchLabel)}</i>`);

    return this.sendText(lines.join('\n'));
  }

  /**
   * Holt wartende Updates ab. `offset` ist die naechste unbestaetigte
   * update_id — Telegram loescht damit alles Aeltere.
   */
  async getUpdates(offset, { signal } = {}) {
    const res = await fetch(`${API}/bot${this.#token}/getUpdates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offset,
        timeout: POLL_TIMEOUT_S,
        allowed_updates: ['message', 'callback_query'],
      }),
      // Grosszuegiger als das Long-Polling-Fenster, sonst bricht jede
      // ereignislose Runde als Timeout ab.
      signal: signal ?? AbortSignal.timeout((POLL_TIMEOUT_S + 15) * 1000),
    });
    const body = await res.json().catch(() => ({}));
    if (!body.ok) {
      throw new Error(`Telegram getUpdates: ${body.description ?? `HTTP ${res.status}`}`);
    }
    return body.result ?? [];
  }

  /**
   * Bestaetigt einen Tastendruck. Ohne diesen Aufruf dreht sich im Chat
   * sekundenlang ein Ladekringel, obwohl die Aktion laengst gelaufen ist.
   */
  async answerCallback(id, text) {
    return this.#call('answerCallbackQuery', {
      callback_query_id: id,
      ...(text ? { text } : {}),
    }).catch(() => {});
  }

  /** Ersetzt den Text einer bereits gesendeten Nachricht. */
  async editText(messageId, text, { buttons } = {}) {
    return this.#call('editMessageText', {
      chat_id: this.#chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
      ...(buttons ? { reply_markup: { inline_keyboard: buttons } } : {}),
    }).catch(() => {});
  }

  /**
   * Liest wartende Updates aus, ohne sie zu bestaetigen. Wird von `--chat-id`
   * benutzt, um die eigene Chat-ID zu ermitteln.
   */
  static async discoverChats(token) {
    const res = await fetch(`${API}/bot${token}/getUpdates`, {
      signal: AbortSignal.timeout(20_000),
    });
    const body = await res.json().catch(() => ({}));
    if (!body.ok) {
      throw new Error(`Telegram getUpdates: ${body.description ?? `HTTP ${res.status}`}`);
    }
    const chats = new Map();
    for (const update of body.result ?? []) {
      const chat = (update.message ?? update.channel_post ?? update.my_chat_member)?.chat;
      if (chat) chats.set(chat.id, chat);
    }
    return [...chats.values()];
  }
}
