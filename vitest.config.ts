import { defineConfig } from "vitest/config";
import { WxtVitest } from "wxt/testing/vitest-plugin";

export default defineConfig({
    plugins: [WxtVitest()],
    test: { environment: "jsdom", include: ["tests/unit/**/*.test.ts"], globals: true, clearMocks: true },
});
