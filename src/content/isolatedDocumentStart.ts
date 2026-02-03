import type { Patch } from "../types/Patch.ts";
import { loadPatchesForConfig } from "./loadPatches.ts";

const patches = import.meta.glob<Patch>("../patches/**/index.ts", {
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

// @ts-expect-error - navigation api is not yet included in lib.dom.ts
window.navigation.addEventListener("navigatesuccess", loadPatches);
