import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    }
  },
  ...tseslint.configs.recommended,
  {
    ignores: [
      "dist/**/*",
      "node_modules/**/*",
      "src/generated/**/*",
      "prisma/migrations/**/*",
      "*.config.js",
      "*.config.mjs",
      "build/**/*",
      "coverage/**/*",
      ".next/**/*"
    ]
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "off"
    }
  }
]);
