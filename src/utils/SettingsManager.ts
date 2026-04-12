import { browser } from "#imports";
import { Logger } from "./Logger";
import { callIsolated, onExtensionEvent } from "./bridge/client";
import { emitExtensionEvent } from "./bridge/server";
import type { Meta } from "@/types/Meta";
import type { Setting } from "@/types/Setting";

interface PatchSettings {
    [key: string]: Setting["defaultValue"];
}

type StorageValue = boolean | PatchSettings;
type ChangeCallback = (changedPatches: Set<string>) => void;

const listeners: ChangeCallback[] = [];
const isMainWorld = typeof browser === "undefined" || !browser?.storage;

let cache: Record<string, StorageValue> | undefined;
let cachePromise: Promise<Record<string, StorageValue>> | undefined;

if (!isMainWorld) {
    browser.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === "sync" && cache) {
            Logger.debug("Storage changes detected:", changes);
            const changedPatches = new Set<string>();

            for (const [key, { newValue }] of Object.entries(changes)) {
                if (newValue === undefined) delete cache[key];
                else cache[key] = newValue as StorageValue;

                if (key.startsWith("patch_enabled_"))
                    changedPatches.add(key.replace("patch_enabled_", ""));
                else if (key.startsWith("patch_settings_"))
                    changedPatches.add(key.replace("patch_settings_", ""));
            }

            if (changedPatches.size > 0) {
                for (const callback of listeners) callback(changedPatches);
                emitExtensionEvent("hephaestus:settings-changed", [
                    ...changedPatches,
                ]);
            }
        }
    });
} else {
    onExtensionEvent<string[]>(
        "hephaestus:settings-changed",
        (changedPatchesArray) => {
            const changedPatches = new Set(changedPatchesArray);
            for (const callback of listeners) callback(changedPatches);
        },
    );
}

export function onSettingsChange(callback: ChangeCallback) {
    listeners.push(callback);
}

/**
 * Retrieves the current cache of settings, initializing it if necessary.
 *
 * @returns A promise that resolves to the current cache of settings.
 */
async function getCache(): Promise<Record<string, StorageValue>> {
    if (cache) return cache;
    if (cachePromise) return cachePromise;

    cachePromise = (
        browser.storage.sync.get(null) as
            | Promise<Record<string, StorageValue>>
            | Promise<undefined>
    ).then((res) => {
        cache = res ?? {};
        Logger.debug(`Initialized settings cache:`, cache);
        return cache;
    });

    return cachePromise;
}

/**
 * Schedules a write to the storage with debouncing to minimize the number of writes.
 *
 * @param key The storage key to write to.
 * @param value The value to write to storage.
 */
function scheduleWrite(key: string, value: StorageValue) {
    if (cache) {
        cache[key] = value;
        Logger.debug(`Updated settings cache:`, { [key]: value });
    }
    browser.runtime
        .sendMessage({ type: "SCHEDULE_WRITE", payload: { key, value } })
        .catch((err) => {
            Logger.error("Error sending save request to service worker:", err);
        });
}

/**
 * Retrieves the configuration settings for a given patch.
 *
 * @param patchMeta Metadata defined in patch definition.
 * @returns A promise that resolves to the configuration object for the patch.
 */
export async function getPatchSettings(
    patchMeta: Meta,
): Promise<PatchSettings> {
    if (isMainWorld) return callIsolated("getPatchSettings", patchMeta);

    const data = await getCache();
    const storageKey = `patch_settings_${patchMeta.id}`;
    const storedData = (data[storageKey] as PatchSettings | undefined) ?? {};

    const settings: PatchSettings = {};
    if (patchMeta.settings) {
        for (const setting of patchMeta.settings) {
            settings[setting.id] =
                storedData[setting.id] ?? setting.defaultValue;
        }
    }
    return settings;
}

/**
 * Saves a new value for a specific setting of a patch.
 *
 * @param patchId ID of the patch.
 * @param settingId ID of the setting.
 * @param newValue The new value to be saved.
 * @returns A promise that resolves when the setting has been saved.
 */
export async function savePatchSetting(
    patchId: string,
    settingId: string,
    newValue: Setting["defaultValue"],
) {
    if (isMainWorld)
        return callIsolated("savePatchSetting", patchId, settingId, newValue);

    const data = await getCache();
    const storageKey = `patch_settings_${patchId}`;
    const existingSettings =
        (data[storageKey] as PatchSettings | undefined) ?? {};
    scheduleWrite(storageKey, { ...existingSettings, [settingId]: newValue });
}

/**
 * Enables a specific patch.
 *
 * @param patchId ID of the patch to enable.
 * @returns A promise that resolves when the patch has been enabled.
 */
export async function enablePatch(patchId: string): Promise<void> {
    if (isMainWorld) return callIsolated("enablePatch", patchId);
    await getCache();
    scheduleWrite(`patch_enabled_${patchId}`, true);
}

/**
 * Disables a specific patch.
 *
 * @param patchId ID of the patch to disable.
 * @returns A promise that resolves when the patch has been disabled.
 */
export async function disablePatch(patchId: string): Promise<void> {
    if (isMainWorld) return callIsolated("disablePatch", patchId);
    await getCache();
    scheduleWrite(`patch_enabled_${patchId}`, false);
}

/**
 * Checks if a specific patch is currently enabled.
 *
 * @param patchId ID of the patch to check.
 * @returns A promise that resolves to true if the patch is enabled, false otherwise.
 */
export async function isPatchEnabled(patchId: string): Promise<boolean> {
    if (isMainWorld) return callIsolated("isPatchEnabled", patchId);
    const data = await getCache();
    const storageKey = `patch_enabled_${patchId}`;
    return (data[storageKey] as boolean | undefined) ?? true;
}

/**
 * Toggles the enabled state of a specific patch.
 *
 * @param patchId ID of the patch to toggle.
 * @returns A promise that resolves to the new enabled state.
 */
export async function togglePatch(patchId: string): Promise<boolean> {
    if (isMainWorld) return callIsolated("togglePatch", patchId);
    const isEnabled = await isPatchEnabled(patchId);
    if (isEnabled) await disablePatch(patchId);
    else await enablePatch(patchId);
    return !isEnabled;
}

/** Clears cache. Used for testing purposes. */
export function resetCache() {
    cache = undefined;
    cachePromise = undefined;
}
