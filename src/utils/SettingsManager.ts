import { browser } from "#imports";
import { Logger } from "./Logger";
import type { Meta } from "@/types/Meta";
import type { Setting } from "@/types/Setting";

interface PatchSettings {
    [key: string]: Setting["defaultValue"];
}

type StorageValue = boolean | PatchSettings;
type ChangeCallback = () => void;

let cache: Record<string, StorageValue> | undefined = undefined;
const listeners: ChangeCallback[] = [];

export function onChange(callback: ChangeCallback) {
    listeners.push(callback);
}

/**
 * Retrieves the current cache of settings, initializing it if necessary.
 *
 * @returns A promise that resolves to the current cache of settings.
 */
async function getCache(): Promise<Record<string, StorageValue>> {
    if (!cache) {
        cache = await browser.storage.sync.get(null);
        Logger.debug(`Initialized settings cache:`, cache);

        browser.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === "sync" && cache) {
                for (const [key, { newValue }] of Object.entries(changes)) {
                    cache[key] = newValue as StorageValue;
                }
            }
        });
    }

    return cache!;
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

    browser.runtime.sendMessage({ type: "SCHEDULE_WRITE", payload: { key, value } }).catch((err) => {
        Logger.error("Error sending save request to service worker:", err);
    });
}

/**
 * Retrieves the configuration settings for a given patch.
 *
 * @param patchMeta Metadata defined in patch definition.
 * @returns A promise that resolves to the configuration object for the patch.
 */
export async function getPatchSettings(patchMeta: Meta): Promise<PatchSettings> {
    const cache = await getCache();
    const storageKey = `patch_settings_${patchMeta.id}`;
    const storedData = (cache[storageKey] as PatchSettings | undefined) ?? {};

    const settings: PatchSettings = {};

    if (patchMeta.settings) {
        for (const setting of patchMeta.settings) {
            settings[setting.id] = storedData[setting.id] ?? setting.defaultValue;
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
    const cache = await getCache();
    const storageKey = `patch_settings_${patchId}`;
    const existingSettings = (cache[storageKey] as PatchSettings | undefined) ?? {};

    scheduleWrite(storageKey, { ...existingSettings, [settingId]: newValue });
}

/**
 * Enables a specific patch.
 *
 * @param patchId ID of the patch to enable.
 * @returns A promise that resolves when the patch has been enabled.
 */
export async function enablePatch(patchId: string): Promise<void> {
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
    const cache = await getCache();
    const storageKey = `patch_enabled_${patchId}`;
    return (cache[storageKey] as boolean | undefined) ?? true;
}

/**
 * Toggles the enabled state of a specific patch.
 *
 * @param patchId ID of the patch to toggle.
 * @returns A promise that resolves to the new enabled state.
 */
export async function togglePatch(patchId: string): Promise<boolean> {
    const isEnabled = await isPatchEnabled(patchId);
    const newState = !isEnabled;
    if (newState) {
        await enablePatch(patchId);
    } else {
        await disablePatch(patchId);
    }
    return newState;
}

/** Clears cache. Used for testing purposes. */
export function resetCache() {
    cache = undefined;
}
