/**
 * Bühnendunst über dunklem Grund — der Ersatz für die frühere WebGL-Variante.
 *
 * Was hier vorher stand, war `<ParticleDrift>`: 260 Punkte in einer
 * three.js-Szene, dynamisch nachgeladen, hinter `pointer: fine` und
 * `requestIdleCallback` versteckt. Die Optik war schön, der Preis nicht — das
 * Bündel wog **864 KB unminifiziert und war damit allein 45 % des gesamten
 * JavaScripts der Startseite**, für eine dekorative Schicht hinter *einem*
 * Abschnitt, die auf Telefonen ohnehin nie geladen wurde.
 *
 * Diese Fassung erzeugt denselben Eindruck mit **null Byte JavaScript**: drei
 * übereinanderliegende `radial-gradient`-Felder, unterschiedlich groß und
 * unterschiedlich schnell, die langsam gegeneinander wandern. Weil sich die
 * Felder überlagern und leicht unterschiedlich lange Zyklen haben, wiederholt
 * sich das Muster für das Auge nicht.
 *
 * Server-Komponente: es gibt nichts zu hydrieren. Die Bewegung liegt
 * vollständig in CSS (`.stage-haze` in globals.css), inklusive der
 * `prefers-reduced-motion`-Abschaltung, die dort ohnehin global greift.
 *
 * Gehört wie das Original ausschließlich auf dunklen Grund (`tone="night"`) —
 * auf der elfenbeinfarbenen Fläche wäre der Effekt unsichtbar.
 */
export function StageHaze() {
  return (
    <div className="stage-haze pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <span className="stage-haze-layer stage-haze-layer-1" />
      <span className="stage-haze-layer stage-haze-layer-2" />
      <span className="stage-haze-layer stage-haze-layer-3" />
    </div>
  );
}
