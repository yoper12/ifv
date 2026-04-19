import e18e from "@e18e/eslint-plugin";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import perfectionist from "eslint-plugin-perfectionist";
import preferArrowFunctions from "eslint-plugin-prefer-arrow-functions";
import pluginPromise from "eslint-plugin-promise";
import regexpPlugin from "eslint-plugin-regexp";
import svelte from "eslint-plugin-svelte";
import tsdoc from "eslint-plugin-tsdoc";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
    preferArrowFunctions.configs.all,
    downgradeToWarn(perfectionist.configs["recommended-natural"]),
    pluginPromise.configs["flat/recommended"],
    regexpPlugin.configs.recommended,
    downgradeToWarn(eslintPluginUnicorn.configs.recommended),
    e18e.configs.recommended,
    js.configs.recommended,
    tseslint.configs.recommended,
    svelte.configs.recommended,
    {
        files: ["**/*.ts", "**/*.svelte"],
        plugins: { tsdoc },
        rules: { "tsdoc/syntax": "warn" },
    },
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
        rules: {
            "arrow-body-style": ["warn", "as-needed"],
            "no-restricted-syntax": [
                "warn",
                {
                    message:
                        "Using for...in loop is not recommended, since it hits prototypes and is slow. Instead, prepare an array using Object.keys(), Object.values() or Object.entries(), and use for...of loop.",
                    selector: "ForInStatement",
                },
                {
                    message:
                        "Prefer named functions over arrow functions for better readability if they have a body with multiple statements. Alternatively, if the function only has a single return statement, consider simplifying it by removing the curly braces and the return keyword.",
                    selector:
                        "VariableDeclarator > ArrowFunctionExpression[body.type='BlockStatement']",
                },
            ],
            "prefer-arrow-functions/prefer-arrow-functions": [
                "warn",
                {
                    classPropertiesAllowed: false,
                    disallowPrototype: true,
                    singleReturnOnly: true,
                },
            ],
            "unicorn/filename-case": "off",
        },
    },
    eslintConfigPrettier,
]);

function downgradeToWarn(config) {
    const downgradedRules = {};
    for (const [ruleName, ruleConfig] of Object.entries(config.rules || {})) {
        if (ruleConfig === "error" || ruleConfig === 2) {
            downgradedRules[ruleName] = "warn";
        } else if (
            Array.isArray(ruleConfig)
            && (ruleConfig[0] === "error" || ruleConfig[0] === 2)
        ) {
            downgradedRules[ruleName] = ["warn", ...ruleConfig.slice(1)];
        } else {
            downgradedRules[ruleName] = ruleConfig;
        }
    }
    return { ...config, rules: downgradedRules };
}
