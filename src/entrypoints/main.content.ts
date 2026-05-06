import { defineContentScript } from "#imports";

import type { Patch } from "@/types/Patch";

import { onSettingsChange } from "@/utils/SettingsManager";
import { onUrlChange } from "@/utils/spaRouter";
import { syncPatches } from "@/utils/syncPatches";

const patches = import.meta.glob<Patch>("@/patches/**/index.ts", {
    eager: true,
    import: "default",
});

export default defineContentScript({
    main() {
        const lifecycle = {
            document_end: false,
            document_idle: false,
            document_start: true,
        };

        async function runSync(
            trigger: "INITIAL" | "SETTINGS_CHANGE" | "URL_CHANGE",
            changedPatches?: Set<string>,
        ) {
            if (lifecycle.document_start) {
                await syncPatches(
                    patches,
                    { runAt: "document_start", world: "MAIN" },
                    trigger,
                    changedPatches,
                );
            }
            if (lifecycle.document_end) {
                await syncPatches(
                    patches,
                    { runAt: "document_end", world: "MAIN" },
                    trigger,
                    changedPatches,
                );
            }
            if (lifecycle.document_idle) {
                await syncPatches(
                    patches,
                    { runAt: "document_idle", world: "MAIN" },
                    trigger,
                    changedPatches,
                );
            }
        }

        runSync("INITIAL");

        onUrlChange(() => runSync("URL_CHANGE"));
        onSettingsChange((changedPatches) =>
            runSync("SETTINGS_CHANGE", changedPatches),
        );

        if (document.readyState === "loading") {
            globalThis.addEventListener(
                "DOMContentLoaded",
                () => {
                    syncPatches(
                        patches,
                        { runAt: "document_end", world: "MAIN" },
                        "INITIAL",
                    );
                    lifecycle.document_end = true;
                },
                { once: true },
            );
        } else {
            syncPatches(
                patches,
                { runAt: "document_end", world: "MAIN" },
                "INITIAL",
            );
            lifecycle.document_end = true;
        }

        if (document.readyState === "complete") {
            syncPatches(
                patches,
                { runAt: "document_idle", world: "MAIN" },
                "INITIAL",
            );
            lifecycle.document_idle = true;
        } else {
            window.addEventListener(
                "load",
                () => {
                    syncPatches(
                        patches,
                        { runAt: "document_idle", world: "MAIN" },
                        "INITIAL",
                    );
                    lifecycle.document_idle = true;
                },
                { once: true },
            );
        }
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
    world: "MAIN",
});
