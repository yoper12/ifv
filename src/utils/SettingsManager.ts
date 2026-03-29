import type { Meta } from "@/types/Meta";
import type { Setting } from "@/types/Setting";
import { Logger } from "./Logger";
import { browser } from "#imports";

interface PatchSettings {
    [key: string]: Setting["defaultValue"];
}

type StorageValue = boolean | PatchSettings;
export class SettingsManager {
    static #cache?: Record<string, StorageValue>;

    /**
     * Retrieves the current cache of settings, initializing it if necessary.
     *
     * @returns A promise that resolves to the current cache of settings.
     */
    private static async getCache(): Promise<Record<string, StorageValue>> {
        if (!this.#cache) {
            this.#cache = await browser.storage.sync.get(null);
            Logger.debug(`Initialized settings cache:`, this.#cache);

            browser.storage.onChanged.addListener((changes, areaName) => {
                if (areaName === "sync" && this.#cache) {
                    for (const [key, { newValue }] of Object.entries(changes)) {
                        this.#cache[key] = newValue as StorageValue;
                    }
                }
            });
        }

        return this.#cache;
    }

    /**
     * Schedules a write to the storage with debouncing to minimize the number of writes.
     *
     * @param key The storage key to write to.
     * @param value The value to write to storage.
     */
    private static scheduleWrite(key: string, value: StorageValue) {
        if (this.#cache) {
            this.#cache[key] = value;
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
    static async getPatchSettings(patchMeta: Meta): Promise<PatchSettings> {
        const cache = await this.getCache();
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
    static async savePatchSetting(patchId: string, settingId: string, newValue: Setting["defaultValue"]) {
        const cache = await this.getCache();
        const storageKey = `patch_settings_${patchId}`;
        const existingSettings = (cache[storageKey] as PatchSettings | undefined) ?? {};

        this.scheduleWrite(storageKey, { ...existingSettings, [settingId]: newValue });
    }

    /**
     * Enables a specific patch.
     *
     * @param patchId ID of the patch to enable.
     * @returns A promise that resolves when the patch has been enabled.
     */
    static async enablePatch(patchId: string): Promise<void> {
        await this.getCache();
        this.scheduleWrite(`patch_enabled_${patchId}`, true);
    }

    /**
     * Disables a specific patch.
     *
     * @param patchId ID of the patch to disable.
     * @returns A promise that resolves when the patch has been disabled.
     */
    static async disablePatch(patchId: string): Promise<void> {
        await this.getCache();
        this.scheduleWrite(`patch_enabled_${patchId}`, false);
    }

    /**
     * Checks if a specific patch is currently enabled.
     *
     * @param patchId ID of the patch to check.
     * @returns A promise that resolves to true if the patch is enabled, false otherwise.
     */
    static async isPatchEnabled(patchId: string): Promise<boolean> {
        const cache = await this.getCache();
        const storageKey = `patch_enabled_${patchId}`;
        return (cache[storageKey] as boolean | undefined) ?? true;
    }

    /**
     * Toggles the enabled state of a specific patch.
     *
     * @param patchId ID of the patch to toggle.
     * @returns A promise that resolves to the new enabled state.
     */
    static async togglePatch(patchId: string): Promise<boolean> {
        const isEnabled = await this.isPatchEnabled(patchId);
        const newState = !isEnabled;
        if (newState) {
            await this.enablePatch(patchId);
        } else {
            await this.disablePatch(patchId);
        }
        return newState;
    }

    /** Clears cache. Used for testing purposes. */
    static async resetCache() {
        this.#cache = undefined;
    }
}
