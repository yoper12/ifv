import type { Patch } from "../types/Patch.ts";
import { loadPatchesForConfig } from "./loadPatches.ts";

const patches = import.meta.glob<Patch>("../patches/**/index.ts", {
    import: "default",
    eager: true,
});

async function loadPatches() {
    await loadPatchesForConfig(patches, {
        world: "ISOLATED",
        runAt: "document_end",
    });
}

loadPatches();

// @ts-expect-error - navigation api is not yet included in lib.dom.ts
if (window.navigation) {
    // @ts-expect-error - navigation api is not yet included in lib.dom.ts
    window.navigation.addEventListener("navigatesuccess", loadPatches);
} else {
    let lastUrl = location.href;

    function checkUrlChange() {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            loadPatches();
        }
    }

    const observer = new MutationObserver(checkUrlChange);

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
    });

    window.addEventListener("popstate", checkUrlChange);
}
