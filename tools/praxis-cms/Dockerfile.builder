# Node 22 wie in den Workflows des Praxis-Repos; bookworm statt alpine, weil
# sharp (Bildoptimierung im Astro-Build) seine fertigen Binaries für glibc
# mitbringt.
FROM node:22-bookworm-slim
RUN apt-get update -qq \
 && apt-get install -y -qq --no-install-recommends git openssh-client rsync ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY builder.sh github_known_hosts ./
ENV ASTRO_TELEMETRY_DISABLED=1
CMD ["sh", "/app/builder.sh"]
