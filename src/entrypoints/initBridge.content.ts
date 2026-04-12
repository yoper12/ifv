import { defineContentScript } from "#imports";
import {
    disablePatch,
    enablePatch,
    getPatchSettings,
    isPatchEnabled,
    savePatchSetting,
    togglePatch,
} from "@/utils/SettingsManager";
import { initBridgeServer } from "@/utils/bridge/server";

export default defineContentScript({
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
    main() {
        initBridgeServer({
            getPatchSettings,
            savePatchSetting,
            enablePatch,
            disablePatch,
            isPatchEnabled,
            togglePatch,
        });
    },
});
