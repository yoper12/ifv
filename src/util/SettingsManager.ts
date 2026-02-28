import type { Meta } from "@/types/Meta.ts";
import type { Setting } from "@/types/Setting.ts";
import { Logger } from "./Logger.ts";

interface PatchSettings {
    [key: string]: Setting["defaultValue"];
}

type StorageValue = boolean | PatchSettings;

export class SettingsManager {
    private static cache?: Record<string, StorageValue>;

    private static pendingWrites: Record<string, StorageValue> = {};
    private static writeTimeout?: number;

    /**
     * Retrieves the current cache of settings, initializing it if necessary.
     *
     * @returns A promise that resolves to the current cache of settings.
     */
    private static async getCache(): Promise<Record<string, StorageValue>> {
        if (!this.cache) {
            this.cache = await chrome.storage.sync.get(null);
            Logger.info(`Initialized settings cache:`, this.cache);

            chrome.storage.onChanged.addListener((changes, areaName) => {
                if (areaName === "sync" && this.cache) {
                    for (const [key, { newValue }] of Object.entries(changes)) {
                        this.cache[key] = newValue as StorageValue;
                    }
                }
            });
        }

        return this.cache;
    }

    /**
     * Schedules a write to the storage with debouncing to minimize the number of writes.
     *
     * @param key The storage key to write to.
     * @param value The value to write to storage.
     */
    private static scheduleWrite(key: string, value: StorageValue) {
        this.pendingWrites[key] = value;

        if (this.cache) {
            this.cache[key] = value;
            Logger.info(`Updated settings cache:`, { [key]: value });
        }

        if (this.writeTimeout) {
            clearTimeout(this.writeTimeout);
        }

        this.writeTimeout = setTimeout(() => {
            const dataToWrite = { ...this.pendingWrites };
            this.pendingWrites = {};
            chrome.storage.sync
                .set(dataToWrite)
                .catch((err) =>
                    Logger.error(
                        `Error writing data to storage:`,
                        dataToWrite,
                        err,
                    ),
                );
            Logger.info(`Saved settings to storage:`, dataToWrite);
        }, 300);
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
        const storedData =
            (cache[storageKey] as PatchSettings | undefined) ?? {};

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
    static async savePatchSetting(
        patchId: string,
        settingId: string,
        newValue: Setting["defaultValue"],
    ) {
        const cache = await this.getCache();
        const storageKey = `patch_settings_${patchId}`;
        const existingSettings =
            (cache[storageKey] as PatchSettings | undefined) ?? {};

        this.scheduleWrite(storageKey, {
            ...existingSettings,
            [settingId]: newValue,
        });
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
}
