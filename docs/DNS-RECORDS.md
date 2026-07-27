# DNS-Einträge für veysl.de

Vollständiger Satz DNS-Records für den Betrieb der Website (netcup VPS,
`docs/DEPLOYMENT.md`) und den Mailversand (`docs/MAIL-SETUP.md`).

**Die Reihenfolge ist Absicht.** Phase 1 und 2 sind unabhängig voneinander und
können sofort gesetzt werden. **Phase 3 gehört ausdrücklich nicht zum ersten
Launch** — siehe die Warnung dort.

---

## Ist-Zustand der Zone (geprüft 27. Juli 2026)

Öffentlich über 1.1.1.1 abgefragt — das ist der Stand, auf dem alles Weitere
aufbaut.

| Prüfung | Ergebnis |
|---|---|
| Nameserver `veysl.de` | ✅ netcup (`netcup.firstns.cc` + 4 weitere) — die Zone liegt am richtigen Ort |
| `veysl.de` A | ✅ `159.195.216.142` — zeigt auf den VPS (die frühere Parking-IP `46.38.243.234` ist ersetzt) |
| `www.veysl.de` A | ✅ `159.195.216.142` |
| `mail.veysl.de` A | ✅ `159.195.216.142` |
| AAAA (alle Hosts) | ➖ **entfällt dauerhaft** — der VPS hat kein globales IPv6, auf dem Server geprüft (`ip -6 addr show scope global` liefert nichts). Keine AAAA-Records anlegen |
| MX | ❌ keine — **korrekt für den jetzigen Stand**, siehe Phase 2 |
| SPF / DKIM / DMARC | ❌ nicht gesetzt — gehören zu Phase 2 |
| CAA | ✅ `0 issue "letsencrypt.org"` — auf dem Server verifiziert (`dig +short veysl.de CAA`) |

> ### Die Server-IP ist `159.195.216.142`
>
> Abgelesen im netcup **SCP** (Server Control Panel) — ein *anderes* Panel als
> das CCP, in dem die Domains und diese DNS-Zone liegen. Genau daran scheitert
> die Zuordnung üblicherweise: VPS und Domain sind bei netcup getrennte
> Produkte, und ein neu registrierter Domainname zeigt bis zur manuellen
> Änderung auf die Parkseite.
>
> Bestätigt per SSH: Port 22 offen, Debian 13 (OpenSSH 10.0p2).

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
| ~~`<SERVER_IPV4>`~~ | ✅ ermittelt: `159.195.216.142` |
| `<SERVER_IPV6>` | ebenda, falls der VPS IPv6 hat (netcup vergibt normalerweise ein `/64`). Falls nein: AAAA-Zeilen weglassen |
| `<KEY>` (DKIM) | Wird vom docker-mailserver-Container erzeugt — `docs/MAIL-SELFHOSTED.md`, Schritt 3. Nicht raten, nicht von einer anderen Domain kopieren |

> Bei DKIM **nie einen Wert raten oder aus einer anderen Domain kopieren.** Es
> ist ein öffentlicher Schlüssel zu einem privaten Schlüssel, der beim Anbieter
> liegt — ein falscher Wert ist schlechter als kein Record, weil die Signatur
> dann aktiv fehlschlägt statt zu fehlen.

---

## Phase 1 — Website (vor dem ersten Deploy)

Ohne diese Records kann `deploy/setup-ssl.sh` kein Zertifikat holen: certbot
validiert über HTTP-01, das heißt Let's Encrypt muss die Domain bereits auf
dem Server auflösen können.

| Host | Typ | Ziel | Status |
|---|---|---|---|
| `@` | A | `159.195.216.142` | ✅ gesetzt |
| `www` | A | `159.195.216.142` | ✅ gesetzt |
| `mail` | A | `159.195.216.142` | ✅ gesetzt (Mailhost, siehe Phase 2) |
| `@` | CAA | `0 issue "letsencrypt.org"` | ✅ gesetzt |
| — | AAAA | — | ➖ entfällt: der VPS hat kein IPv6 |

`www` zeigt bewusst auf dieselbe IP und wird **serverseitig** von nginx auf die
Apex-Domain weitergeleitet — kein CNAME, kein DNS-Redirect. Grund: die
Weiterleitung soll ein `301` mit korrektem TLS sein, und das kann DNS nicht
leisten.

**Kein AAAA — geklärt, nicht vergessen.** Auf dem Server geprüft: `eth0` hat
ausschließlich `159.195.216.142/22`, kein globales IPv6. Damit entfallen alle
AAAA-Zeilen in diesem Dokument. Sollte netcup später ein `/64` zuweisen, gilt:
AAAA nur zusammen mit funktionierender IPv6-Zustellung anlegen — ein AAAA ohne
das ist schlechter als keins, weil IPv6-fähige Clients ihn zuerst versuchen und
in einen Timeout laufen, bevor sie auf IPv4 zurückfallen. Für `mail` gilt das
doppelt: dort braucht es zusätzlich einen IPv6-PTR.

## Phase 2 — Mail (selbst gehostet)

> **Diese Phase beschreibt den selbst gehosteten Mailserver.** Das ist die
> getroffene Entscheidung des Betreibers; die Umsetzung steht in
> `docs/MAIL-SELFHOSTED.md`. Eine frühere Fassung dieses Dokuments listete
> hier die MX-Records von Mailbox.org — **die gelten nicht mehr.** MX und SPF
> schließen einander aus: beide Varianten gleichzeitig einzutragen bricht die
> Zustellung, statt sie abzusichern. `docs/MAIL-SETUP.md` beschreibt weiterhin
> die Anbieter-Variante und ist nur relevant, falls diese Entscheidung einmal
> zurückgenommen wird.

Nichts an der Deploy-Pipeline berührt Mail-DNS. Die Website funktioniert ohne
diese Records — aber das Anfrageformular verschickt dann keine
Benachrichtigungen (`BOOKING_TRANSPORT=smtp` braucht den laufenden Mailstack).

### Zwei Voraussetzungen, die nicht im DNS stehen

| Wo | Was | Warum |
|---|---|---|
| netcup **Support-Ticket** | Ausgehenden **Port 25** freischalten lassen | netcup blockt ihn standardmäßig. Ohne Freischaltung liefert der Server keine einzige Mail aus. 587 ist kein Ersatz — das ist die Einlieferung durch eigene Clients, 25 die Zustellung von Server zu Server |
| netcup **SCP** → Netzwerk → rDNS | `159.195.216.142` → `mail.veysl.de` | Wichtigster Einzelfaktor für Zustellbarkeit. Fehlt der PTR, landen Mails bei Gmail/GMX/Web.de verlässlich im Spam |

**Das Port-25-Ticket zuerst stellen.** Die Antwort kann Tage dauern und wird
bei neuen Kunden gelegentlich abgelehnt — alles andere wäre dann umsonst
aufgebaut.

### Records — erst eintragen, wenn der Mailstack läuft

Ein MX auf einen Host ohne laufenden Mailserver bedeutet: **jeder, der
schreibt, bekommt einen Bounce.** Vorher nur den A-Record aus Phase 1 setzen.

| Host | Typ | Priorität | Ziel |
|---|---|---|---|
| `@` | MX | 10 | `mail.veysl.de.` |
| `@` | TXT | — | `v=spf1 a:mail.veysl.de -all` |
| `mail._domainkey` | TXT | — | `v=DKIM1; k=rsa; p=<KEY>` |
| `_dmarc` | TXT | — | `v=DMARC1; p=none; rua=mailto:info@veysl.de; pct=100` |
| `_mta-sts` | TXT | — | `v=STSv1; id=2026072601` |
| `_smtp._tls` | TXT | — | `v=TLSRPTv1; rua=mailto:info@veysl.de` |
| `mta-sts` | CNAME | — | `veysl.de.` |

**Genau ein SPF-Record pro Domain.** Zwei sind kein doppelter Schutz — die
Auswertung bricht mit `permerror` ab und beide Versender fallen durch. Kommt
später zusätzlich Resend dazu, gehört es in dieselbe Zeile:
`v=spf1 a:mail.veysl.de include:_spf.resend.com -all`.

**`<KEY>` niemals raten.** Den DKIM-Schlüssel erzeugt der
docker-mailserver-Container; der öffentliche Teil wird von dort abgelesen
(`docs/MAIL-SELFHOSTED.md`, Schritt 3). Ein falscher DKIM-Eintrag ist
schlechter als gar keiner, weil die Signaturprüfung dann aktiv fehlschlägt
statt zu fehlen.

**DMARC startet mit `p=none`.** Nach zwei bis vier Wochen ohne Auffälligkeiten
in den Reports auf `p=quarantine`, später `p=reject`. Direkt auf `p=reject` zu
gehen blockiert die eigene Post, solange SPF/DKIM noch nicht sauber sind.

## Phase 3 — Alte Domain (⚠️ NICHT am Launch-Tag)

| Host (Zone `veystunesofficial.de`) | Typ | Ziel |
|---|---|---|
| `@` | A | `159.195.216.142` |
| `www` | A | `159.195.216.142` |
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
