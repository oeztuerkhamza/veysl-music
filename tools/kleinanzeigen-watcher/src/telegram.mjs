// Versand der Treffer ueber die Telegram-Bot-API.

const API = 'https://api.telegram.org';

// Telegram drosselt Nachrichten in denselben Chat bei etwa einer pro Sekunde.
// Wer schneller sendet, kassiert 429 und verliert Zeit — genau die Zeit, um
// die es hier geht.
const MIN_GAP_MS = 1100;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

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

  async #call(method, payload) {
    const res = await fetch(`${API}/bot${this.#token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20_000),
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

  async sendText(text) {
    await this.#throttle();
    return this.#call('sendMessage', {
      chat_id: this.#chatId,
      text,
      parse_mode: 'HTML',
      // Die Vorschau wuerde die Nachricht um ein grosses Bild verlaengern und
      // das Antippen des Links nach unten schieben.
      link_preview_options: { is_disabled: true },
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

    lines.push('', `<a href="${escapeHtml(ad.url)}">Anzeige oeffnen</a>`);
    lines.push(`<i>${escapeHtml(watchLabel)}</i>`);

    return this.sendText(lines.join('\n'));
  }

  /**
   * Liest wartende Updates aus. Wird nur von `--chat-id` benutzt, um die
   * eigene Chat-ID zu ermitteln, ohne sie irgendwo abtippen zu muessen.
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
