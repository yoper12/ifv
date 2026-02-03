import type { Meta } from "../types/Meta.ts";
import type { Setting } from "../types/Setting.ts";

interface PatchSettings {
    [key: string]: Setting["defaultValue"];
}

export class SettingsManager {
    /**
     * Retrieves the configuration settings for a given patch.
     *
     * @param patchMeta Metadata defined in patch definition.
     * @returns A promise that resolves to the configuration object for the patch.
     */
    static async getPatchSettings(patchMeta: Meta): Promise<PatchSettings> {
        const storageKey = `patch_settings_${patchMeta.id}`;
        const data = (await chrome.storage.sync.get(storageKey)) as Record<
            string,
            PatchSettings
        >;
        const storedData: PatchSettings = data[storageKey] ?? {};

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
        const storageKey = `patch_settings_${patchId}`;

        const data = (await chrome.storage.sync.get(storageKey)) as Record<
            string,
            PatchSettings
        >;
        const existingSettings: PatchSettings = data[storageKey] ?? {};

        await chrome.storage.sync.set({
            [storageKey]: { ...existingSettings, [settingId]: newValue },
        });
    }

    /**
     * Enables a specific patch.
     *
     * @param patchId ID of the patch to enable.
     * @returns A promise that resolves when the patch has been enabled.
     */
    static async enablePatch(patchId: string): Promise<void> {
        const storageKey = `patch_enabled_${patchId}`;
        await chrome.storage.sync.set({ [storageKey]: true });
    }

    /**
     * Disables a specific patch.
     *
     * @param patchId ID of the patch to disable.
     * @returns A promise that resolves when the patch has been disabled.
     */
    static async disablePatch(patchId: string): Promise<void> {
        const storageKey = `patch_enabled_${patchId}`;
        await chrome.storage.sync.set({ [storageKey]: false });
    }

    /**
     * Checks if a specific patch is currently enabled.
     *
     * @param patchId ID of the patch to check.
     * @returns A promise that resolves to true if the patch is enabled, false otherwise.
     */
    static async isPatchEnabled(patchId: string): Promise<boolean> {
        const storageKey = `patch_enabled_${patchId}`;
        const result: Record<string, boolean | undefined> =
            await chrome.storage.sync.get(storageKey);
        return result[storageKey] ?? true;
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
