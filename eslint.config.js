import e18e from "@e18e/eslint-plugin";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import svelte from "eslint-plugin-svelte";
import tsdoc from "eslint-plugin-tsdoc";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
    e18e.configs.recommended,
    js.configs.recommended,
    tseslint.configs.recommended,
    svelte.configs.recommended,
    {
        ignores: [
            "dist/**",
            "node_modules/**",
            ".git/**",
            ".wxt/**",
            ".output/**",
        ],
    },
    {
        languageOptions: {
            globals: { ...globals.browser, ...globals.webextensions },
        },
    },
    {
        files: ["**/*.svelte"],
        languageOptions: { parserOptions: { parser: tseslint.parser } },
    },
    {
        files: ["**/*.ts", "**/*.svelte"],
        plugins: { tsdoc },
        rules: { "tsdoc/syntax": "warn" },
    },
    eslintConfigPrettier,
]);
