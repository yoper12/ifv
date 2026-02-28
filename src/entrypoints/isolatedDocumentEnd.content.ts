import type { Patch } from "@/types/Patch.ts";
import { defineContentScript } from "#imports";
import { loadPatchesForConfig } from "@/util/loadPatches";
import { onUrlChange } from "@/util/spaRouter";

const patches = import.meta.glob<Patch>("@/patches/**/index.ts", {
    import: "default",
    eager: true,
});

export default defineContentScript({
    matches: ["<all_urls>"],
    runAt: "document_end",
    world: "ISOLATED",
    main() {
        async function loadPatches() {
            await loadPatchesForConfig(patches, {
                world: "ISOLATED",
                runAt: "document_end",
            });
        }

        loadPatches();
        onUrlChange(loadPatches);
    },
});
