import type { Patch } from "@/types/Patch";

import { Logger } from "./Logger";
import { getPatchSettings, isPatchEnabled } from "./SettingsManager";

interface PatchLoaderConfig {
    runAt: "document_end" | "document_idle" | "document_start";
    world: "ISOLATED" | "MAIN";
}

const activePatches = new Map<string, Patch>();
const patchLifecyclePromises = new Map<string, Promise<void>>();

/**
 * Loads and initializes patches based on the provided configuration.
 *
 * @param patches - A record of patch modules to be loaded.
 * @param config - The configuration specifying the world and runAt timing.
 * @param trigger - The event that triggered the sync.
 * @param changedPatches - An optional set of patch IDs that were changed (only
 *   for SETTINGS_CHANGE trigger).
 * @returns A promise that resolves when all applicable patches have been
 *   initialized.
 */
export async function syncPatches(
    patches: Record<string, Patch>,
    config: PatchLoaderConfig,
    trigger: "INITIAL" | "SETTINGS_CHANGE" | "URL_CHANGE",
    changedPatches?: Set<string>,
) {
    const currentUrl = globalThis.location.href;

    // Logger.debug(`Syncing patches states for world "${config.world}" at "${config.runAt}"`);

    for (const patch of Object.values(patches)) {
        const { meta } = patch;

        if (
            (meta.world ?? "ISOLATED") !== config.world
            || (meta.runAt ?? "document_idle") !== config.runAt
        )
            continue;
        if (meta.deviceTypes && !meta.deviceTypes.includes(getDeviceType()))
            continue;
        if (trigger === "SETTINGS_CHANGE" && meta.dynamicReloadReady === false)
            continue;

        const isUrlMatching = meta.matches.some((pattern) =>
            pattern.test(currentUrl),
        );
        const isEnabled = await isPatchEnabled(meta.id);

        const isEligible = isUrlMatching && isEnabled;
        const isActive = activePatches.has(meta.id);

        let action: "CLEANUP" | "INIT" | "NONE" | "RELOAD" = "NONE";

        if (isEligible && !isActive)
            action = "INIT"; // if patch should be active, but is not, initialize it
        else if (!isEligible && isActive)
            action = "CLEANUP"; // if patch should not be active, but is, clean it up
        else if (isEligible && isActive) {
            if (
                trigger === "URL_CHANGE"
                && (patch.meta.runStrategy ?? "onUrlChange") === "onUrlChange"
            )
                action = "RELOAD"; // if patch is active and eligible, but URL just changed and patch should reinitialize on URL change, reload it
            else if (
                trigger === "SETTINGS_CHANGE"
                && changedPatches?.has(meta.id)
            )
                action = "RELOAD"; // if patch is active and eligible, but settings just changed and its settings were among the changed ones, reload it
        }

        if (action === "NONE") continue;

        const previousTask =
            patchLifecyclePromises.get(meta.id) || Promise.resolve();
        const currentTask = previousTask.then(async () => {
            try {
                if (
                    (action === "CLEANUP" || action === "RELOAD")
                    && activePatches.has(meta.id)
                ) {
                    activePatches.delete(meta.id);
                    const t0 = performance.now();
                    await patch.cleanup();
                    Logger.debug(
                        `Cleaned up patch "${patch.meta.name}" (${patch.meta.id}) in ${(performance.now() - t0).toFixed(2)}ms`,
                    );
                }
            } catch (error) {
                if (error instanceof Error && error.name === "AbortError")
                    return;
                Logger.error(
                    `Error cleaning up patch "${patch.meta.name}" (${patch.meta.id}):`,
                    error,
                );
            }

            try {
                if (
                    (action === "INIT" || action === "RELOAD")
                    && !activePatches.has(meta.id)
                ) {
                    activePatches.set(meta.id, patch);
                    const t0 = performance.now();
                    await patch.init(await getPatchSettings(meta));
                    Logger.debug(
                        `Initialized patch "${meta.name}" (${meta.id}) in ${(performance.now() - t0).toFixed(2)}ms`,
                    );
                }
            } catch (error) {
                activePatches.delete(meta.id);
                if (error instanceof Error && error.name === "AbortError")
                    return;
                Logger.error(
                    `Error initializing patch "${meta.name}" (${meta.id}):`,
                    error,
                );
            }

            return;
        });

        patchLifecyclePromises.set(meta.id, currentTask);
    }
}

const getDeviceType = () =>
    globalThis.matchMedia("(max-width: 1023px)").matches ? "mobile" : "desktop";
