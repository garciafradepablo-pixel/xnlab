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
    // App interna autónoma (zero-build, se despliega aparte). Sus Edge
    // Functions de Deno (`jsr:…`, `Deno.*`) y sus módulos vanilla no son parte
    // del build del sitio Next — no los type-checkees ni los lintees aquí.
    "opportunity-intel/**",
  ]),
]);

export default eslintConfig;
