# E-Mail für veysl.de

Ziel: zwei Adressen mit sauberer Zustellbarkeit.

| Adresse | Zweck | Postfach? |
| --- | --- | --- |
| `info@veysl.de` | Geschäftsadresse für Kundenkontakt, Impressum, Google Business Profile | **Ja** — echtes Postfach, wird gelesen |
| `no-reply@veysl.de` | Absender der automatischen Anfrage-Bestätigung | Nein — nur Versand |

Aktuell steht in `src/content/site.ts` noch eine private Gmail-Adresse. Bei
Premium-Hochzeitsanfragen wirkt das unprofessionell und kostet Vertrauen genau
in dem Moment, in dem das Paar vergleicht.

---

## Schritt 1 — Anbieter wählen

**Empfehlung: gehosteter Anbieter.** Ein eigener Mailserver ist Dauerarbeit
(Reputation, Blocklisten, Updates), und bei einem Ein-Personen-Betrieb ist der
Nutzen gering.

| Option | Preis | Bewertung |
| --- | --- | --- |
| **Mailbox.org** | ~3 €/Monat | Deutscher Anbieter, DSGVO-konform, Server in DE. Beste Wahl hier. |
| **Google Workspace** | ~7 €/Monat | Bequem, aber US-Anbieter — bei deutschen Kunden ein Datenschutz-Thema. |
| **IONOS Mail** | ~1 €/Monat | Günstig, die Domain liegt ohnehin dort. Weniger komfortabel. |
| Selbst gehostet (Mailcow) | Serverkosten | Nur sinnvoll, wenn ohnehin ein Server betreut wird. |

Für den reinen Versand der Auto-Antwort ist ein **Transaktions-Dienst** besser
als das normale Postfach: **Resend** (kostenlos bis 3.000 Mails/Monat) oder
Postmark. Der Code ist darauf vorbereitet — siehe `src/app/api/anfrage/_lib/transport.ts`.

**Sinnvolle Kombination:** Postfach `info@` bei Mailbox.org, Versand von
`no-reply@` über Resend.

## Schritt 2 — DNS-Einträge

Die Records hier im Kontext der ganzen Zone (zusammen mit A/AAAA, CAA und der
Migrationsreihenfolge): `docs/DNS-RECORDS.md`.

Alle drei sind Pflicht. Fehlt einer, landen die Bestätigungsmails im Spam —
und eine Anfragebestätigung im Spam-Ordner ist eine verlorene Buchung.

### MX (Postannahme)

```
veysl.de.   MX  10  mxext1.mailbox.org.
veysl.de.   MX  10  mxext2.mailbox.org.
veysl.de.   MX  20  mxext3.mailbox.org.
```

### SPF — wer darf im Namen der Domain senden

**Nur ein einziger SPF-Eintrag pro Domain.** Beide Versender gehören in dieselbe Zeile:

```
veysl.de.   TXT   "v=spf1 include:spf.mailbox.org include:_spf.resend.com -all"
```

`-all` (hard fail) statt `~all` — bei einer neuen Domain gibt es keinen Grund,
unbekannte Absender durchzulassen.

### DKIM — kryptografische Signatur

Beide Dienste erzeugen je einen eigenen Selector. Werte aus dem jeweiligen
Dashboard übernehmen:

```
mail._domainkey.veysl.de.     TXT   "v=DKIM1; k=rsa; p=<Mailbox.org-Key>"
resend._domainkey.veysl.de.   TXT   "v=DKIM1; k=rsa; p=<Resend-Key>"
```

### DMARC — Umgang mit Fälschungen

Gestaffelt einführen, **nicht sofort auf `reject`**:

```
_dmarc.veysl.de.   TXT   "v=DMARC1; p=none; rua=mailto:info@veysl.de; pct=100"
```

Nach zwei bis vier Wochen ohne Auffälligkeiten in den Reports auf
`p=quarantine`, später auf `p=reject`. Zu früh scharf geschaltet, blockiert man
die eigene Post.

## Schritt 3 — im Projekt eintragen

1. `src/content/site.ts` → `contact.email` auf `info@veysl.de`.
2. `.env` (nicht committen):
   ```
   BOOKING_TRANSPORT=resend
   RESEND_API_KEY=re_...
   BOOKING_NOTIFY_EMAIL=info@veysl.de
   BOOKING_FROM_EMAIL="VEYSL <no-reply@veysl.de>"
   ```
3. `ConsoleTransport` in `src/app/api/anfrage/_lib/transport.ts` durch eine
   `ResendTransport` ersetzen — die Schnittstelle steht bereits.
4. **`Reply-To: info@veysl.de`** in der Auto-Antwort setzen. Sonst antwortet
   das Paar an `no-reply@` und die Anfrage verschwindet.

## Schritt 4 — vor dem Launch prüfen

- [ ] Testmail an eine Gmail- **und** eine GMX/Web.de-Adresse (deutsche Paare nutzen beides)
- [ ] Über [mail-tester.com](https://www.mail-tester.com) senden — Ziel: 10/10
- [ ] Im Gmail-Original prüfen: `SPF: PASS`, `DKIM: PASS`, `DMARC: PASS`
- [ ] Auto-Antwort landet im Posteingang, nicht im Werbung-Tab
- [ ] Antwort auf die Auto-Antwort kommt bei `info@veysl.de` an
- [ ] `info@veysl.de` in Impressum, Google Business Profile und Instagram-Bio eintragen

## Warum zwei Adressen

`no-reply@` bekommt die automatische Bestätigung. Landet sie im Spam oder wird
sie als Massenmail eingestuft, beschädigt das nur die Reputation dieser
Absenderadresse — die persönliche Korrespondenz über `info@` bleibt sauber.
Umgekehrt schützt es davor, dass ein automatisierter Versand die Zustellbarkeit
der wichtigen Mails ruiniert.
