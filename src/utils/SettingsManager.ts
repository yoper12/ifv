import { browser } from "#imports";

import type { Meta } from "@/types/Meta";
import type { Setting } from "@/types/Setting";

import { callIsolated, onExtensionEvent } from "./bridge/client";
import { emitExtensionEvent } from "./bridge/server";
import { Logger } from "./Logger";

type ChangeCallback = (changedPatches: Set<string>) => void;

interface PatchSettings {
    [key: string]: Setting["defaultValue"];
}
type StorageValue = boolean | PatchSettings;

const listeners: ChangeCallback[] = [];
const isMainWorld = browser === undefined || !browser?.storage;

let cache: Record<string, StorageValue> | undefined;
let cachePromise: Promise<Record<string, StorageValue>> | undefined;

if (isMainWorld) {
    onExtensionEvent<string[]>(
        "hephaestus:settings-changed",
        (changedPatchesArray) => {
            const changedPatches = new Set(changedPatchesArray);
            for (const callback of listeners) callback(changedPatches);
        },
    );
} else {
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
}

/**
 * Disables a specific patch.
 *
 * @param patchId - ID of the patch to disable.
 * @returns A promise that resolves when the patch has been disabled.
 */
export async function disablePatch(patchId: string): Promise<void> {
    if (isMainWorld) return callIsolated("disablePatch", patchId);
    await getCache();
    scheduleWrite(`patch_enabled_${patchId}`, false);
}

/**
 * Enables a specific patch.
 *
 * @param patchId - ID of the patch to enable.
 * @returns A promise that resolves when the patch has been enabled.
 */
export async function enablePatch(patchId: string): Promise<void> {
    if (isMainWorld) return callIsolated("enablePatch", patchId);
    await getCache();
    scheduleWrite(`patch_enabled_${patchId}`, true);
}

/**
 * Retrieves the configuration settings for a given patch.
 *
 * @param patchMeta - Metadata defined in patch definition.
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
 * Checks if a specific patch is currently enabled.
 *
 * @param patchId - ID of the patch to check.
 * @returns A promise that resolves to true if the patch is enabled, false
 *   otherwise.
 */
export async function isPatchEnabled(patchId: string): Promise<boolean> {
    if (isMainWorld) return callIsolated("isPatchEnabled", patchId);
    const data = await getCache();
    const storageKey = `patch_enabled_${patchId}`;
    return (data[storageKey] as boolean | undefined) ?? true;
}

export function onSettingsChange(callback: ChangeCallback) {
    listeners.push(callback);
}

/** Clears cache. Used for testing purposes. */
export function resetCache() {
    cache = undefined;
    cachePromise = undefined;
}

/**
 * Saves a new value for a specific setting of a patch.
 *
 * @param patchId - ID of the patch.
 * @param settingId - ID of the setting.
 * @param newValue - The new value to be saved.
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
 * Toggles the enabled state of a specific patch.
 *
 * @param patchId - ID of the patch to toggle.
 * @returns A promise that resolves to the new enabled state.
 */
export async function togglePatch(patchId: string): Promise<boolean> {
    if (isMainWorld) return callIsolated("togglePatch", patchId);
    const isEnabled = await isPatchEnabled(patchId);
    await (isEnabled ? disablePatch(patchId) : enablePatch(patchId));
    return !isEnabled;
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
        browser.storage.sync.get() as
            | Promise<Record<string, StorageValue>>
            | Promise<undefined>
    ).then((result) => {
        cache = result ?? {};
        Logger.debug(`Initialized settings cache:`, cache);
        return cache;
    });

    return cachePromise;
}

/**
 * Schedules a write to the storage with debouncing to minimize the number of
 * writes.
 *
 * @param key - The storage key to write to.
 * @param value - The value to write to storage.
 */
function scheduleWrite(key: string, value: StorageValue) {
    if (cache) {
        cache[key] = value;
        Logger.debug(`Updated settings cache:`, { [key]: value });
    }
    browser.runtime
        .sendMessage({ payload: { key, value }, type: "SCHEDULE_WRITE" })
        .catch((error) => {
            Logger.error(
                "Error sending save request to service worker:",
                error,
            );
        });
}
