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

/**
 * Baut den Link auf die eigene Brueckenseite, die von sich aus in die
 * Kleinanzeigen-App springt (src/app/api/ka/[...path]/route.ts).
 *
 * Ein `ebayk://`-Link direkt in der Nachricht geht nicht — die Bot-API nimmt
 * ihn an, der iOS-Client macht daraus aber keinen antippbaren Link. Und der
 * nackte https-Link oeffnet die App auch nicht, weil Telegram ihn in seinem
 * eingebauten Browser laedt, wo iOS Universal Links abgeschaltet sind. Der
 * Umweg ueber eine eigene Seite ist der einzige Weg, der beides umgeht.
 *
 * Ohne konfigurierte `bridgeBaseUrl` gibt es keinen Bruecken-Link; dann bleibt
 * es beim gewoehnlichen https-Link.
 */
export function bridgeLink(adUrl, baseUrl, title, message) {
  if (!baseUrl) return null;
  try {
    const ad = new URL(adUrl);
    if (!ad.hostname.endsWith('kleinanzeigen.de')) return null;

    const match = ad.pathname.match(/^\/s-anzeige\/([^/]+)\/([^/]+)\/?$/);
    if (!match) return null;

    const bridge = new URL(`api/ka/${match[1]}/${match[2]}`, `${baseUrl.replace(/\/+$/, '')}/`);
    // Beides ist reiner Anzeigetext — das Sprungziel steht vollstaendig im Pfad
    // und haengt an keinem Parameter.
    if (title) bridge.searchParams.set('t', title.slice(0, 120));
    if (message) bridge.searchParams.set('m', message.slice(0, 600));
    return bridge.toString();
  } catch {
    return null;
  }
}

/**
 * Setzt die Platzhalter der Nachrichtenvorlage. Unbekannte Platzhalter bleiben
 * stehen, damit ein Tippfehler in der Vorlage sichtbar wird, statt still eine
 * Luecke in die Nachricht an den Verkaeufer zu reissen.
 */
export function renderMessage(template, ad) {
  if (!template) return null;
  const values = {
    title: ad.title ?? '',
    price: ad.price ?? '',
    location: ad.location ?? '',
    url: ad.url ?? '',
  };
  const text = template.replace(/\{(title|price|location|url)\}/g, (_, key) => values[key]);
  return text.trim() || null;
}

export class Telegram {
  #token;
  #chatId;
  #bridgeBaseUrl;
  #nextSlot = 0;

  constructor(token, chatId, { bridgeBaseUrl = null } = {}) {
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN fehlt.');
    if (!chatId) throw new Error('Keine chatId konfiguriert.');
    this.#token = token;
    this.#chatId = String(chatId);
    this.#bridgeBaseUrl = bridgeBaseUrl;
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

  /**
   * Haelt den Mindestabstand zwischen zwei Nachrichten ein.
   *
   * Der Platz wird VOR dem Warten reserviert. Vorher wurde er danach gesetzt,
   * und damit half die Bremse ausgerechnet dann nicht, wenn man sie braucht:
   * mehrere gleichzeitige Sender lasen alle denselben Wert, warteten alle
   * gleich lang und feuerten dann zusammen los. Nachgemessen gingen von fuenf
   * parallelen Sendungen vier in derselben Millisekunde raus — worauf Telegram
   * mit 429 antwortet und die Meldung eben doch verspaetet ankommt.
   *
   * Genau dieser Fall ist der Normalfall: mehrere neue Anzeigen in einer Runde,
   * oder eine Meldung, die mit der Antwort auf /list zusammenfaellt.
   */
  async #throttle() {
    const now = Date.now();
    const slot = Math.max(now, this.#nextSlot);
    this.#nextSlot = slot + MIN_GAP_MS;
    if (slot > now) await new Promise((r) => setTimeout(r, slot - now));
  }

  /**
   * `chatId` schickt die Antwort an einen anderen erlaubten Chat statt an den
   * Besitzer — ein Helfer bekommt die Antwort auf seinen eigenen Befehl dort,
   * wo er ihn getippt hat. Ohne Angabe geht alles an den Besitzer.
   */
  async sendText(text, { buttons, forceReply, chatId } = {}) {
    await this.#throttle();
    // `force_reply` oeffnet das Eingabefeld mit Zitat. Nur so laesst sich eine
    // Antwort spaeter der richtigen Suche zuordnen — Telegram-Tasten koennen
    // keinen freien Text einsammeln.
    const markup = buttons
      ? { inline_keyboard: buttons }
      : forceReply
        ? { force_reply: true, input_field_placeholder: 'Text für die Erstnachricht' }
        : null;

    return this.#call('sendMessage', {
      chat_id: String(chatId ?? this.#chatId),
      text,
      parse_mode: 'HTML',
      // Die Vorschau wuerde die Nachricht um ein grosses Bild verlaengern und
      // das Antippen des Links nach unten schieben.
      link_preview_options: { is_disabled: true },
      ...(markup ? { reply_markup: markup } : {}),
    });
  }

  /** Formatiert eine Anzeige als Alarmnachricht. */
  async sendAd(ad, watchLabel, messageTemplate = null) {
    const lines = [`🆕 <b>${escapeHtml(ad.title || 'Ohne Titel')}</b>`];

    const facts = [];
    if (ad.price) facts.push(`💶 ${escapeHtml(ad.price)}`);
    if (ad.location) facts.push(`📍 ${escapeHtml(ad.location)}`);
    if (ad.postedAt) facts.push(`🕒 ${escapeHtml(ad.postedAt)}`);
    facts.push(ad.isCommercial ? '🏪 Gewerblich' : '👤 Privat');
    if (ad.shipping) facts.push('📦 Versand');
    lines.push(facts.join('  ·  '));

    // Nur der Brueckenlink: er landet in der App, und dort ist Schreiben ein
    // Tipp statt eines Logins. Der zweite Link daneben fuehrte in Telegrams
    // eingebauten Browser — also genau dorthin, wo man sich erst einloggen
    // muss. Ein Fehltipp kostete damit die schnelle Antwort, um die es hier
    // geht.
    //
    // Ohne konfigurierte `bridgeBaseUrl` gibt es keine Bruecke; dann bleibt
    // der gewoehnliche Link als einziger Weg zur Anzeige stehen — eine Meldung
    // ganz ohne Link waere nutzlos.
    const message = renderMessage(messageTemplate, ad);
    const bridge = bridgeLink(ad.url, this.#bridgeBaseUrl, ad.title, message);
    const links = [];
    if (bridge) {
      // `&amp;` statt `&`: im HTML-Modus lehnt Telegram eine Nachricht mit
      // nacktem Ampersand mit "can't parse entities" ab — und zwar die ganze,
      // nicht nur den Link.
      const label = message ? 'Text kopieren &amp; in der App oeffnen' : 'In der App oeffnen';
      links.push(`📱 <a href="${escapeHtml(bridge)}">${label}</a>`);
    } else {
      links.push(`🔗 <a href="${escapeHtml(ad.url)}">Anzeige oeffnen</a>`);
    }

    lines.push('', links.join('  ·  '));
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
  async editText(messageId, text, { buttons, chatId } = {}) {
    return this.#call('editMessageText', {
      chat_id: String(chatId ?? this.#chatId),
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

/**
 * Legt einen Chat als Antwortziel fest.
 *
 * Befehle duerfen nicht nur vom Besitzer kommen, und die Antwort gehoert
 * dorthin, wo der Befehl getippt wurde. Statt jeden einzelnen Aufruf in
 * commands.mjs um einen Parameter zu erweitern — und dabei einen zu vergessen,
 * der dann still im falschen Chat landet — wird hier einmal umgehaengt.
 *
 * `sendAd` fehlt mit Absicht: die Anzeigen-Alarme gehen immer nur an den
 * Besitzer.
 */
export function replyTo(telegram, chatId) {
  if (chatId == null) return telegram;
  return {
    chatId: telegram.chatId,
    sendText: (text, options = {}) => telegram.sendText(text, { ...options, chatId }),
    editText: (id, text, options = {}) => telegram.editText(id, text, { ...options, chatId }),
    answerCallback: (id, text) => telegram.answerCallback(id, text),
  };
}
