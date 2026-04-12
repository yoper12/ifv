import { defineContentScript } from "#imports";

import { initBridgeServer } from "@/utils/bridge/server";
import {
    disablePatch,
    enablePatch,
    getPatchSettings,
    isPatchEnabled,
    savePatchSetting,
    togglePatch,
} from "@/utils/SettingsManager";

export default defineContentScript({
    main() {
        initBridgeServer({
            disablePatch,
            enablePatch,
            getPatchSettings,
            isPatchEnabled,
            savePatchSetting,
            togglePatch,
        });
    },
    matches: [
        "*://dziennik-uczen.vulcan.net.pl/*",
        "*://dziennik-wiadomosci.vulcan.net.pl/*",
        "*://uczen.eduvulcan.pl/*",
        "*://wiadomosci.eduvulcan.pl/*",
        "*://dziennik-logowanie.vulcan.net.pl/*",
        "*://eduvulcan.pl/*",
    ],
    runAt: "document_start",
    world: "ISOLATED",
});
