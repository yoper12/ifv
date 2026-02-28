import type { Patch } from "@/types/Patch.ts";
import { loadPatchesForConfig } from "@/util/loadPatches.ts";
import { onUrlChange } from "@/util/spaRouter.ts";

const patches = import.meta.glob<Patch>("@/patches/**/index.ts", {
    import: "default",
    eager: true,
});

async function loadPatches() {
    await loadPatchesForConfig(patches, {
        world: "ISOLATED",
        runAt: "document_start",
    });
}

loadPatches();

onUrlChange(loadPatches);
