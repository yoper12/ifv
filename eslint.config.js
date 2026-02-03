import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import { defineConfig } from "eslint/config";

export default defineConfig([
    js.configs.recommended,
    tseslint.configs.recommended,
    {
        ignores: ["dist/**", "node_modules/**", ".git/**"],
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.webextensions,
            },
        },
    },
    eslintConfigPrettier,
]);
