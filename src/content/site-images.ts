/**
 * Image slot registry — the exhaustive, typed inventory of every place a real
 * photograph belongs on veysl.de, plus the exact shot the client needs to
 * commission for it.
 *
 * WHY THIS FILE EXISTS: per `.claude/BRAND-FACTS.md` → "Media", the client has
 * zero usable wedding photography today. `<SiteImage slot="…">` (see
 * `src/components/media/`) resolves an uploaded image if the future CMS has
 * one, else the slot's `fallbackSrc`, else a designed empty state — so the
 * site looks finished with or without a photo, and simply gets better as real
 * ones arrive. Nothing here is ever a fabricated/stock substitute — see the
 * hard rule at the bottom of this file.
 *
 * CLIENT-FACING VERSION: `docs/IMAGE-SLOTS.md` is the same list, reformatted
 * as a shot list + legal checklist to hand to a photographer.
 *
 * CMS WIRING (read this before touching anything else): exactly one function
 * needs to change once the admin agent's `SiteImage` Payload collection
 * exists — `resolveSlot()` at the bottom of this file. Every call site
 * (`<SiteImage slot="…">`) already awaits it; nothing else changes.
 *
 * `resolveSlot()` is now wired to the admin agent's `site-images` Payload
 * collection (`src/payload/collections/site-image-slots.ts`). `SiteImage`
 * (`src/components/media/site-image.tsx`) is a Server Component and the only
 * runtime consumer of this file, so the Payload Local API import below never
 * reaches a client bundle — see `import 'server-only'` a few lines down,
 * which turns any future accidental client import into a build-time error
 * instead of a silent "payload needs node:fs in the browser" failure.
 */
import 'server-only';

import { readFromCms } from '@/lib/payload';

/** The five aspect ratios used across the whole site — deliberately small and closed, so every mounted photo (real or placeholder) reads as part of one system. */
export type SlotAspect = '16/9' | '4/5' | '1/1' | '3/2' | '21/9';

export interface ImageSlot {
  /** Stable, dot-namespaced key. Dynamic slots (city/region/blog/testimonial) register their template key here and are resolved per-instance as `${key}.${id}` — see `dynamicSlotKey()`. */
  key: string;
  /** Human-readable location, for the admin UI's slot list. */
  page: string;
  /** Human label for the admin UI. */
  label: string;
  /**
   * The shot list. What to photograph, framed the way a photographer's brief
   * would be — this is the highest-value field in this file, see
   * `docs/IMAGE-SLOTS.md`. German, matching the client's working language.
   */
  purpose: string;
  aspect: SlotAspect;
  /** 1 = biggest visual impact, shoot this first. 3 = nice to have. */
  priority: 1 | 2 | 3;
  /** Local fallback while no CMS upload exists. `null` = designed empty state (the default for almost every slot right now — see BRAND-FACTS "Media"). */
  fallbackSrc: string | null;
  /** Real alt text for `fallbackSrc`, when one is set. Never used when `fallbackSrc` is `null`. */
  fallbackAlt?: string;
  /** Guidance shown to whoever uploads the real photo — what the alt text must communicate. Not the alt text itself. */
  altHint: string;
  /** True for slots resolved with a per-instance suffix (city slug, region slug, blog slug, testimonial id) rather than a single fixed image. */
  dynamic?: boolean;
}

export const imageSlots: ImageSlot[] = [
  // ---------------------------------------------------------------------
  // Priority 1 — shoot these first. Highest visual impact, most-seen pages.
  // ---------------------------------------------------------------------
  {
    key: 'home.hero.background',
    page: 'Startseite — Hero',
    label: 'Hero-Hintergrund (Startseite)',
    purpose:
      'Volle Tanzfläche bei Nacht, Weitwinkel von der Bühne/DJ-Position aus. Gäste in Bewegung (eine leichte Bewegungsunschärfe wirkt hochwertiger als ein scharfes Gruppenfoto), warmes Bühnenlicht, DJ-Pult im Hintergrund erkennbar, aber nicht der Fokus. Muss auch stark abgedunkelt und mit Farbverlauf überlagert funktionieren — der Seitentitel liegt als Text darüber und bleibt die eigentliche LCP-Fläche, das Foto ist reine Atmosphäre dahinter.',
    aspect: '21/9',
    priority: 1,
    fallbackSrc: null,
    altHint:
      'Sachlich, ohne Namen einzelner Gäste, z. B. „Tanzfläche bei einer Hochzeitsfeier, Gäste tanzen im warmen Bühnenlicht, DJ-Pult im Hintergrund.“ Keine Keyword-Häufung.',
  },
  {
    key: 'home.showreel.poster',
    page: 'Startseite — Showreel',
    label: 'Vorschaubild Aftermovie',
    purpose:
      'Ein einzelnes, für sich stehendes Motiv aus dem künftigen Aftermovie — z. B. Brautpaar beim ersten Tanz oder Veysel mit Mikrofon im Moment einer Ansage. Das ist das Standbild vor dem Play-Button, muss also auch ohne Bewegung als eigenständiges Foto wirken, nicht wie ein zufälliger Videoframe.',
    aspect: '16/9',
    priority: 1,
    fallbackSrc: null,
    altHint: 'Konkret benennen, was im Standbild zu sehen ist, z. B. „Brautpaar beim Eröffnungstanz, Gäste im Hintergrund“.',
  },
  {
    key: 'weddings.hero.atmosphere',
    page: 'Echte Hochzeiten — Hero',
    label: 'Atmosphäre „Echte Hochzeiten“',
    purpose:
      'Stimmungsbild einer echten Hochzeit — Tanzfläche, Lichter, Bewegung, gerne leicht von oben oder seitlich. Kein Einzelpaar-Porträt (das kommt später in die Referenz-Galerie selbst, siehe src/content/weddings.ts), sondern die Atmosphäre des ganzen Abends als Auftakt der Seite.',
    aspect: '21/9',
    priority: 1,
    fallbackSrc: null,
    altHint: 'Beschreibt die Atmosphäre sachlich, ohne Namen, z. B. „Gäste tanzen auf einer Hochzeitsfeier, Lichterkette im Hintergrund.“',
  },
  {
    key: 'gallery.hero.atmosphere',
    page: 'Galerie — Hero',
    label: 'Atmosphäre Galerie',
    purpose:
      'Bewusst ein ANDERES Motiv als der Startseiten-Hero und die „Echte Hochzeiten“-Seite — z. B. eine Nahaufnahme von Lichtern, Nebel/Rauch auf der Tanzfläche oder Equipment im Einsatz statt einer weiteren Totale. Sonst wirken drei Seiten wie dieselbe Seite.',
    aspect: '21/9',
    priority: 1,
    fallbackSrc: null,
    altHint: 'Sachliche Beschreibung des Ausschnitts, z. B. „Lichtstimmung auf der Tanzfläche, Nahaufnahme.“',
  },
  {
    key: 'epk.portrait',
    page: 'EPK — Hero',
    label: 'Professionelles Porträt (Veysel)',
    purpose:
      'Das fehlende Herzstück des ganzen Projekts (siehe BRAND-FACTS.md „#1 launch blocker“): ein professionelles Porträt von Veysel — Studio- oder gutes natürliches Licht, hochwertiger/neutraler Hintergrund, Kopf-Schulter oder Halbtotale, seriös und gleichzeitig warm. Wird auf EPK, potenziell Google Business Profile und in der Presse verwendet — das wichtigste Einzelfoto im gesamten Projekt.',
    aspect: '4/5',
    priority: 1,
    fallbackSrc: null,
    altHint: '„Veysel Durmuş, DJ, Musiker und Moderator“ — knapp, konkret, kein Marketing-Claim im Alt-Text.',
  },
  {
    key: 'musik.hero.performance',
    page: 'Musik — Hero',
    label: 'Live-Performance',
    purpose:
      'Live-Action-Moment: Veysel spielt Saz oder Gitarre, oder steht mit sichtbarem DJ-Equipment am Pult. Unterstreicht auf der Musik-Seite direkt die „DJ & Orkestra“-Positionierung statt eines reinen Kopfhörer-DJ-Klischees.',
    aspect: '16/9',
    priority: 1,
    fallbackSrc: null,
    altHint: 'Konkret benennen, welches Instrument/Setup zu sehen ist, z. B. „Veysel Durmuş spielt Saz auf einer Bühne.“',
  },

  // ---------------------------------------------------------------------
  // Priority 2 — second wave.
  // ---------------------------------------------------------------------
  {
    key: 'home.intro.portrait',
    page: 'Startseite — Intro/Vertrauen',
    label: 'Porträt bei der Arbeit',
    purpose:
      'Halbnahes, natürliches Foto von Veysel bei der Arbeit — moderierend mit Mikrofon oder am DJ-Pult, Tageslicht oder warmes Bühnenlicht, kein durchgestyltes Studio-Posing.',
    aspect: '4/5',
    priority: 2,
    fallbackSrc: null,
    altHint: '„Veysel Durmuş moderiert mit Mikrofon auf einer Hochzeitsfeier“ o. ä. — konkret, nicht generisch.',
  },
  {
    key: 'services.wedding.image',
    page: 'Leistungen — Hochzeits-DJ',
    label: 'Service-Block: Hochzeit',
    purpose:
      'Zentraler Hochzeitsmoment: Brautpaar im Fokus, Tanz oder Zeremonie, warmes Licht, Location im unscharfen Hintergrund erkennbar.',
    aspect: '4/5',
    priority: 2,
    fallbackSrc: null,
    altHint: 'Beschreibt Szene und Setting, keine Namen ohne Einwilligung, z. B. „Brautpaar tanzt, Gäste applaudieren im Hintergrund.“',
  },
  {
    key: 'services.engagement.image',
    page: 'Leistungen — Verlobung/Kına',
    label: 'Service-Block: Verlobung',
    purpose:
      'Verlobungsfeier oder Kına-Abend: kleinerer, intimerer Rahmen, warmes/gedämpftes Licht. Details wie Henna-Tablett oder Ringe sind erlaubt, keine Großveranstaltungs-Optik.',
    aspect: '4/5',
    priority: 2,
    fallbackSrc: null,
    altHint: 'Konkret die Feierform benennen, z. B. „Kına-Abend, Henna-Tablett auf dem Tisch, gedämpftes Licht.“',
  },
  {
    key: 'services.afterparty.image',
    page: 'Leistungen — Afterparty',
    label: 'Service-Block: Afterparty',
    purpose:
      'Tanzfläche spät am Abend, energiegeladen. Nahaufnahme von Bewegung/Licht statt einer ruhigen Totale — soll spürbar „lauter“ wirken als das Hochzeitsfoto oben.',
    aspect: '4/5',
    priority: 2,
    fallbackSrc: null,
    altHint: 'Beschreibt Energie und Uhrzeit-Stimmung, z. B. „Tanzfläche spät in der Nacht, Gäste in Bewegung, Lichteffekte.“',
  },
  {
    key: 'services.corporate.image',
    page: 'Leistungen — Firmenfeier',
    label: 'Service-Block: Firmenfeier',
    purpose:
      'Firmen-/Corporate-Event: seriöserer, aufgeräumter Rahmen. DJ-Setup mit dezenter Beschallung, Gäste im Business-Kontext erkennbar, aber im Detail nicht identifizierbar.',
    aspect: '4/5',
    priority: 2,
    fallbackSrc: null,
    altHint: 'Neutral halten, z. B. „DJ-Setup bei einer Firmenveranstaltung, Gäste im Hintergrund.“ Keine erkennbaren Firmenlogos ohne Freigabe.',
  },
  {
    key: 'packages.signature.image',
    page: 'Pakete — Signature',
    label: 'Paket-Bild: Signature',
    purpose:
      'Volle Tanzfläche im Peak-Moment — das klassische „das ist die Show“-Foto. Signature ist das meistgebuchte Paket und verdient das stärkste Bild der drei Pakete.',
    aspect: '3/2',
    priority: 2,
    fallbackSrc: null,
    altHint: 'z. B. „Volle Tanzfläche im Höhepunkt der Feier, Gäste in Bewegung, DJ-Pult im Hintergrund.“',
  },
  {
    key: 'epk.pressPhoto.performance',
    page: 'EPK — Pressefotos',
    label: 'Pressefoto: Live-Performance',
    purpose: 'Live-Action-Foto: Veysel spielt Saz oder Gitarre auf einer Bühne/Feier, Publikum im Hintergrund erkennbar.',
    aspect: '3/2',
    priority: 2,
    fallbackSrc: null,
    altHint: '„Veysel Durmuş spielt Saz live bei einer Hochzeitsfeier.“',
  },
  {
    key: 'epk.pressPhoto.hosting',
    page: 'EPK — Pressefotos',
    label: 'Pressefoto: Moderation',
    purpose: 'Veysel moderiert mit Mikrofon, Gestik/Energie erkennbar — zeigt ihn als Entertainer, nicht nur als DJ.',
    aspect: '3/2',
    priority: 2,
    fallbackSrc: null,
    altHint: '„Veysel Durmuş moderiert mit Mikrofon.“',
  },
  {
    key: 'city.header.background',
    page: 'Stadt-Seiten (je Stadt, z. B. city.header.background.stuttgart)',
    label: 'Stadt-Header-Hintergrund',
    purpose:
      'Idealerweise ein Foto AUS genau dieser Stadt/Location — z. B. eine bereits im Seitentext genannte, echte Location (Schloss Solitude, Residenzschloss Ludwigsburg, Esslinger Burg, Festsaal Schloss Karlsburg Durlach …) bei einer tatsächlichen Feier. Ersatzweise ein Stimmungsbild aus derselben Region. KEIN generisches Stadt-Skyline-Stockfoto — das wirkt austauschbar und widerspricht der bewussten „keine Doorway-Page“-Haltung dieser Seiten (siehe src/content/cities.ts, Dateikopf).',
    aspect: '16/9',
    priority: 2,
    fallbackSrc: null,
    altHint: 'Nennt Location UND Stadt konkret, z. B. „Festsaal Schloss Karlsburg Durlach, Karlsruhe, bei einer Abendveranstaltung.“',
    dynamic: true,
  },
  {
    key: 'blog.cover',
    page: 'Ratgeber/Blog (je Artikel, z. B. blog.cover.hochzeits-dj-checkliste)',
    label: 'Artikel-Titelbild',
    purpose:
      'Ein zum jeweiligen Thema passendes, echtes Foto — z. B. beim Artikel zum Kına-Abend ein Henna-Tablett-Moment, beim Artikel zur Tanzflächen-Dramaturgie ein Tanzflächen-Bild. Kein generisches Stockfoto. Ohne passendes echtes Motiv bleibt der Slot leer und `MediaFigure` zeigt den gestalteten Platzhalter statt eines thematisch beliebigen Fotos.',
    aspect: '3/2',
    priority: 2,
    fallbackSrc: null,
    altHint: 'Beschreibt das konkrete Motiv des Artikelbilds, nicht den Artikeltitel wiederholen.',
    dynamic: true,
  },
  {
    key: 'kontakt.portrait',
    page: 'Kontakt — Hero',
    label: 'Porträt/Vertrauensbild',
    purpose:
      'Freundliches, nahbares Foto von Veysel — unterstützt auf der Kontaktseite die Frage „wer antwortet mir hier eigentlich“. Kann dasselbe Motiv wie epk.portrait sein.',
    aspect: '4/5',
    priority: 2,
    fallbackSrc: null,
    altHint: '„Veysel Durmuş, DJ, Musiker und Moderator“ — wie epk.portrait.',
  },

  // ---------------------------------------------------------------------
  // Priority 3 — nice to have, or already fulfilled.
  // ---------------------------------------------------------------------
  {
    key: 'home.testimonials.avatar',
    page: 'Startseite — Stimmen (je Testimonial, z. B. home.testimonials.avatar.<id>)',
    label: 'Testimonial-Porträt',
    purpose:
      'Kleines, freundliches Foto des Brautpaars bzw. der Referenzperson — NUR mit ausdrücklicher Einwilligung. Portrait-artig, Gesicht erkennbar, neutraler Hintergrund. Ein Foto pro veröffentlichter, echter Kundenstimme (siehe src/content/testimonials.ts, aktuell bewusst leer — siehe .claude/BRAND-FACTS.md).',
    aspect: '1/1',
    priority: 3,
    fallbackSrc: null,
    altHint: 'Vorname(n) plus neutrale Beschreibung, z. B. „Porträt von A. und B., Brautpaar“ — nur mit Einwilligung der Abgebildeten veröffentlichen.',
    dynamic: true,
  },
  {
    key: 'packages.essential.image',
    page: 'Pakete — Essential',
    label: 'Paket-Bild: Essential',
    purpose: 'Kleine, intime Feier — reduziertes Setup, wenige Gäste, ruhige Stimmung. Zeigt: „kleiner“ heißt nicht „weniger hochwertig“.',
    aspect: '3/2',
    priority: 3,
    fallbackSrc: null,
    altHint: 'z. B. „Kleine Feier mit reduziertem DJ-Setup, wenige Gäste.“',
  },
  {
    key: 'packages.prestige.image',
    page: 'Pakete — Prestige',
    label: 'Paket-Bild: Prestige',
    purpose:
      'Live-Orchester-Moment: Bläser/Saz sichtbar neben DJ-Setup, größere Location. Zeigt die „DJ & Orkestra aus einer Hand“-Positionierung konkret im Bild.',
    aspect: '3/2',
    priority: 3,
    fallbackSrc: null,
    altHint: 'z. B. „Live-Band mit Bläsern neben dem DJ-Pult bei einer großen Feier.“',
  },
  {
    key: 'epk.personalStory',
    page: 'EPK — Persönliche Geschichte',
    label: 'Persönliche Geschichte (bereits vorhanden)',
    purpose:
      'Bereits erfüllt: Veysel beim Wandern in den Alpen (siehe src/content/epk.ts → epkImages.personalStory, laut BRAND-FACTS.md für genau diesen Zweck freigegeben). Kein neues Foto nötig, es sei denn, ein noch persönlicheres Motiv soll es später ablösen.',
    aspect: '4/5',
    priority: 3,
    fallbackSrc: '/images/legacy/08-2ef27d08.jpg',
    fallbackAlt: 'Veysel Durmuş beim Wandern in den Alpen',
    altHint: 'Bereits vergeben — siehe fallbackAlt. Bei Ersatzmotiv: Ort und Aktivität konkret benennen.',
  },
  {
    key: 'epk.setupDetail',
    page: 'EPK — Setup-Detail',
    label: 'Setup/Soundcheck (bereits vorhanden)',
    purpose:
      'Bereits erfüllt: Veysel am DJ-Pult beim Soundcheck (siehe src/content/epk.ts → epkImages.setupDetail). Laut Media-Review NUR als kleines Detailbild zulässig, niemals als Hero — genau so wird es aktuell auch verwendet. Kein weiterer Handlungsbedarf, bis ein besseres Setup-Foto (echtes Event statt leerer Raum) entsteht.',
    aspect: '4/5',
    priority: 3,
    fallbackSrc: '/images/legacy/01-156b4efb.jpg',
    fallbackAlt: 'Veysel Durmuş an seinem DJ-Pult beim Soundcheck',
    altHint: 'Bereits vergeben — siehe fallbackAlt.',
  },
  {
    key: 'region.header.background',
    page: 'Länder-Seiten (je Land, z. B. region.header.background.oesterreich)',
    label: 'Länder-Header-Hintergrund',
    purpose:
      'Ein Foto vom tatsächlichen Auftritt, wo belegt (aktuell nur Wien, siehe site.verifiedInternational in src/content/site.ts) — für alle anderen Länder bewusst leer lassen statt eines generischen Landes-Stockfotos.',
    aspect: '21/9',
    priority: 3,
    fallbackSrc: null,
    altHint: 'Nur mit echtem, belegtem Auftritt — Ort und Anlass konkret benennen.',
    dynamic: true,
  },
  {
    key: 'ablauf.process.image',
    page: 'Ablauf — Prozess',
    label: 'Vorgespräch/Soundcheck',
    purpose:
      'Ein Vorgespräch- oder Soundcheck-Moment, der die auf dieser Seite beschriebene Sorgfalt (Technikabstimmung vor jedem Event) konkret im Bild zeigt.',
    aspect: '16/9',
    priority: 3,
    fallbackSrc: null,
    altHint: 'z. B. „Soundcheck vor einer Veranstaltung, Technik wird aufgebaut.“',
  },
  {
    key: 'og.default',
    page: 'Global — Social-Share-Bild (OG)',
    label: 'Standard-Vorschaubild (Google/Social)',
    purpose:
      'Teilbild für Google- und Social-Media-Vorschauen, 1200×630 px (hier am nächsten am Seitenverhältnis 16:9 abgebildet). Bis echtes Bildmaterial vorliegt, ist ein rein typografisches Motiv (Wortmarke VEYSL auf dunklem Gold-Grund, Cormorant-Garamond-Type) dem Versuch vorzuziehen, ein noch unpassendes Foto zu erzwingen. Wird in src/lib/seo.ts (DEFAULT_OG_IMAGE, SEO-Agent) referenziert, nicht direkt über diese Registry ausgespielt.',
    aspect: '16/9',
    priority: 3,
    fallbackSrc: null,
    altHint: `„${'VEYSL'} — Hochzeits-DJ, Musiker & Moderator“ oder das im Foto tatsächlich abgebildete Motiv, falls ein echtes Foto verwendet wird.`,
  },
];

/**
 * Exact keys with a literal (non-dynamic) registry entry — for editor
 * autocomplete on `<SiteImage slot="…">`. Dynamic slots (city/region/blog/
 * testimonial) are intentionally NOT part of this union — see
 * `dynamicSlotKey()` and `SiteImageSlotKey` in `src/components/media/`.
 */
export type ImageSlotKey = (typeof imageSlots)[number]['key'];

/** Builds a dynamic slot key from its registry base, e.g. `dynamicSlotKey('city.header.background', 'stuttgart')` → `'city.header.background.stuttgart'`. */
export function dynamicSlotKey(base: ImageSlotKey, id: string): string {
  return `${base}.${id}`;
}

/** Looks up a slot's registry definition — resolves dynamic keys (`city.header.background.stuttgart`) against their base entry (`city.header.background`). */
export function getImageSlot(key: string): ImageSlot | undefined {
  const exact = imageSlots.find((slot) => slot.key === key);
  if (exact) return exact;
  return imageSlots.find((slot) => slot.dynamic && key.startsWith(`${slot.key}.`));
}

export interface ResolvedImage {
  src: string;
  alt: string;
}

/**
 * THE single place to wire the CMS. Once the admin agent's `SiteImage`
 * Payload collection exists, replace the body below with a real lookup (e.g.
 * a Payload `find` on `collection: 'site-images'` filtered by `key`) and map
 * the stored upload to `ResolvedImage`. Every call site
 * (`<SiteImage slot="…">` in `src/components/media/site-image.tsx`) already
 * awaits this function — nothing else in the codebase needs to change.
 *
 * Returns `null` today by design: no CMS-uploaded image exists for any slot
 * yet. `<SiteImage>` then falls back to the slot's `fallbackSrc`, and finally
 * to the designed empty state — see `.claude/BRAND-FACTS.md` "Media".
 */
export async function resolveSlot(key: string): Promise<ResolvedImage | null> {
  // Läuft im Render-Pfad jeder Seite mit Bild-Slot, deshalb über `readFromCms`
  // (Zeitlimit + Fallback). Ein blockierendes Payload würde sonst nicht nur
  // dieses Bild, sondern die ganze Seite aufhalten — beim Build hat genau das
  // ~190 Seiten in den Timeout laufen lassen. Fällt sauber auf `fallbackSrc`
  // bzw. den gestalteten Leerzustand zurück, exakt wie "noch kein Eintrag".
  return readFromCms(
    async (payload) => {
      const result = await payload.find({
        collection: 'site-images',
        where: { key: { equals: key } },
        depth: 1,
        limit: 1,
        pagination: false,
      });

      const image = result.docs[0]?.image;
      if (!image || typeof image !== 'object' || !('url' in image) || !image.url) return null;

      return { src: image.url as string, alt: typeof image.alt === 'string' ? image.alt : '' };
    },
    null,
    `site-image "${key}"`
  );
}

/**
 * HARD RULE — see `.claude/BRAND-FACTS.md`: never wire `fallbackSrc` to a
 * stock photo, a photo of someone other than Veysel, or any legacy file not
 * explicitly cleared for that exact use. Only two files are cleared today —
 * `08-2ef27d08.jpg` (personal story, EPK only) and `01-156b4efb.jpg` (setup
 * detail, small/never-hero) — both already wired above. `05-86ab7620.jpg` is
 * never usable anywhere: it is a stock photo, not Veysel.
 */
export const NEVER_USE_LEGACY_FILE = '05-86ab7620.jpg';
