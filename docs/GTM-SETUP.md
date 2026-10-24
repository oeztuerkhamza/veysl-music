# Google Tag Manager – Einrichtung

Container: **GTM-W44F8H8G** (`NEXT_PUBLIC_GTM_ID`). Der Code lädt `gtm.js` erst nach
„Alle akzeptieren“ im Cookie-Banner (siehe `src/lib/analytics/providers/gtm-provider.ts`).
Ist die ID gesetzt, wird GA4 **nicht** zusätzlich direkt geladen – GA4 läuft nur über den Container.

Das `<noscript>`-Iframe aus dem GTM-Standard-Snippet wird bewusst **nicht** eingebaut: es würde
Google ohne Einwilligung aufrufen.

## 1. Vorbereitung im Container

1. **Variablen → Konfigurieren (integrierte Variablen)**: nichts nötig.
2. **Variablen → Neu → Datenebenenvariable** (Version 2), je eine pro Feld:

   | Name der GTM-Variable | Variablenname im dataLayer |
   | --- | --- |
   | `DLV - page_path` | `page_path` |
   | `DLV - location` | `location` |
   | `DLV - page` | `page` |
   | `DLV - eventType` | `eventType` |
   | `DLV - package` | `package` |
   | `DLV - budget` | `budget` |
   | `DLV - source` | `source` |
   | `DLV - locale` | `locale` |
   | `DLV - tier` | `tier` |
   | `DLV - depth` | `depth` |
   | `DLV - city` | `city` |

## 2. GA4-Konfiguration

**Tags → Neu → Google-Tag**
- Tag-ID: deine GA4-Mess-ID (`G-XXXXXXXXXX`)
- Konfigurationseinstellungen: Parameter `send_page_view` = `false`
  (Next.js navigiert ohne Neuladen; Seitenaufrufe kommen als `page_view`-Event)
- Trigger: **Initialisierung – Alle Seiten**

## 3. Seitenaufrufe

**Trigger → Neu → Benutzerdefiniertes Ereignis**, Name `page_view` (Trigger `CE - page_view`).

**Tag → Neu → Google Analytics: GA4-Ereignis**
- Konfigurations-Tag: das Google-Tag von oben
- Ereignisname: `page_view`
- Parameter: `page_path` = `{{DLV - page_path}}`, `site_locale` = `{{DLV - locale}}`
- Trigger: `CE - page_view`

## 4. Ereignisse

Pro Zeile ein Trigger „Benutzerdefiniertes Ereignis“ (Name = Ereignisname, exakt) und ein
**GA4-Ereignis**-Tag mit demselben Namen und den genannten Parametern.

| Ereignis (dataLayer) | Parameter | Wann |
| --- | --- | --- |
| `enquiry_submitted` | `eventType`, `package`, `budget`, `source` | Anfrage abgeschickt – **Hauptconversion** |
| `enquiry_started` | – | erstes Feld im Formular fokussiert |
| `enquiry_step_completed` | `step`, `stepKey` | Formularschritt abgeschlossen |
| `enquiry_failed` | `reason` | Absenden fehlgeschlagen |
| `availability_checked` | `status` | Datums-Verfügbarkeit geprüft |
| `whatsapp_click` | `page` | Klick auf WhatsApp |
| `phone_click` | `page` | Klick auf Telefon |
| `email_click` | `page` | Klick auf E-Mail |
| `cta_click` | `location` | Klick auf einen CTA |
| `package_interest` | `tier` | Interesse an einem Paket |
| `scroll_depth` | `page`, `depth` | 25/50/75/100 % |
| `faq_expanded` | `id` | FAQ geöffnet |
| `mix_played` | `mixId`, `moment` | Mix abgespielt |
| `city_page_view` | `city` | Stadtseite aufgerufen |

Jedes Ereignis trägt zusätzlich `locale`.

## 5. In GA4 als Schlüsselereignis markieren

GA4 → Verwalten → Ereignisse: **`enquiry_submitted`** als Schlüsselereignis markieren, danach
`whatsapp_click` und `phone_click`.

Eigene Parameter (`location`, `tier`, …) erscheinen in Berichten erst, wenn sie unter
Verwalten → Benutzerdefinierte Definitionen → **Benutzerdefinierte Dimensionen** (Bereich: Ereignis)
angelegt sind.

## 6. Testen

1. GTM → **Vorschau**, Website-URL eingeben (Produktionsdomain).
2. Auf der Website im Banner **„Alle akzeptieren“** klicken – vorher lädt nichts.
3. Tag Assistant: `page_view` und die ausgelösten Klick-Ereignisse müssen „Tags Fired“ zeigen.
4. GA4 → Berichte → **Echtzeit** bzw. DebugView prüfen.
5. Erst dann im Container **Senden → Veröffentlichen**.

## 7. Datenschutz-Hinweise

- Consent Mode v2: `ad_storage`, `ad_user_data`, `ad_personalization` = `denied`,
  `analytics_storage` = `granted` (erst nach Einwilligung gesetzt).
- **Warnung „Einwilligungsrate von 0 % / 100 % abgelehnt“ (GA4, Oktober 2026): erwartet,
  kein Fehler.** Sie betrifft die Werbesignale (`ad_user_data`, `ad_personalization`). Das
  Banner fragt nur nach Statistik, also gibt es keine Einwilligung für Werbung, die gemeldet
  werden könnte. Die Analysesignale stehen bei jedem gemessenen Besuch auf „granted“, weil
  `gtm.js` ohne Einwilligung gar nicht lädt — Ablehnende sieht Google überhaupt nicht.
  Prüfen: GA4 → Verwalten → Datenerfassung und -änderung → Einwilligungseinstellungen; dort
  muss „Analysen“ aktiv sein und „Personalisierung von Anzeigen“ 0 % zeigen.
  Die Warnung verschwindet erst, wenn Werbung eingeführt wird. Dann braucht das Banner eine
  eigene Kategorie „Marketing“, deren Auswahl auf die drei `ad_*`-Signale wirkt, und die
  Datenschutzerklärung einen Abschnitt dazu. Die Werbesignale hier einfach auf `granted` zu
  setzen, wäre eine Einwilligung, die niemand gegeben hat.
- Kein „erweiterter“ Consent Mode (Container vor der Einwilligung laden, cookielose Pings):
  Das Laden von `gtm.js` und die Übermittlung an Google ohne Einwilligung ist nach § 25 TDDDG
  nicht gedeckt.
- Keine Google-Ads-/Remarketing-Tags im Container anlegen, solange Werbung nicht
  datenschutzrechtlich geprüft ist.
- Keine personenbezogenen Daten (Name, E-Mail, Telefon) als Ereignisparameter senden.
- In GA4 die Datenaufbewahrung auf 14 Monate stellen (Verwalten → Datenaufbewahrung).
- Mit Google einen Auftragsverarbeitungsvertrag abschließen (GA4 → Verwalten → Kontoeinstellungen).
