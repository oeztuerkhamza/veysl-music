# Schriften

`cormorant-garamond-latin.woff2` und `cormorant-garamond-latin-italic.woff2` sind
**Teilmengen** von Cormorant Garamond (SIL Open Font License 1.1, Lizenztext:
`OFL-cormorant.txt`; Quelle: github.com/google/fonts, `ofl/cormorantgaramond`).

Warum nicht `next/font/google`: Google liefert pro Schrift je eine Datei für
`latin` und `latin-ext`, jeweils für Normal und Kursiv — vier Dateien, ~145 KB,
alle vorgeladen und alle vor dem LCP. Die Teilmengen hier sind zwei Dateien,
~45 KB.

| Datei | Inhalt | Größe |
|---|---|---|
| `cormorant-garamond-latin.woff2` | Normal, variabel `wght` 400–600 | ~27 KB |
| `cormorant-garamond-latin-italic.woff2` | Kursiv, nur Gewicht 400 | ~17 KB |

Zeichenumfang: Basis-Latein, Latin-1 (de/fr/es/nl/en/ku: ä ö ü ß é è ê î û ç ñ …),
Türkisch (Ğ ğ İ ı Ş ş), Œ œ Ÿ, Anführungszeichen, Gedankenstriche, €, ….
Alles andere fällt auf die Ersatzschrift (`ui-serif, Georgia`) zurück.

Neu erzeugen (Beispiel Normal; `fonttools` und `brotli` per pip):

```
python -m fontTools.varLib.instancer CormorantGaramond[wght].ttf wght=400:600 -o tmp.ttf
pyftsubset tmp.ttf --unicodes="U+0020-007E,U+00A0-00FF,U+011E-011F,U+0130-0131,U+015E-015F,U+0152-0153,U+0178,U+02C6,U+02DC,U+2013-2014,U+2018-201E,U+2022,U+2026,U+20AC,U+2122" \
  --layout-features='kern,liga,clig,ccmp,locl,mark,mkmk' --flavor=woff2 --no-hinting --desubroutinize \
  --output-file=cormorant-garamond-latin.woff2
```

Kursiv genauso mit `CormorantGaramond-Italic[wght].ttf` und `wght=400` (statisch).
Kursiv kommt nur in `.accent-phrase` (Gewicht 400) vor.
