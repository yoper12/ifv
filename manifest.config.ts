import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
    manifest_version: 3,
    name: "Hephaestus",
    description:
        "Poprawia uciążliwe elementy stron usług █████████ oraz ████████ ██████",
    version: pkg.version,
    icons: {
        128: "logo/logo-128.png",
        192: "logo/logo-192.png",
        512: "logo/logo-512.png",
    },
    action: {
        default_icon: {
            128: "logo/logo-128.png",
            192: "logo/logo-192.png",
            512: "logo/logo-512.png",
        },
        default_popup: "src/popup/index.html",
    },
    permissions: ["storage"],
    host_permissions: [
        "*://dziennik-uczen.vulcan.net.pl/*",
        "*://dziennik-wiadomosci.vulcan.net.pl/*",
        "*://uczen.eduvulcan.pl/*",
        "*://wiadomosci.eduvulcan.pl/*",
        "*://dziennik-logowanie.vulcan.net.pl/*",
        "*://eduvulcan.pl/*",
    ],
});
