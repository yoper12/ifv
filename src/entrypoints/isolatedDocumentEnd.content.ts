import { defineContentScript } from "#imports";
import type { Patch } from "@/types/Patch";
import { loadPatchesForConfig } from "@/utils/loadPatches";
import { onUrlChange } from "@/utils/spaRouter";

const patches = import.meta.glob<Patch>("@/patches/**/index.ts", { import: "default", eager: true });

export default defineContentScript({
    matches: [
        "*://dziennik-uczen.vulcan.net.pl/*",
        "*://dziennik-wiadomosci.vulcan.net.pl/*",
        "*://uczen.eduvulcan.pl/*",
        "*://wiadomosci.eduvulcan.pl/*",
        "*://dziennik-logowanie.vulcan.net.pl/*",
        "*://eduvulcan.pl/*",
    ],
    runAt: "document_end",
    world: "ISOLATED",
    main() {
        async function loadPatches() {
            await loadPatchesForConfig(patches, { world: "ISOLATED", runAt: "document_end" });
        }

        loadPatches();
        onUrlChange(loadPatches);
    },
});
