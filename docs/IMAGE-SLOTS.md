# Bild-Fahrplan für veysl.de

Diese Liste beantwortet eine einzige Frage: **welches Foto muss wohin, und in
welcher Reihenfolge?** Sie ist die menschenlesbare Fassung von
[`src/content/site-images.ts`](../src/content/site-images.ts) — jede Zeile dort hat
hier eine Entsprechung. Wenn sich eine der beiden Listen ändert, bitte beide
nachziehen.

## Warum das überhaupt nötig ist

Die Seite ist bewusst so gebaut, dass sie **ohne ein einziges Foto** bereits
hochwertig aussieht — mit Typografie, der Gold-Akzentfarbe und einer feinen
Filmkorn-Textur statt grauer Platzhalter-Kästen. Das ist Absicht, kein
Provisorium: Es gibt aktuell keine einzige verwendbare Hochzeitsfoto-Aufnahme
(kein Brautpaar, keine volle Tanzfläche, keine Location, keine Atmosphäre —
siehe `.claude/BRAND-FACTS.md`). Ein leeres Feld ist deshalb nie ein
Zufallsprodukt eines fehlenden Uploads, sondern ein gestaltetes Element, das
so lange stehen bleibt, bis ein echtes Foto es ersetzt.

**Das heißt auch:** Jedes Foto, das unten fehlt, macht die Seite nicht
kaputt — es macht sie nur noch nicht so stark, wie sie mit echtem
Bildmaterial werden kann. Es gibt also keinen Zeitdruck, „irgendein" Foto
hochzuladen, nur um ein Feld zu füllen.

## So funktioniert der Bild-Platz technisch

Jeder Platz unten hat einen festen **Schlüssel** (z. B.
`home.hero.background`). Sobald das Admin-Panel bereitsteht, wird jedes Foto
genau diesem Schlüssel zugeordnet hochgeladen — die Seite selbst muss dafür
nicht mehr angefasst werden. Bis dahin zeigt jeder Platz den gestalteten
Platzhalter.

## Wenn nur eine erste Foto-/Video-Session möglich ist

In dieser Reihenfolge, wenn das Budget/die Zeit für einen Fotografen begrenzt
ist — jede einzelne Position schon allein macht einen sichtbaren Unterschied:

1. **Ein professionelles Porträt von Veysel.** Wird auf mindestens vier
   Seiten verwendet (EPK, Kontakt, perspektivisch Google Business, Presse).
   Das mit Abstand wichtigste Einzelbild im ganzen Projekt.
2. **Ein Aftermovie-Clip oder wenigstens ein Standbild einer echten Hochzeit**
   (volle Tanzfläche, Brautpaar, Bewegung, Licht) — für Startseiten-Hero,
   Showreel, „Echte Hochzeiten" und Galerie.
3. **Ein Live-Moment mit Saz oder Gitarre.** Trägt die eigentliche
   Differenzierung „DJ & Orkestra", nicht „nur DJ".
4. **Ein Moderations-Moment mit Mikrofon**, Energie/Gestik erkennbar.
5. **Ein Detailfoto vom professionellen Equipment im echten Einsatz**
   (nicht im leeren Raum) — ersetzt langfristig das aktuell einzige
   nutzbare Setup-Foto aus dem Altbestand.

Mit diesen fünf Motiven — realistisch an EINEM gut dokumentierten Hochzeits-
oder Verlobungsabend einsammelbar — lassen sich die sechs
Priorität-1-Plätze unten fast vollständig füllen.

---

## Rechtliches zuerst: Nutzungsrecht sichern, bevor ein Foto online geht

Das ist kein Kleingedrucktes, sondern die Voraussetzung dafür, dass überhaupt
etwas veröffentlicht werden darf.

1. **Recht am eigenen Bild (KUG) + DSGVO.** Jede erkennbare Person auf einem
   Foto — Brautpaar UND Gäste — braucht eine Einwilligung zur
   Veröffentlichung, bevor das Bild auf die Website, Social Media oder in
   Presseunterlagen geht. „Das Brautpaar hat zugestimmt" reicht nicht, wenn
   im Hintergrund erkennbare Gäste mit im Bild sind, die nicht gefragt
   wurden.
2. **Praktisch lösen: schriftliche Freigabe direkt bei der Buchung.** Am
   einfachsten ist eine kurze, schriftliche Einwilligungsklausel, die beim
   Vertragsabschluss/der Buchung mit unterschrieben wird — z. B. „Ich bin
   damit einverstanden, dass im Rahmen dieser Veranstaltung entstandene
   Foto-/Videoaufnahmen für Website, Social Media und Marketing von VEYSL
   verwendet werden dürfen." Ohne diese Zeile darf im Zweifel kein Foto
   dieser Feier verwendet werden, selbst wenn es objektiv gut aussieht.
3. **Minderjährige auf Fotos:** gesonderte Einwilligung der
   Erziehungsberechtigten nötig — im Zweifel lieber zuschneiden/weglassen.
4. **Wenn ein externer Fotograf/eine Fotografin engagiert wird:** Das
   Urheberrecht am Foto liegt zunächst bei ihr/ihm. Für die Verwendung auf
   dieser Website braucht es ein ausdrückliches Nutzungsrecht (idealerweise
   zeitlich unbegrenzt, für Web + Social + Print) — das gehört ins
   Fotografen-Angebot bzw. den Fotografen-Vertrag, nicht in eine mündliche
   Absprache. Ein Bildnachweis („© Name Fotografie") gehört dann in das
   `credit`-Feld von `<MediaFigure>`, siehe unten.
5. **Location-Regeln beachten.** Manche privat geführten Locations (Schlösser,
   Weingüter, Hotels) haben eigene Vorgaben zur kommerziellen Nutzung von dort
   entstandenen Fotos — vor Veröffentlichung kurz mit der Location
   abklären, besonders bei den in `src/content/cities.ts` genannten Venues.
6. **Interne Ablage:** Eine einfache Tabelle reicht (Foto-Dateiname, welche
   Feier, Einwilligung vorhanden ja/nein, Datum) — nicht jedes Detail muss
   perfekt sein, aber es sollte im Zweifel nachweisbar sein, dass gefragt
   wurde.

Diese Regeln gelten für **jedes** Foto unten, ausnahmslos.

---

## Die Plätze im Detail

Format-Kürzel: `21/9` sehr breites Panorama-Band · `16/9` klassisches Breitbild
· `4/5` Hochformat/Porträt · `3/2` klassisches Querformat-Foto · `1/1`
quadratisch (z. B. Porträt-Kachel).

### Priorität 1 — zuerst fotografieren

| Seite | Was fotografieren | Format | Schlüssel |
|---|---|---|---|
| Startseite — Hero | Volle Tanzfläche bei Nacht, Weitwinkel, Gäste in Bewegung, DJ-Pult im Hintergrund. Muss auch stark abgedunkelt unter Text funktionieren. | 21/9 | `home.hero.background` |
| Startseite — Showreel | Ein ruhiges Einzelbild aus dem künftigen Aftermovie (z. B. erster Tanz), als Vorschaubild vor dem Play-Button. | 16/9 | `home.showreel.poster` |
| Echte Hochzeiten — Hero | Atmosphäre eines echten Hochzeitsabends, kein Einzelporträt. | 21/9 | `weddings.hero.atmosphere` |
| Galerie — Hero | Anderes Motiv als die beiden oberen — z. B. Nahaufnahme Licht/Tanzfläche. | 21/9 | `gallery.hero.atmosphere` |
| EPK — Hero | Professionelles Porträt von Veysel, seriös und warm zugleich. | 4/5 | `epk.portrait` |
| Musik — Hero | Live-Moment mit Saz/Gitarre oder DJ-Setup in Aktion. | 16/9 | `musik.hero.performance` |

### Priorität 2 — zweite Welle

| Seite | Was fotografieren | Format | Schlüssel |
|---|---|---|---|
| Startseite — Intro | Veysel bei der Arbeit, moderierend oder am Pult, natürliches Licht. | 4/5 | `home.intro.portrait` |
| Leistungen — Hochzeit | Brautpaar im Fokus, Tanz/Zeremonie. | 4/5 | `services.wedding.image` |
| Leistungen — Verlobung/Kına | Intimerer Rahmen, Henna-Tablett oder Ringe als Detail möglich. | 4/5 | `services.engagement.image` |
| Leistungen — Afterparty | Tanzfläche spät am Abend, energiegeladen, Nahaufnahme. | 4/5 | `services.afterparty.image` |
| Leistungen — Firmenfeier | Seriöserer Rahmen, DJ-Setup bei Corporate Event. | 4/5 | `services.corporate.image` |
| Pakete — Signature | Volle Tanzfläche im Höhepunkt der Feier (meistgebuchtes Paket). | 3/2 | `packages.signature.image` |
| EPK — Pressefoto | Live-Performance mit Saz/Gitarre. | 3/2 | `epk.pressPhoto.performance` |
| EPK — Pressefoto | Moderation mit Mikrofon. | 3/2 | `epk.pressPhoto.hosting` |
| Stadt-Seiten (je Stadt) | Möglichst ein Foto AUS der jeweiligen Stadt/Location — kein Stock-Skyline-Foto. Aktuell relevant: Böblingen, Esslingen, Reutlingen, Heilbronn, Pforzheim, Karlsruhe, Mannheim. | 16/9 | `city.header.background.<stadt>` |
| Blog/Ratgeber (je Artikel) | Zum Thema passendes, echtes Foto — kein generisches Stockfoto. | 3/2 | `blog.cover.<artikel-slug>` |
| Kontakt — Hero | Nahbares Porträt (kann dasselbe Motiv wie EPK-Porträt sein). | 4/5 | `kontakt.portrait` |

### Priorität 3 — später

| Seite | Was fotografieren | Format | Schlüssel |
|---|---|---|---|
| Startseite — Stimmen (je Kundenstimme) | Freundliches Porträt der Referenzperson — **nur mit Einwilligung**, erst sobald echte, freigegebene Kundenstimmen vorliegen. | 1/1 | `home.testimonials.avatar.<id>` |
| Pakete — Essential | Kleine, intime Feier, reduziertes Setup. | 3/2 | `packages.essential.image` |
| Pakete — Prestige | Live-Orchester mit Bläsern neben DJ-Setup, große Location. | 3/2 | `packages.prestige.image` |
| EPK — Persönliche Geschichte | **Bereits erledigt** — Wandern in den Alpen, bestehendes Foto bereits freigegeben und eingebunden. | 4/5 | `epk.personalStory` |
| EPK — Setup-Detail | **Bereits erledigt** — Soundcheck-Detailfoto bereits freigegeben und eingebunden (nur als kleines Detail, nie als Hero). | 4/5 | `epk.setupDetail` |
| Länder-Seiten (je Land) | Nur bei belegtem Auftritt (aktuell nur Wien/Österreich) — sonst bewusst leer lassen. | 21/9 | `region.header.background.<land>` |
| Ablauf — Prozess | Vorgespräch- oder Soundcheck-Moment. | 16/9 | `ablauf.process.image` |
| Global — Social-Vorschaubild | 1200×630 px für Google/Social-Vorschau. Bis echtes Material vorliegt: rein typografisches Motiv statt eines unpassenden Fotos. | 16/9 | `og.default` |

---

## Was NICHT verwendet werden darf

- `05-86ab7620.jpg` aus dem Altbestand — ein Stockfoto (Mann am Strand bei
  Sonnenuntergang), zeigt nicht Veysel und wird **an keiner einzigen
  Stelle** verwendet.
- Jedes andere Stockfoto, egal woher — dieses Projekt verwendet ausschließlich
  echtes, selbst besessenes Bildmaterial.
- Erfundene/gekaufte Kundenstimmen-Porträts — ein Testimonial-Foto erscheint
  ausschließlich zusammen mit einer echten, freigegebenen Kundenstimme.

## Wie ein neues Foto tatsächlich live geht

1. Prüfen: Einwilligung der abgebildeten Personen liegt vor (siehe oben).
2. Foto in guter Auflösung (mindestens 2000 px auf der längeren Seite)
   bereitstellen.
3. Über das Admin-Panel dem passenden Schlüssel aus der Tabelle oben
   zuordnen (sobald diese Funktion verfügbar ist — bis dahin an das
   Web-Team mit Angabe des Schlüssels, z. B. „Bitte für
   `epk.portrait` einsetzen").
4. Alt-Text nicht vergessen — jeder Platz oben hat in
   `src/content/site-images.ts` eine konkrete Formulierungshilfe
   (`altHint`) hinterlegt.
