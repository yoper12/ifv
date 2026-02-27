import type { Patch } from "../types/Patch.ts";
import { Logger } from "../util/Logger.ts";
import { SettingsManager } from "../util/SettingsManager.ts";

interface PatchLoaderConfig {
    world: "MAIN" | "ISOLATED";
    runAt: "document_start" | "document_end" | "document_idle";
}

const activePatches = new Map<string, Patch>();
const patchLifecyclePromises = new Map<string, Promise<void>>();

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
    const eligiblePatchIds = new Set<string>();

    for (const path in patches) {
        const patch = patches[path];
        const { meta, init } = patch;

        if (
            (meta.world ?? "ISOLATED") !== config.world ||
            (meta.runAt ?? "document_idle") !== config.runAt
        )
            continue;
        if (!meta.matches.some((pattern) => pattern.test(currentUrl))) continue;
        if (meta.deviceTypes && !meta.deviceTypes.includes(getDeviceType()))
            continue;

        if ((await SettingsManager.isPatchEnabled(meta.id)) === false) continue;

        eligiblePatchIds.add(meta.id);
        if (activePatches.has(meta.id)) continue;
        activePatches.set(meta.id, patch);

        const previousTask =
            patchLifecyclePromises.get(meta.id) || Promise.resolve();

        const currentTask = previousTask.then(async () => {
            try {
                if (!activePatches.has(meta.id)) return;

                const t0 = performance.now();
                await init(await SettingsManager.getPatchSettings(meta));
                const t1 = performance.now();

                Logger.info(
                    `Initialized patch "${meta.name}" (${meta.id}) in ${(t1 - t0).toFixed(2)}ms`,
                );
            } catch (err) {
                if (err.name === "AbortError") return; // Cleanup functions can intentionally throw this error when aborting dom waiters/watchers

                Logger.error(
                    `Error initializing patch "${meta.name}" (${meta.id}):`,
                    err,
                );
            }
        });
        patchLifecyclePromises.set(meta.id, currentTask);
    }

    for (const [patchId, patch] of activePatches) {
        if (eligiblePatchIds.has(patchId)) continue;
        if ((patch.meta.world ?? "ISOLATED") !== config.world) continue;
        if ((patch.meta.runAt ?? "document_idle") !== config.runAt) continue;

        if (patch.meta.runStrategy === "once") continue;

        activePatches.delete(patchId);

        const previousTask =
            patchLifecyclePromises.get(patchId) || Promise.resolve();

        const currentTask = previousTask.then(async () => {
            if (!patch.cleanup) return;

            try {
                const t0 = performance.now();
                await patch.cleanup();
                const t1 = performance.now();

                Logger.info(
                    `Cleaned up patch "${patch.meta.name}" (${patch.meta.id}) in ${(t1 - t0).toFixed(2)}ms`,
                );
            } catch (err) {
                if (err.name === "AbortError") return; // Cleanup functions can intentionally throw this error when aborting dom waiters/watchers

                Logger.error(
                    `Error cleaning up patch "${patch.meta.name}" (${patch.meta.id}):`,
                    err,
                );
            }
        });
        patchLifecyclePromises.set(patchId, currentTask);
    }
}

function getDeviceType() {
    return window.innerWidth < 1024 ? "mobile" : "desktop";
}
