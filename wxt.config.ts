import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
    srcDir: "src",
    imports: false,
    manifestVersion: 3,
    manifest: {
        name: "Hephaestus",
        description:
            "Poprawia uciążliwe elementy stron usług █████████ oraz ████████ ██████",
        browser_specific_settings: { gecko: { id: "j.skup.test@gmail.com" } },
        permissions: ["storage"],
        host_permissions: [
            "*://dziennik-uczen.vulcan.net.pl/*",
            "*://dziennik-wiadomosci.vulcan.net.pl/*",
            "*://uczen.eduvulcan.pl/*",
            "*://wiadomosci.eduvulcan.pl/*",
            "*://dziennik-logowanie.vulcan.net.pl/*",
            "*://eduvulcan.pl/*",
        ],
    },
    modules: ["@wxt-dev/module-svelte"],
});
