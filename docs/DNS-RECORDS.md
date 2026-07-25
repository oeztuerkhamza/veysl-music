# DNS-Einträge für veysl.de

Vollständiger Satz DNS-Records für den Betrieb der Website (netcup VPS,
`docs/DEPLOYMENT.md`) und den Mailversand (`docs/MAIL-SETUP.md`).

**Die Reihenfolge ist Absicht.** Phase 1 und 2 sind unabhängig voneinander und
können sofort gesetzt werden. **Phase 3 gehört ausdrücklich nicht zum ersten
Launch** — siehe die Warnung dort.

---

## Ist-Zustand der Zone (geprüft 25. Juli 2026)

Öffentlich abgefragt über einen Resolver — das ist der Stand, auf dem alles
Weitere aufbaut.

| Prüfung | Ergebnis |
|---|---|
| Nameserver `veysl.de` | ✅ netcup (`netcup.firstns.cc` + 4 weitere) — die Zone liegt am richtigen Ort |
| `veysl.de` A | ⚠️ vorhanden: `46.38.243.234` — **netcups Parking-IP**, nicht der VPS. Siehe unten |
| `www.veysl.de` | ❌ `NXDOMAIN` — fehlt komplett |
| `veysl.de` AAAA | ❌ nicht gesetzt |
| MX | ❌ keine — Mail für `@veysl.de` wird derzeit nicht angenommen |
| SPF (TXT `@`) | ❌ nicht gesetzt |
| DKIM | ❌ nicht gesetzt |
| `_dmarc` | ❌ `NXDOMAIN` |
| Beobachtete TTL | 30 min – 4 h — für die Migration brauchbar, siehe TTL-Abschnitt |

> ### ⚠️ `46.38.243.234` ist netcups Parking-IP — nicht der Server
>
> Bestätigt: `http://veysl.de` liefert `200` mit netcups Parkseite
> („Diese Domain wurde geparkt"), und deren Fußzeile sagt es wörtlich —
> *„Diese Domain ist zur Zeit keinem Server oder Webhosting zugewiesen."*
> `https://` läuft in einen Timeout, weil auf der Parking-IP kein 443 lauscht.
>
> Die Domain zeigt also aktuell auf einen Platzhalter, nicht auf einen VPS.
> **Diese Adresse nicht übernehmen.** Die echte IP steht im netcup **SCP**
> (Server Control Panel) — das ist ein *anderes* Panel als das CCP, in dem die
> Domains und diese DNS-Zone liegen. Genau daran scheitert die Zuordnung
> üblicherweise: VPS und Domain sind bei netcup getrennte Produkte, und ein neu
> registrierter Domainname zeigt bis zur manuellen Änderung auf die Parkseite.
>
> Reihenfolge: IP im SCP ablesen → A/AAAA im CCP auf diese IP ändern →
> `deploy/server-setup.sh` → `deploy/setup-ssl.sh` (erst dann gibt es 443).

### Alte Domain — Zustand korrekt

`veystunesofficial.de` zeigt auf `217.160.0.63` (IONOS), MX auf `mx00/mx01.ionos.de`.
Die alte Seite läuft also unverändert bei IONOS und die Migration hat noch nicht
begonnen — **genau so soll es zum jetzigen Zeitpunkt sein** (siehe Phase 3).

---

## Vorher zu beschaffende Werte

Diese Werte stehen nicht im Repo, weil sie pro Deployment bzw. pro Anbieter
verschieden sind. Ohne sie lässt sich die Zone nicht vollständig füllen:

| Platzhalter | Woher |
|---|---|
| `<SERVER_IPV4>` | netcup VPS — Server Control Panel (SCP), Übersicht |
| `<SERVER_IPV6>` | ebenda, falls der VPS IPv6 hat (netcup vergibt normalerweise ein `/64`). Falls nein: AAAA-Zeilen weglassen |
| `<MAILBOX_DKIM>` | Mailbox.org Einstellungen → Domain → DKIM. Der lange `p=…`-Wert |
| `<RESEND_DKIM>` | Resend Dashboard → Domains → veysl.de hinzufügen. Resend generiert die Records selbst |

> Bei DKIM **nie einen Wert raten oder aus einer anderen Domain kopieren.** Es
> ist ein öffentlicher Schlüssel zu einem privaten Schlüssel, der beim Anbieter
> liegt — ein falscher Wert ist schlechter als kein Record, weil die Signatur
> dann aktiv fehlschlägt statt zu fehlen.

---

## Phase 1 — Website (vor dem ersten Deploy)

Ohne diese Records kann `deploy/setup-ssl.sh` kein Zertifikat holen: certbot
validiert über HTTP-01, das heißt Let's Encrypt muss die Domain bereits auf
dem Server auflösen können.

| Host | Typ | Priorität | Ziel | Status |
|---|---|---|---|---|
| `@` | A | — | `<SERVER_IPV4>` | ⚠️ steht auf `46.38.243.234` — gegen SCP prüfen |
| `www` | A | — | `<SERVER_IPV4>` | ❌ fehlt, muss angelegt werden |
| `@` | AAAA | — | `<SERVER_IPV6>` | ❌ fehlt (entfällt ohne IPv6) |
| `www` | AAAA | — | `<SERVER_IPV6>` | ❌ fehlt (entfällt ohne IPv6) |

Diese vier sind die **einzigen** Einträge, deren Wert noch von außen kommen
muss (netcup SCP). Alles in Phase 2 unten ist bis auf die zwei DKIM-Schlüssel
fertig und wörtlich übernehmbar.

`www` zeigt bewusst auf dieselbe IP und wird **serverseitig** von nginx auf die
Apex-Domain weitergeleitet — kein CNAME, kein DNS-Redirect. Grund: die
Weiterleitung soll ein `301` mit korrektem TLS sein, und das kann DNS nicht
leisten.

## Phase 2 — Mail (unabhängig, jederzeit)

Nichts an der Deploy-Pipeline berührt Mail-DNS. Die Website funktioniert ohne
diese Records — aber das Anfrageformular schickt dann Bestätigungen, die im
Spam landen. Details und Begründung: `docs/MAIL-SETUP.md`.

**Derzeit existiert keiner dieser Einträge** (siehe Ist-Zustand oben): Mail an
`@veysl.de` wird momentan überhaupt nicht angenommen. Bis auf die beiden
DKIM-Schlüssel sind alle Werte unten endgültig — die MX-Hostnamen sind
öffentlich, SPF/DMARC/CAA vollständig durch die Anbieterwahl bestimmt.

### Postannahme (Mailbox.org)

| Host | Typ | Priorität | Ziel |
|---|---|---|---|
| `@` | MX | 10 | `mxext1.mailbox.org.` |
| `@` | MX | 10 | `mxext2.mailbox.org.` |
| `@` | MX | 20 | `mxext3.mailbox.org.` |

### SPF — genau ein Record für die ganze Domain

| Host | Typ | Ziel |
|---|---|---|
| `@` | TXT | `v=spf1 include:spf.mailbox.org include:_spf.resend.com -all` |

**Zwei SPF-Records sind ein Fehler, kein doppelter Schutz** — die Auswertung
bricht dann mit `permerror` ab und beide Versender fallen durch. Beide gehören
in diese eine Zeile. `-all` (hard fail) ist bei einer neuen Domain richtig.

### DKIM — je ein Selector pro Versender

| Host | Typ | Ziel |
|---|---|---|
| `mail._domainkey` | TXT | `v=DKIM1; k=rsa; p=<MAILBOX_DKIM>` |
| `resend._domainkey` | TXT | `v=DKIM1; k=rsa; p=<RESEND_DKIM>` |

Resend zeigt im Dashboard die exakten Records an, die es erwartet — inklusive
möglicher zusätzlicher Einträge für den Return-Path. **Das Dashboard ist die
Quelle der Wahrheit**, nicht diese Tabelle: übernimm, was dort steht.

### DMARC — gestaffelt einführen

| Host | Typ | Ziel |
|---|---|---|
| `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:info@veysl.de; pct=100` |

Start mit `p=none`. Nach zwei bis vier Wochen ohne Auffälligkeiten in den
Reports auf `p=quarantine`, später `p=reject`. **Direkt auf `p=reject` zu gehen
blockiert die eigene Post**, solange DKIM/SPF noch nicht sauber sind.

### Optional — CAA

| Host | Typ | Ziel |
|---|---|---|
| `@` | CAA | `0 issue "letsencrypt.org"` |

Legt fest, dass nur Let's Encrypt Zertifikate für die Domain ausstellen darf —
das ist genau das, was `deploy/setup-ssl.sh` per certbot benutzt. Kein Pflicht-
Record, aber er schließt eine ganze Klasse von Fehlausstellungen aus.

---

## Phase 3 — Alte Domain (⚠️ NICHT am Launch-Tag)

| Host (Zone `veystunesofficial.de`) | Typ | Ziel |
|---|---|---|
| `@` | A | `<SERVER_IPV4>` |
| `www` | A | `<SERVER_IPV4>` |
| `@` | AAAA | `<SERVER_IPV6>` |
| `www` | AAAA | `<SERVER_IPV6>` |

**Diese vier Records erst setzen, wenn `veysl.de` live, gesund und einige Tage
stabil ist.** Es ist das höchste technische Risiko im Projekt (CHECKLIST.md
A.4): die alte Domain trägt aktuell die Sichtbarkeit, die Google-Bewertungen
und den Instagram-Link. Beide Domains gleichzeitig umzustellen macht es
unmöglich zu erkennen, welche Änderung ein Problem verursacht hat.

Direkt nach diesen Records gehört das Zertifikat erweitert, sonst liefert die
alte Domain einen TLS-Fehler statt der Weiterleitung:

```bash
CERTBOT_EMAIL=<owner-email> \
CERTBOT_DOMAINS="veysl.de www.veysl.de veystunesofficial.de www.veystunesofficial.de" \
deploy/setup-ssl.sh
```

Die vollständige Migrationssequenz (Search Console Change of Address, Google
Business Profile, Instagram-Bio) steht in `docs/DEPLOYMENT.md` →
"Domain migration". **Die alte Domain nicht kündigen.**

### TTL vor der Migration senken

Die Standard-TTL ist typischerweise `86400` (24 h). Ein bis zwei Tage *vor*
Phase 3 auf `300` senken, damit eine Fehlkonfiguration in Minuten statt in
einem Tag korrigierbar ist. Nach der erfolgreichen Umstellung wieder erhöhen.
In netcups CCP ist die TTL je Zone einstellbar — welche Granularität dein
Tarif erlaubt, zeigt das Panel selbst.

---

## Eintragen — Panel oder API

Im netcup **CCP** (Customer Control Panel) → *Domains* → Zone bearbeiten. Die
Spalten dort heißen Host / Typ / Priorität / Ziel, passend zu den Tabellen
oben; die Apex-Domain wird als `@` eingetragen, nie als `veysl.de`.

netcup hat auch eine DNS-API. Für eine **einmalige** Zoneneinrichtung von
knapp einem Dutzend Records ist das Panel der ruhigere Weg: kein API-Key im
Shell-History, und jede Zeile ist vor dem Speichern sichtbar. Die API lohnt
sich, wenn Records wiederholt automatisiert geändert werden — das ist hier
nicht der Fall.

## Danach prüfen

```bash
dig +short veysl.de A
dig +short www.veysl.de A
dig +short veysl.de MX
dig +short veysl.de TXT
dig +short _dmarc.veysl.de TXT
dig +short resend._domainkey.veysl.de TXT
```

Erst wenn A/AAAA korrekt auflösen, `deploy/setup-ssl.sh` starten — ein
fehlgeschlagener certbot-Versuch zählt gegen das Rate-Limit von Let's Encrypt.

Für Mail zusätzlich der Ende-zu-Ende-Test aus `docs/MAIL-SETUP.md` Schritt 4:
Testmail über [mail-tester.com](https://www.mail-tester.com) (Ziel 10/10) und
im Gmail-Original `SPF: PASS`, `DKIM: PASS`, `DMARC: PASS` bestätigen.
</content>
</invoke>
