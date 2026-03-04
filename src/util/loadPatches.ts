import type { Patch } from "@/types/Patch";
import { Logger } from "./Logger";
import { SettingsManager } from "./SettingsManager";

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
    const eligiblePatches = new Map<string, Patch>();

    Logger.debug(
        `Loading patches for world "${config.world}" at "${config.runAt}"`,
    );

    for (const path in patches) {
        const patch = patches[path];
        const { meta } = patch;

        if (
            (meta.world ?? "ISOLATED") !== config.world ||
            (meta.runAt ?? "document_idle") !== config.runAt
        )
            continue;
        if (!meta.matches.some((pattern) => pattern.test(currentUrl))) continue;
        if (meta.deviceTypes && !meta.deviceTypes.includes(getDeviceType()))
            continue;
        if ((await SettingsManager.isPatchEnabled(meta.id)) === false) continue;

        eligiblePatches.set(meta.id, patch);
    }

    for (const [patchId, patch] of activePatches) {
        const isEligible = eligiblePatches.has(patchId);
        const runStrategy = patch.meta.runStrategy ?? "onUrlChange";

        if (!isEligible || runStrategy === "onUrlChange") {
            activePatches.delete(patchId);

            const previousTask =
                patchLifecyclePromises.get(patchId) || Promise.resolve();
            const currentTask = previousTask.then(async () => {
                try {
                    const t0 = performance.now();
                    await patch.cleanup();
                    const t1 = performance.now();
                    Logger.debug(
                        `Cleaned up patch "${patch.meta.name}" (${patch.meta.id}) in ${(t1 - t0).toFixed(2)}ms`,
                    );
                } catch (err) {
                    if (err instanceof Error && err.name === "AbortError")
                        return;
                    Logger.error(
                        `Error cleaning up patch "${patch.meta.name}" (${patch.meta.id}):`,
                        err,
                    );
                }
            });
            patchLifecyclePromises.set(patchId, currentTask);
        }
    }

    for (const [patchId, patch] of eligiblePatches) {
        if (activePatches.has(patchId)) continue;

        activePatches.set(patchId, patch);
        const { meta, init } = patch;

        const previousTask =
            patchLifecyclePromises.get(patchId) || Promise.resolve();
        const currentTask = previousTask.then(async () => {
            try {
                if (!activePatches.has(patchId)) return;
                const t0 = performance.now();
                await init(await SettingsManager.getPatchSettings(meta));
                const t1 = performance.now();
                Logger.debug(
                    `Initialized patch "${meta.name}" (${meta.id}) in ${(t1 - t0).toFixed(2)}ms`,
                );
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") return;
                Logger.error(
                    `Error initializing patch "${meta.name}" (${meta.id}):`,
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
