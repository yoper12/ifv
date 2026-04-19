import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
    imports: false,
    manifest: {
        browser_specific_settings: { gecko: { id: "j.skup.test@gmail.com" } },
        description:
            "Poprawia uciążliwe elementy stron usług █████████ oraz ████████ ██████",
        name: "Hephaestus",
        permissions: ["storage"],
    },
    manifestVersion: 3,
    modules: ["@wxt-dev/module-svelte"],
    srcDir: "src",
});
