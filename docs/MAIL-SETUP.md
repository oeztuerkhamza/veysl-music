# E-Mail für dj-veys.de

Ziel: zwei Adressen mit sauberer Zustellbarkeit.

| Adresse | Zweck | Postfach? |
| --- | --- | --- |
| `info@dj-veys.de` | Geschäftsadresse für Kundenkontakt, Impressum, Google Business Profile | **Ja** — echtes Postfach, wird gelesen |
| `no-reply@dj-veys.de` | Absender der automatischen Anfrage-Bestätigung | Nein — nur Versand |

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
dj-veys.de.   MX  10  mxext1.mailbox.org.
dj-veys.de.   MX  10  mxext2.mailbox.org.
dj-veys.de.   MX  20  mxext3.mailbox.org.
```

### SPF — wer darf im Namen der Domain senden

**Nur ein einziger SPF-Eintrag pro Domain.** Beide Versender gehören in dieselbe Zeile:

```
dj-veys.de.   TXT   "v=spf1 include:spf.mailbox.org include:_spf.resend.com -all"
```

`-all` (hard fail) statt `~all` — bei einer neuen Domain gibt es keinen Grund,
unbekannte Absender durchzulassen.

### DKIM — kryptografische Signatur

Beide Dienste erzeugen je einen eigenen Selector. Werte aus dem jeweiligen
Dashboard übernehmen:

```
mail._domainkey.dj-veys.de.     TXT   "v=DKIM1; k=rsa; p=<Mailbox.org-Key>"
resend._domainkey.dj-veys.de.   TXT   "v=DKIM1; k=rsa; p=<Resend-Key>"
```

### DMARC — Umgang mit Fälschungen

Gestaffelt einführen, **nicht sofort auf `reject`**:

```
_dmarc.dj-veys.de.   TXT   "v=DMARC1; p=none; rua=mailto:info@dj-veys.de; pct=100"
```

Nach zwei bis vier Wochen ohne Auffälligkeiten in den Reports auf
`p=quarantine`, später auf `p=reject`. Zu früh scharf geschaltet, blockiert man
die eigene Post.

## Schritt 3 — im Projekt eintragen

1. `src/content/site.ts` → `contact.email` auf `info@dj-veys.de`.
2. `.env` (nicht committen):
   ```
   BOOKING_TRANSPORT=resend
   RESEND_API_KEY=re_...
   RESEND_FROM_EMAIL="DJ Veys <no-reply@dj-veys.de>"
   BOOKING_NOTIFY_EMAIL=info@dj-veys.de
   ```
   Die Absenderadresse heißt `RESEND_FROM_EMAIL` — genau so liest sie
   `ResendMailSender` (`src/app/api/anfrage/_lib/transport.ts`). Hier stand
   früher `BOOKING_FROM_EMAIL`; diesen Namen liest keine Zeile im Projekt, und
   wer den Block wörtlich übernahm, bekam einen Transport, der bei jeder
   Anfrage schon beim Konstruieren scheiterte.
3. ~~`ResendTransport` implementieren~~ — **erledigt**. `ResendMailSender` in
   `src/app/api/anfrage/_lib/transport.ts` spricht die REST-API direkt an
   (kein SDK) und wird über `BOOKING_TRANSPORT=resend` aktiviert. Fehlen
   `RESEND_API_KEY` oder `RESEND_FROM_EMAIL`, wirft er sofort beim Start
   statt erst bei der ersten echten Anfrage.
4. ~~**`Reply-To: info@dj-veys.de`** in der Auto-Antwort setzen~~ — **erledigt**,
   die Auto-Antwort trägt jetzt `BOOKING_NOTIFY_EMAIL` als Reply-To.
   Offen geblieben: die Bestätigung des `/kontakt`-Formulars
   (`MailContactTransport.sendConfirmation`) hat noch kein Reply-To. Dafür
   müsste die Absenderadresse aus dem CMS bis dorthin durchgereicht werden —
   eine Schnittstellenänderung, die hier bewusst nicht mitgemacht wurde.

## Schritt 4 — vor dem Launch prüfen

- [ ] Testmail an eine Gmail- **und** eine GMX/Web.de-Adresse (deutsche Paare nutzen beides)
- [ ] Über [mail-tester.com](https://www.mail-tester.com) senden — Ziel: 10/10
- [ ] Im Gmail-Original prüfen: `SPF: PASS`, `DKIM: PASS`, `DMARC: PASS`
- [ ] Auto-Antwort landet im Posteingang, nicht im Werbung-Tab
- [ ] Antwort auf die Auto-Antwort kommt bei `info@dj-veys.de` an
- [ ] `info@dj-veys.de` in Impressum, Google Business Profile und Instagram-Bio eintragen

## Warum zwei Adressen

`no-reply@` bekommt die automatische Bestätigung. Landet sie im Spam oder wird
sie als Massenmail eingestuft, beschädigt das nur die Reputation dieser
Absenderadresse — die persönliche Korrespondenz über `info@` bleibt sauber.
Umgekehrt schützt es davor, dass ein automatisierter Versand die Zustellbarkeit
der wichtigen Mails ruiniert.
