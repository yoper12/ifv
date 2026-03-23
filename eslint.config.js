import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import svelte from "eslint-plugin-svelte";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import { defineConfig } from "eslint/config";

export default defineConfig([
    js.configs.recommended,
    tseslint.configs.recommended,
    svelte.configs.recommended,
    { ignores: ["dist/**", "node_modules/**", ".git/**", ".wxt/**", ".output/**"] },
    { languageOptions: { globals: { ...globals.browser, ...globals.webextensions } } },
    { files: ["**/*.svelte"], languageOptions: { parserOptions: { parser: tseslint.parser } } },
    eslintConfigPrettier,
]);
