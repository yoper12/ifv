import type { Patch } from "../types/Patch.ts";
import { SettingsManager } from "../util/SettingsManager.ts";

interface PatchLoaderConfig {
    world: "MAIN" | "ISOLATED";
    runAt: "document_start" | "document_end" | "document_idle";
}

const loadedPatches = new Set<string>();

/**
 * Loads and initializes patches based on the provided configuration.
 *
 * @param patches A record of patch modules to be loaded.
 * @param config The configuration specifying the world and runAt timing.
 * @returns A promise that resolves when all applicable patches have been initialized.
 */
export async function loadPatchesForConfig(
    patches: Record<string, Patch>,
    config: PatchLoaderConfig,
) {
    const currentUrl = window.location.href;

    for (const path in patches) {
        const patch = patches[path];
        const { meta, init } = patch;

        if (
            (meta.world ?? "ISOLATED" !== config.world) ||
            (meta.runAt ?? "document_idle" !== config.runAt)
        )
            continue;
        if (!meta.matches.some((pattern) => pattern.test(currentUrl))) continue;
        if (!meta.deviceTypes.includes(getDeviceType())) continue;

        if ((await SettingsManager.isPatchEnabled(meta.id)) === false) continue;

        if (meta.runStrategy === "once") {
            if (loadedPatches.has(meta.id)) continue;
            loadedPatches.add(meta.id);
        }

        (async () => {
            try {
                await init(await SettingsManager.getPatchSettings(meta));
            } catch (err) {
                if (err.name === "AbortError") return; // Cleanup funtions can intentionally throw this error when aborting dom waiters/watchers

                console.error(
                    `Error initializing patch "${meta.name}" (${meta.id}):`,
                    err,
                );
            }
        })();
    }
}

function getDeviceType(): "desktop" | "mobile" {
    return window.innerWidth < 1024 ? "mobile" : "desktop";
}
