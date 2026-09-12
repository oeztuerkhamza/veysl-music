# Kleinanzeigen-Watcher — bewusst winzig.
#
# Das Werkzeug hat keine Abhaengigkeiten ausser Node selbst, deshalb gibt es
# hier kein `npm install` und keinen Build-Schritt: nur die Quelldateien auf
# ein Alpine-Node-Image legen.

FROM node:24-alpine

# Zeitzone, damit die Logzeilen dieselbe Uhrzeit zeigen wie Kleinanzeigen.
RUN apk add --no-cache tzdata
ENV TZ=Europe/Berlin

WORKDIR /app

# Nur der Code. watches.json und state.json kommen zur Laufzeit aus /data —
# waeren sie im Image, wuerde jeder Rebuild das Gedaechtnis zuruecksetzen.
COPY watcher.mjs ./
COPY src ./src

# `node` ist im offiziellen Image bereits als unprivilegierter Benutzer
# angelegt. Der Watcher braucht keine Rootrechte; er liest eine Webseite und
# schreibt eine JSON-Datei.
RUN mkdir -p /data && chown -R node:node /data /app
USER node

VOLUME ["/data"]

ENTRYPOINT ["node", "watcher.mjs", "--config", "/data/watches.json"]
