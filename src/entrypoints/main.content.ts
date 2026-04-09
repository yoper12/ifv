import { defineContentScript } from "#imports";
import type { Patch } from "@/types/Patch";
import { onSettingsChange } from "@/utils/SettingsManager";
import { onUrlChange } from "@/utils/spaRouter";
import { syncPatches } from "@/utils/syncPatches";

const patches = import.meta.glob<Patch>("@/patches/**/index.ts", {
    import: "default",
    eager: true,
});

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
    world: "MAIN",
    main() {
        const lifecycle = {
            document_start: true,
            document_end: false,
            document_idle: false,
        };

        async function runSync(
            trigger: "INITIAL" | "URL_CHANGE" | "SETTINGS_CHANGE",
            changedPatches?: Set<string>,
        ) {
            if (lifecycle.document_start) {
                await syncPatches(
                    patches,
                    { world: "MAIN", runAt: "document_start" },
                    trigger,
                    changedPatches,
                );
            }
            if (lifecycle.document_end) {
                await syncPatches(
                    patches,
                    { world: "MAIN", runAt: "document_end" },
                    trigger,
                    changedPatches,
                );
            }
            if (lifecycle.document_idle) {
                await syncPatches(
                    patches,
                    { world: "MAIN", runAt: "document_idle" },
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
            window.addEventListener(
                "DOMContentLoaded",
                () => {
                    syncPatches(
                        patches,
                        { world: "MAIN", runAt: "document_end" },
                        "INITIAL",
                    );
                    lifecycle.document_end = true;
                },
                { once: true },
            );
        } else {
            syncPatches(
                patches,
                { world: "MAIN", runAt: "document_end" },
                "INITIAL",
            );
            lifecycle.document_end = true;
        }

        if (document.readyState === "complete") {
            syncPatches(
                patches,
                { world: "MAIN", runAt: "document_idle" },
                "INITIAL",
            );
            lifecycle.document_idle = true;
        } else {
            window.addEventListener(
                "load",
                () => {
                    syncPatches(
                        patches,
                        { world: "MAIN", runAt: "document_idle" },
                        "INITIAL",
                    );
                    lifecycle.document_idle = true;
                },
                { once: true },
            );
        }
    },
});
