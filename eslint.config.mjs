import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Von Payload generiert (`payload migrate:create`, siehe
    // payload.config.mts). Die `payload`/`req`-Parameter stehen in dessen
    // Signatur und werden von den meisten Migrationen nicht gebraucht — sie
    // hier zu melden erzeugt Warnungen, die niemand beheben kann, weil die
    // Dateien beim nächsten Generieren identisch zurückkommen.
    "src/migrations/**",
  ]),
]);

export default eslintConfig;
