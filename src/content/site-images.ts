/**
 * Image slot registry — the exhaustive, typed inventory of every place a real
 * photograph belongs on dj-veys.de, plus the exact shot the client needs to
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

import { toSameOriginMediaPath } from '@/lib/media-url';
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
  /** Local fallback while no CMS upload exists. `null` = designed empty state (see BRAND-FACTS "Media"). */
  fallbackSrc: string | null;
  /** Real alt text for `fallbackSrc`, when one is set. Never used when `fallbackSrc` is `null`. */
  fallbackAlt?: string;
  /** Guidance shown to whoever uploads the real photo — what the alt text must communicate. Not the alt text itself. */
  altHint: string;
  /** True for slots resolved with a per-instance suffix (city slug, region slug, blog slug, testimonial id) rather than a single fixed image. */
  dynamic?: boolean;
  /**
   * Fallbacks for `dynamic` slots, keyed by the instance id (city slug, blog
   * slug, …). A dynamic slot must never use `fallbackSrc`: that single value
   * would answer for *every* instance, and the Stuttgart photo would show up
   * on the Karlsruhe page — the exact "interchangeable doorway page" effect
   * `src/content/cities.ts` was built to avoid. An id with no entry here
   * resolves to the designed empty state, same as before.
   */
  dynamicFallbacks?: Record<string, { src: string; alt: string }>;
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
    // BEWUSST LEER — nicht aus Mangel, sondern weil dieser Slot ein Motiv
    // verlangt, das es noch nicht gibt.
    //
    // Der Hero ist eine 100vw-Fläche mit der Höhe des Fensters, also je nach
    // Gerät zwischen etwa 1,6:1 und 0,5:1. `object-cover` schneidet ein Foto
    // deshalb hier härter zu als an jeder anderen Stelle der Seite, und zwar
    // in einer Richtung, die niemand vorher kennt. Für ein Motiv, das aus
    // Fläche besteht (volle Tanzfläche, Licht, Nebel), ist das folgenlos. Für
    // ein Motiv mit einer Person darin ist es das nicht: Der Bühnenmoment, der
    // hier eine Zeit lang stand, wurde bei 1265×784 seitlich beschnitten und
    // hochskaliert — er sah angeschnitten aus, weil er es war.
    //
    // Statt ihn kleinzurechnen, steht er jetzt eine Etage tiefer in
    // `home.stage.image`, in einem Band mit fester 21:9-Geometrie, das genau
    // seinem Zuschnitt entspricht. Hier bleibt so lange nichts, bis ein Foto
    // vorliegt, das einen unvorhersehbaren Beschnitt aushält.
    fallbackSrc: null,
    altHint:
      'Sachlich, ohne Namen einzelner Gäste, z. B. „Tanzfläche bei einer Hochzeitsfeier, Gäste tanzen im warmen Bühnenlicht, DJ-Pult im Hintergrund.“ Keine Keyword-Häufung.',
  },
  {
    key: 'home.stage.image',
    page: 'Startseite — Bildband unter dem Hero',
    label: 'Bildband (Startseite, unter dem Hero)',
    purpose:
      'Ein Motiv, das für sich steht statt als Hintergrund zu dienen: Bühne, Tanzfläche oder Saal im Moment der Feier, quer und weit. Anders als beim Hero ist die Geometrie hier fest (21:9) und das Bild wird nicht abgedunkelt — es liegt kein Text darüber. Ein Foto mit einer Person darin ist hier also ausdrücklich richtig, während es im Hero am unvorhersehbaren Beschnitt scheitert.',
    aspect: '21/9',
    priority: 1,
    fallbackSrc: '/images/veys/buehne-abend-21x9.jpg',
    fallbackAlt: 'Veysel Durmuş moderiert mit Mikrofon auf der Bühne, Live-Musiker im Hintergrund',
    altHint: 'Beschreibt das Motiv sachlich und ohne Namen einzelner Gäste, z. B. „Veysel Durmuş an der Bühne, Gäste auf der Tanzfläche.“',
  },
  {
    key: 'home.showreel.poster',
    page: 'Startseite — Showreel',
    label: 'Vorschaubild Aftermovie',
    purpose:
      'Ein einzelnes, für sich stehendes Motiv aus dem künftigen Aftermovie — z. B. Brautpaar beim ersten Tanz oder Veysel mit Mikrofon im Moment einer Ansage. Das ist das Standbild vor dem Play-Button, muss also auch ohne Bewegung als eigenständiges Foto wirken, nicht wie ein zufälliger Videoframe.',
    aspect: '16/9',
    priority: 1,
    // VORLÄUFIG: Es gibt keinen Aftermovie, also auch kein Standbild daraus.
    // Bis dahin trägt der Abschnitt das Abendbild der Location. Wichtig: Ohne
    // `embedUrl` zeigt `ShowreelFacade` bewusst KEINEN Play-Knopf darüber —
    // ein Abspielknopf ohne Video wäre ein Versprechen, das die Seite nicht
    // halten kann.
    fallbackSrc: '/images/veys/saal-abend-16x9.jpg',
    fallbackAlt: 'Hochzeitssaal am Abend, Blumenbogen und eingedeckte Tafeln im violetten Licht',
    altHint: 'Konkret benennen, was im Standbild zu sehen ist, z. B. „Brautpaar beim Eröffnungstanz, Gäste im Hintergrund“.',
  },
  {
    key: 'weddings.hero.atmosphere',
    page: 'Echte Hochzeiten — Hero',
    label: 'Atmosphäre „Echte Hochzeiten“',
    purpose:
      'Stimmungsbild einer echten Hochzeit — Tanzfläche, Lichter, Bewegung, gerne leicht von oben oder seitlich. Kein Einzelpaar-Porträt (das kommt später in die Referenz-Galerie selbst, siehe die Payload-Collection „Referenz-Hochzeiten“), sondern die Atmosphäre des ganzen Abends als Auftakt der Seite.',
    aspect: '21/9',
    priority: 1,
    // Aus der Kundenlieferung 08/2026: echte Abendhochzeit, Blütenbogen und
    // eingedeckte Tafeln im violetten Uplight, ankommende Gäste, Veysel am
    // Pult im Vordergrund. Das erste Bild im Projekt, das eine echte Location
    // am Abend zeigt.
    fallbackSrc: '/images/veys/location-abendstimmung-21x9.jpg',
    fallbackAlt: 'Hochzeitssaal am Abend: eingedeckte Tafeln und Blumenbogen im violetten Licht, Veysel Durmuş am DJ-Pult im Vordergrund',
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
    // Erfüllt den Auftrag dieses Slots wörtlich: Equipment im Einsatz mit
    // Nebel und Licht statt einer dritten Totale. Bewusst *ohne* Personen —
    // damit unterscheidet sich die Galerie-Seite auf den ersten Blick von
    // Startseite und „Echte Hochzeiten“.
    fallbackSrc: '/images/veys/licht-nebel-21x9.jpg',
    fallbackAlt: 'Beleuchtetes DJ-Pult im Bodennebel, farbige Lichteffekte an der Wand dahinter',
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
    // VORLÄUFIG. Aus der Lieferung 08/2026 das mit Abstand porträtnächste
    // Bild: Veysel im weißen Hemd mit Fliege, lachend, auf einer Feier. Warm
    // und nahbar, Gesicht scharf — aber eben ein Reportagebild, kein
    // gesetztes Porträt vor ruhigem Hintergrund. Der Ausschnitt ist enger als
    // nötig, weil die weitere Fassung einen klar erkennbaren Gast am rechten
    // Rand behielt (siehe DSGVO-Abschnitt in FOTO-LISTESI.md).
    // Der eigentliche Zielshot aus `purpose` bleibt offen und ist weiterhin
    // das lohnendste Einzelfoto des Projekts.
    fallbackSrc: '/images/veys/portrait-warm-4x5.jpg',
    fallbackAlt: 'Veysel Durmuş, DJ, Musiker und Moderator',
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
    // Das Bild, das die „DJ & Orkestra"-Positionierung in einem einzigen
    // Rahmen belegt: Veysel mit Mikrofon rechts, links die Live-Besetzung mit
    // Klarinette, Davul, Keyboards und Gitarre, dahinter das eigene
    // Endstufen-Rack. Kein Wettbewerber in dieser Liste kann dieses Foto
    // zeigen — deshalb steht es hier und nicht ein Kopfhörer-DJ-Klischee.
    fallbackSrc: '/images/veys/buehne-orchester-16x9.jpg',
    fallbackAlt: 'Veysel Durmuş moderiert mit Mikrofon auf der Bühne, daneben die Live-Besetzung mit Klarinette, Davul und Keyboards',
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
    // Genau das, was `purpose` verlangt: Ganzfigur im Smoking, Mikrofon in der
    // Hand, mitten in einer Ansage — kein Studio-Posing.
    fallbackSrc: '/images/veys/moderation-hochformat-4x5.jpg',
    fallbackAlt: 'Veysel Durmuş moderiert mit Mikrofon auf einer Hochzeitsfeier',
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
    // VORLÄUFIG — und bewusst nicht das, was `purpose` beschreibt: In der
    // Lieferung 08/2026 gibt es genau ein Brautpaar-Foto, und darauf sind
    // beide klar erkennbar. Ohne schriftliche Einwilligung des Paares darf es
    // nicht online (DSGVO / Recht am eigenen Bild, siehe FOTO-LISTESI.md).
    // Bis die vorliegt, steht hier Veysel bei der Arbeit im Hochzeitssaal:
    // ehrlich, thematisch richtig, rechtlich unbedenklich.
    fallbackSrc: '/images/veys/saal-hochzeit-4x5.jpg',
    fallbackAlt: 'Veysel Durmuş am DJ-Pult im Hochzeitssaal, eingedeckte Tische im Hintergrund',
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
    // VORLÄUFIG: Kein einziges Kına-/Verlobungsmotiv in der Lieferung 08/2026
    // — keine Henna-Tabletts, keine Ringe, kein roter Schleier. Hier steht
    // deshalb Veysel als Moderator einer Feier mit Live-Musik, was einem
    // Kına-Abend inhaltlich am nächsten kommt, ohne etwas zu behaupten. Der
    // Alt-Text nennt bewusst keine Feierform.
    fallbackSrc: '/images/veys/moderation-portrait-4x5.jpg',
    fallbackAlt: 'Veysel Durmuş moderiert mit Mikrofon bei einer Feier, Live-Musiker im Hintergrund',
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
    fallbackSrc: '/images/veys/afterparty-nebel-4x5.jpg',
    fallbackAlt: 'Veysel Durmuş am beleuchteten DJ-Pult, Bodennebel und violette Lichteffekte im Saal',
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
    // VORLÄUFIG, aber der sauberste verfügbare Kompromiss: das komplette
    // Setup in hellem, aufgeräumtem Raum, ganz ohne Hochzeitsdekor — keine
    // Blumen, keine Tafeln, kein Brautpaar. Damit ist es das einzige Bild der
    // Lieferung, das im Firmenkontext nicht falsch wirkt. Der Alt-Text
    // behauptet keine Firmenveranstaltung, weil es keine war.
    fallbackSrc: '/images/veys/setup-neutral-4x5.jpg',
    fallbackAlt: 'DJ-Setup mit Beschallung und Licht in einem hellen, schlicht gehaltenen Saal',
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
    // VORLÄUFIG: Der Peak-Moment mit voller Tanzfläche existiert in der
    // Lieferung 08/2026 nicht (siehe `home.hero.background`). Hier steht
    // stattdessen der große, helle Saal mit komplettem Setup — zeigt die
    // Größenordnung, aber nicht die Energie. Bleibt der erste Slot, der beim
    // nächsten Shooting ersetzt gehört.
    fallbackSrc: '/images/veys/saal-signature-3x2.jpg',
    fallbackAlt: 'Veysel Durmuş am DJ-Pult in einem großen Festsaal mit Kronleuchtern und eingedeckten Tischen',
    altHint: 'z. B. „Volle Tanzfläche im Höhepunkt der Feier, Gäste in Bewegung, DJ-Pult im Hintergrund.“',
  },
  {
    key: 'epk.pressPhoto.performance',
    page: 'EPK — Pressefotos',
    label: 'Pressefoto: Live-Performance',
    purpose: 'Live-Action-Foto: Veysel spielt Saz oder Gitarre auf einer Bühne/Feier, Publikum im Hintergrund erkennbar.',
    aspect: '3/2',
    priority: 2,
    // VORLÄUFIG: Nahaufnahme der Bağlama beim Spielen — echt, scharf, und für
    // ein Pressekit brauchbar, aber ohne Bühne und Publikum. Der Slot bleibt
    // damit inhaltlich offen; „Saz live vor Gästen" ist in der Lieferung
    // 08/2026 nicht enthalten.
    fallbackSrc: '/images/veys/saz-detail-3x2.jpg',
    fallbackAlt: 'Hände von Veysel Durmuş beim Spielen einer Bağlama (Saz)',
    altHint: '„Veysel Durmuş spielt Saz live bei einer Hochzeitsfeier.“',
  },
  {
    key: 'epk.pressPhoto.hosting',
    page: 'EPK — Pressefotos',
    label: 'Pressefoto: Moderation',
    purpose: 'Veysel moderiert mit Mikrofon, Gestik/Energie erkennbar — zeigt ihn als Entertainer, nicht nur als DJ.',
    aspect: '3/2',
    priority: 2,
    // Das technisch beste Bild der gesamten Lieferung (5120×3413, sauberes
    // Licht, offene Gestik, Blick ins Publikum) — und das einzige, das ohne
    // Beschnitt in seinen Slot passt. Erfüllt `purpose` vollständig.
    fallbackSrc: '/images/veys/moderation-live-band-3x2.jpg',
    fallbackAlt: 'Veysel Durmuş moderiert mit Mikrofon, Live-Musiker mit Klarinette im Hintergrund',
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
    // ACHTUNG: Dieser Slot hat derzeit KEINE Aufrufstelle — die Stadtseite
    // (src/app/[locale]/hochzeits-dj/[stadt]/page.tsx) rendert gar keinen
    // Hero mit Bild. Der Eintrag unten ist damit vorbereitet, aber nicht
    // sichtbar. Eine Aufrufstelle nachzurüsten ist eine Gestaltungsfrage,
    // keine Datenfrage: Sie würde auf den acht Städten ohne eigenes Foto je
    // eine leere Bildfläche erzeugen.
    dynamicFallbacks: {
      // Kein Skyline-Stock, sondern Veysel selbst mit der Bağlama über dem
      // Neckartal — der Fernsehturm steht im Original mit im Bild. Ortsbezug
      // und Person in einem Motiv; genau die Trennlinie, die `purpose` zieht.
      // Alle anderen Städte bleiben leer: ein Stuttgart-Bild auf der
      // Karlsruhe-Seite wäre wieder austauschbar.
      stuttgart: {
        src: '/images/veys/saz-stuttgart-16x9.jpg',
        alt: 'Veysel Durmuş spielt Bağlama auf einer Anhöhe über dem Stuttgarter Talkessel',
      },
    },
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
    // Alle 15 veröffentlichten Ratgeber-Artikel. Der Schlüssel ist der
    // kanonische (deutsche) `post.slug` — `PostCover` übergibt ihn in jeder
    // Sprache, deshalb reicht ein Eintrag pro Artikel. Die beiden
    // Recap-Vorlagen (`status: 'template'`) stehen bewusst nicht hier: sie
    // werden öffentlich gar nicht gerendert.
    //
    // 13 verschiedene Motive auf 15 Artikel — die Übersichtsseite zeigt alle
    // Karten in einem Raster, dort fällt jede Wiederholung sofort auf. Nur
    // `moderation-live-band` und `buehne-orchester` kommen doppelt vor, und
    // zwar bei den beiden Artikeln, bei denen die Live-Besetzung wirklich das
    // Thema ist.
    dynamicFallbacks: {
      'hochzeits-dj-checkliste': {
        src: '/images/veys/dj-controller-hands-3x2.jpg',
        alt: 'Nahaufnahme: Hände regeln Fader und Jog-Wheel eines DJ-Controllers',
      },
      'was-kostet-ein-hochzeits-dj': {
        src: '/images/veys/dj-controller-3x2.jpg',
        alt: 'Hände am DJ-Controller, Nahaufnahme der beleuchteten Bedienelemente',
      },
      'tuerkische-hochzeit-ablauf-musik-timing': {
        src: '/images/veys/buehne-orchester-3x2.jpg',
        alt: 'Live-Besetzung mit Klarinette, Davul und Keyboards neben dem DJ-Setup auf der Bühne',
      },
      'kina-gecesi-henna-abend-planen': {
        src: '/images/veys/afterparty-nebel-3x2.jpg',
        alt: 'Beleuchtetes DJ-Pult im Bodennebel, warmes Licht im Saal',
      },
      'eroeffnungstanz-songauswahl': {
        src: '/images/veys/location-abendstimmung-3x2.jpg',
        alt: 'Hochzeitssaal am Abend: Blumenbogen und eingedeckte Tafeln im violetten Licht',
      },
      'dj-live-band-oder-beides': {
        src: '/images/veys/moderation-live-band-3x2.jpg',
        alt: 'Veysel Durmuş moderiert mit Mikrofon, Live-Musiker mit Klarinette im Hintergrund',
      },
      'musikwuensche-no-go-liste': {
        src: '/images/veys/dj-pult-gruss-3x2.jpg',
        alt: 'Veysel Durmuş am DJ-Pult im Festsaal, lächelnd in die Kamera',
      },
      'dramaturgie-hochzeitsabend': {
        src: '/images/veys/setup-licht-3x2.jpg',
        alt: 'Beleuchtetes DJ-Pult im Bodennebel, farbige Lichteffekte an der Wand dahinter',
      },
      'laermschutz-sperrzeiten-baden-wuerttemberg': {
        src: '/images/veys/setup-soundcheck-3x2.jpg',
        alt: 'Aufgebaute Beschallung im Saal: Lautsprecher auf Stativen neben dem DJ-Pult',
      },
      'freie-trauung-beschallung-mikrofone-wetter': {
        src: '/images/veys/saz-bank-3x2.jpg',
        alt: 'Veysel Durmuş spielt Bağlama im Freien, Weinberge im Hintergrund',
      },
      'deutsch-tuerkische-hochzeit-zwei-familien': {
        src: '/images/veys/moderation-live-band-3x2.jpg',
        alt: 'Veysel Durmuş moderiert mit Mikrofon, Live-Musiker mit Klarinette im Hintergrund',
      },
      'islamische-hochzeit-planen': {
        src: '/images/veys/saz-detail-3x2.jpg',
        alt: 'Hände von Veysel Durmuş beim Spielen einer Bağlama (Saz)',
      },
      'hochzeits-timeline-musterablauf': {
        src: '/images/veys/saz-stuttgart-3x2.jpg',
        alt: 'Veysel Durmuş mit Bağlama auf einer Anhöhe über dem Stuttgarter Talkessel',
      },
      'location-akustik-checkliste': {
        src: '/images/veys/saal-signature-3x2.jpg',
        alt: 'Großer Festsaal mit aufgebauter Beschallung, Lautsprecher links und rechts des DJ-Pults',
      },
      'davul-zurna-halay-roman-havasi': {
        src: '/images/veys/buehne-orchester-3x2.jpg',
        alt: 'Live-Musiker mit Klarinette, Davul und Keyboards auf der Bühne einer türkischen Hochzeit',
      },
      // Das einzige Reisemotiv, das hier etwas verloren hat: Veysel im
      // Ausland, was beim Thema Destination Wedding der Sache entspricht.
      // Der Alt-Text sagt, was es ist — kein Foto von einer Hochzeit im
      // Ausland, sondern eines von ihm im Ausland.
      'destination-wedding-dj-buchen': {
        src: '/images/veys/reise-ausland-3x2.jpg',
        alt: 'Veysel Durmuş auf Reisen im Ausland, Hafenstadt und Hängebrücke im Hintergrund',
      },
    },
  },
  {
    key: 'kontakt.portrait',
    page: 'Kontakt — Hero',
    label: 'Porträt/Vertrauensbild',
    purpose:
      'Freundliches, nahbares Foto von Veysel — unterstützt auf der Kontaktseite die Frage „wer antwortet mir hier eigentlich“. Kann dasselbe Motiv wie epk.portrait sein.',
    aspect: '4/5',
    priority: 2,
    // Bewusst ein anderes Motiv als `epk.portrait`, obwohl `purpose` dasselbe
    // erlauben würde: Auf der Kontaktseite beantwortet ein Foto die Frage
    // „wer antwortet mir hier eigentlich" besser, wenn er dabei arbeitet und
    // in die Kamera lacht, als mit einer zweiten Ausspielung desselben Bildes.
    fallbackSrc: '/images/veys/dj-pult-gruss-4x5.jpg',
    fallbackAlt: 'Veysel Durmuş am DJ-Pult, lächelnd mit erhobenem Daumen in die Kamera',
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
    // Trägt die Kernaussage des Slots besser, als ein Foto mit wenigen Gästen
    // es könnte: kompaktes Setup, aber vollständig ausgeleuchtet und mit
    // Nebel — „klein" sieht hier eben nicht nach „abgespeckt" aus.
    fallbackSrc: '/images/veys/setup-licht-3x2.jpg',
    fallbackAlt: 'Kompaktes, voll ausgeleuchtetes DJ-Setup mit Bodennebel',
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
    // Erfüllt `purpose` wörtlich — Live-Besetzung und DJ-Rack im selben Bild.
    // Andere Ausspielung desselben Motivs wie `musik.hero.performance`
    // (dort 16/9), bewusst: es ist der einzige Beleg für „aus einer Hand",
    // und die beiden Seiten sieht man nicht nebeneinander.
    fallbackSrc: '/images/veys/buehne-orchester-3x2.jpg',
    fallbackAlt: 'Live-Besetzung mit Klarinette, Davul und Keyboards neben dem DJ-Setup auf der Bühne',
    altHint: 'z. B. „Live-Band mit Bläsern neben dem DJ-Pult bei einer großen Feier.“',
  },
  {
    key: 'epk.personalStory',
    page: 'EPK — Persönliche Geschichte',
    label: 'Persönliche Geschichte (bereits vorhanden)',
    purpose:
      'Bereits erfüllt: Veysel mit der Bağlama im Freien, über den Weinbergen. Löst das bisherige Alpen-Wanderbild (legacy 08-2ef27d08.jpg) ab — beide sind echte private Aufnahmen, aber dieses erzählt neben „Mensch hinter dem Pult“ auch noch die Musikergeschichte, um die es auf dieser Seite geht.',
    aspect: '4/5',
    priority: 3,
    fallbackSrc: '/images/veys/saz-bank-4x5.jpg',
    fallbackAlt: 'Veysel Durmuş spielt Bağlama auf einer Bank im Freien, Weinberge und Ortschaft im Hintergrund',
    altHint: 'Bereits vergeben — siehe fallbackAlt. Bei Ersatzmotiv: Ort und Aktivität konkret benennen.',
  },
  {
    key: 'epk.setupDetail',
    page: 'EPK — Setup-Detail',
    label: 'Setup/Soundcheck (bereits vorhanden)',
    purpose:
      'Bereits erfüllt: Veysel am aufgebauten Pult mit Licht und Nebel. Löst das bisherige Bild (legacy 01-156b4efb.jpg, leerer weißer Raum mit Bürofußboden) ab — dasselbe Motiv, aber im fertig eingerichteten Saal statt im Rohzustand. Bleibt weiterhin ein kleines Detailbild, nie ein Hero.',
    aspect: '4/5',
    priority: 3,
    fallbackSrc: '/images/veys/setup-licht-4x5.jpg',
    fallbackAlt: 'Veysel Durmuş an seinem beleuchteten DJ-Pult, Bodennebel und Lichtstimmung im Saal',
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
    // Der Aufbau im Tageslicht, bevor Gäste kommen: Lichtstative, Boxen,
    // Pult, nichts läuft. Auf jeder anderen Seite wäre dieses Bild zu nüchtern
    // — auf der Ablauf-Seite ist genau das die Aussage.
    fallbackSrc: '/images/veys/setup-soundcheck-16x9.jpg',
    fallbackAlt: 'Aufgebaute Technik vor der Veranstaltung: DJ-Pult, Lautsprecher und Lichtstative im leeren Saal',
    altHint: 'z. B. „Soundcheck vor einer Veranstaltung, Technik wird aufgebaut.“',
  },
  {
    key: 'og.default',
    page: 'Global — Social-Share-Bild (OG)',
    label: 'Standard-Vorschaubild (Google/Social)',
    purpose:
      'Teilbild für Google- und Social-Media-Vorschauen, 1200×630 px (hier am nächsten am Seitenverhältnis 16:9 abgebildet). Bis echtes Bildmaterial vorliegt, ist ein rein typografisches Motiv (Wortmarke DJ Veys auf dunklem Gold-Grund, Cormorant-Garamond-Type) dem Versuch vorzuziehen, ein noch unpassendes Foto zu erzwingen. Wird in src/lib/seo.ts (DEFAULT_OG_IMAGE, SEO-Agent) referenziert, nicht direkt über diese Registry ausgespielt.',
    aspect: '16/9',
    priority: 3,
    fallbackSrc: null,
    altHint: `„${'DJ Veys'} — Hochzeits-DJ, Musiker & Moderator“ oder das im Foto tatsächlich abgebildete Motiv, falls ein echtes Foto verwendet wird.`,
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
 * The slot's local fallback, or `null` for the designed empty state.
 *
 * Exists because a dynamic slot cannot answer with a single `fallbackSrc`:
 * `getImageSlot('city.header.background.karlsruhe')` resolves to the shared
 * base entry, so a value there would put the same photo on all nine city
 * pages. Dynamic keys are therefore looked up by instance id in
 * `dynamicFallbacks` and fall through to `null` when there is no entry —
 * never to the base slot's image.
 */
export function getSlotFallback(key: string): ResolvedImage | null {
  const slot = getImageSlot(key);
  if (!slot) return null;

  if (slot.dynamic) {
    if (!key.startsWith(`${slot.key}.`)) return null;
    const id = key.slice(slot.key.length + 1);
    return slot.dynamicFallbacks?.[id] ?? null;
  }

  return slot.fallbackSrc ? { src: slot.fallbackSrc, alt: slot.fallbackAlt ?? '' } : null;
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
/**
 * Macht aus Payloads Upload-URL einen seitenrelativen Pfad.
 *
 * Payload liefert `image.url` als **absolute** URL, sobald in der Konfiguration
 * eine `serverURL` steht — also `https://dj-veys.de/api/media/file/foo.webp`.
 * Für `next/image` ist das ein *fremder* Host, und fremde Hosts müssen in
 * `next.config.ts` → `images.remotePatterns` stehen. Der eigene Host stand dort
 * nicht (die Liste enthält Spotify, SoundCloud, Mixcloud, Google), also
 * antwortete der Optimierer mit **400** und der Browser zeigte ein kaputtes
 * Bild — während die Datei selbst unter derselben Adresse tadellos ausgeliefert
 * wurde. Genau dieses Bild war auf `/echte-hochzeiten` zu sehen.
 *
 * Der naheliegende Weg wäre gewesen, `dj-veys.de` in `remotePatterns` (und in
 * die CSP-`img-src`) aufzunehmen. Dieser hier ist besser: Ein relativer Pfad
 * ist für den Optimierer ein *lokales* Bild, braucht überhaupt keine
 * Freigabeliste und funktioniert unverändert auf localhost, auf einer
 * Staging-Domain und in Produktion. Eine Konfiguration, die den eigenen Host
 * fest verdrahtet, wäre in jeder anderen Umgebung wieder falsch.
 *
 * Fremde Hosts bleiben unangetastet — falls Uploads später auf S3 oder einen
 * CDN wandern, fällt der Wert unverändert durch und die Freigabeliste greift
 * wie vorgesehen.
 *
 * Die Umsetzung liegt inzwischen in `@/lib/media-url` — dieselbe Umrechnung
 * braucht auch `@/lib/weddings` für Titelbilder und Galeriefotos, und zwei
 * Kopien einer Regel, die einen 500er verhindert, driften auseinander. Sie
 * vergleicht dort zusätzlich gegen `PAYLOAD_SERVER_URL`: genau diesen Wert
 * hat Payload beim Bauen der URL benutzt, und lokal ist er der einzige
 * gesetzte von beiden.
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

      return { src: toSameOriginMediaPath(image.url as string), alt: typeof image.alt === 'string' ? image.alt : '' };
    },
    null,
    `site-image "${key}"`
  );
}

/**
 * HARD RULE — see `.claude/BRAND-FACTS.md`: never wire `fallbackSrc` to a
 * stock photo, a photo of someone other than Veysel, or any file not
 * explicitly cleared for that exact use. `05-86ab7620.jpg` is never usable
 * anywhere: it is a stock photo, not Veysel.
 *
 * Cleared and in use: everything under `/images/veys/`, derived from the
 * client's own delivery of 2026-08-02 (his material, his events, handed over
 * for the site). The legacy folder is no longer referenced from this file at
 * all — the two frames that used to stand in for `epk.personalStory` and
 * `epk.setupDetail` were superseded by better ones from that delivery.
 *
 * Two things that delivery did NOT contain, and that no `fallbackSrc` may be
 * invented for:
 *
 * 1. **A full dance floor at night.** `home.hero.background` therefore stays
 *    `null`, and `HeroBackdrop` keeps rendering nothing. It is still the
 *    single highest-value missing photograph on the site.
 * 2. **A publishable couple.** The one bride-and-groom frame in the delivery
 *    shows both faces clearly and carries no written consent, so it is not in
 *    `/images/veys/` and must not be added without one (DSGVO / Recht am
 *    eigenen Bild — see the checklist at the top of FOTO-LISTESI.md).
 */
export const NEVER_USE_LEGACY_FILE = '05-86ab7620.jpg';
