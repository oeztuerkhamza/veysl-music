// Wer den Bot bedienen darf — und was er darf.
//
// Der Bot ist ueber seinen Namen oeffentlich auffindbar. Ohne diese Liste
// koennte jeder Fremde die Suchen lesen, aendern und loeschen. Deshalb gilt:
// erlaubt ist nur, wer hier steht. Alles andere wird stillschweigend
// verworfen — eine Antwort wuerde einem Fremden nur verraten, dass der Bot
// lebt.
//
// Der Besitzer ist `telegram.chatId` aus der Konfiguration. Er hat immer alle
// Rechte und kann als Einziger weitere Leute aufnehmen (/user).

/** Die vergebbaren Rechte, in der Reihenfolge, in der sie angezeigt werden. */
export const RIGHTS = ['list', 'add', 'remove'];

const RIGHT_LABELS = {
  list: 'ansehen',
  add: 'anlegen',
  remove: 'loeschen',
};

/** Rechte, die ein neuer Nutzer ohne weitere Angabe bekommt. */
export const DEFAULT_RIGHTS = ['list'];

/** Schreibt Rechte fuer Menschen lesbar: "ansehen, anlegen". */
export function describeRights(rights) {
  if (!rights || rights.length === 0) return 'keine Rechte';
  return RIGHTS.filter((r) => rights.includes(r))
    .map((r) => RIGHT_LABELS[r])
    .join(', ');
}

/**
 * Liest eine Rechteangabe wie "anlegen,loeschen" oder "add remove".
 * Akzeptiert beide Schreibweisen, weil das hier auf einem Telefon getippt wird.
 * Gibt `null` zurueck, wenn etwas Unbekanntes dabei ist — dann ist ein
 * Tippfehler im Spiel, und stumm weniger Rechte zu vergeben waere die
 * schlechtere Antwort.
 */
export function parseRights(raw) {
  const words = String(raw ?? '')
    .toLowerCase()
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (words.length === 0) return null;

  const aliases = {
    list: 'list',
    ansehen: 'list',
    lesen: 'list',
    add: 'add',
    anlegen: 'add',
    hinzufuegen: 'add',
    hinzufügen: 'add',
    remove: 'remove',
    loeschen: 'remove',
    löschen: 'remove',
    delete: 'remove',
  };

  const rights = new Set();
  for (const word of words) {
    if (word === 'alle' || word === 'all') {
      for (const r of RIGHTS) rights.add(r);
      continue;
    }
    const right = aliases[word];
    if (!right) return null;
    rights.add(right);
  }
  return RIGHTS.filter((r) => rights.has(r));
}

/** Normalisiert einen Eintrag aus `telegram.users`. */
function normalizeUser(raw) {
  if (raw == null) return null;
  // Eine blosse Zahl oder ein String ist erlaubt: dann gelten die Grundrechte.
  if (typeof raw === 'number' || typeof raw === 'string') {
    return { id: String(raw).trim(), name: null, rights: [...DEFAULT_RIGHTS] };
  }
  if (typeof raw !== 'object' || !raw.id) return null;
  const rights = Array.isArray(raw.rights)
    ? RIGHTS.filter((r) => raw.rights.includes(r))
    : [...DEFAULT_RIGHTS];
  return { id: String(raw.id).trim(), name: raw.name?.trim() || null, rights };
}

/** Die erlaubten Nutzer aus einer rohen Konfiguration, ohne den Besitzer. */
export function readUsers(rawConfig) {
  const list = rawConfig?.telegram?.users;
  if (!Array.isArray(list)) return [];
  return list.map(normalizeUser).filter(Boolean);
}

/**
 * Entscheidet, wer da schreibt.
 *
 * Geprueft werden beide Kennungen: die des Absenders (`from.id`) und die des
 * Chats. In einem Einzelchat sind sie gleich; in einer Gruppe nicht — dort ist
 * der Chat gemeinsam, und wichtig ist, wer getippt hat.
 *
 * Gibt `null` zurueck, wenn niemand davon erlaubt ist.
 */
export function resolveActor({ ownerChatId, users, fromId, chatId }) {
  const owner = String(ownerChatId);
  const candidates = [fromId, chatId].filter((v) => v != null).map(String);

  if (candidates.includes(owner)) {
    return { id: owner, name: 'Besitzer', rights: [...RIGHTS], isOwner: true };
  }

  for (const user of users) {
    if (candidates.includes(user.id)) return { ...user, isOwner: false };
  }
  return null;
}

/** Darf dieser Absender das? Der Besitzer darf immer alles. */
export function may(actor, right) {
  return Boolean(actor?.isOwner || actor?.rights?.includes(right));
}
