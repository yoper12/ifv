import globals from "globals";
import js from "@eslint/js";
import json from "@eslint/json";
import jsdoc from "eslint-plugin-jsdoc";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            js,
            jsdoc,
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.webextensions
            },
            parserOptions: {
                ecmaFeatures: {
                    impliedStrict: true,
                }
            }
        },
        rules: {
            "no-console": "warn",
            "semi": ["error", "always"],
            "quotes": ["error", "double"],
            "no-unused-vars": "error",
            "prefer-const": "error",
            "jsdoc/check-syntax": "error",
            "jsdoc/check-types": "error",
            "jsdoc/valid-types": "error",
            "eqeqeq": ["warn", "smart"],
        },
        linterOptions: {
            reportUnusedInlineConfigs: "error",
        },
        extends: ["js/recommended"],
    },
    {
        files: ["**/*.json"],
        plugins: {
            json,
        },
        language: "json/json",
        rules: {
            "json/no-duplicate-keys": "error",
            "no-empty-keys": "error",
            "no-unsafe-values": "warn",
            "no-unnormalized-keys": "error",
        },
    }
]);