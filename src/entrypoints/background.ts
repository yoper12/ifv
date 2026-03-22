import { browser, defineBackground } from "#imports";
import { Logger } from "@/utils/Logger";
import type { Setting } from "@/types/Setting.js";

interface PatchSettings {
    [key: string]: Setting["defaultValue"];
}

type StorageValue = boolean | PatchSettings;

export default defineBackground(() => {
    let pendingWrites: Record<string, StorageValue> = {};
    let writeTimeout: ReturnType<typeof setTimeout> | undefined;

    async function performWrite() {
        const dataToWrite = { ...pendingWrites };
        pendingWrites = {};

        try {
            await browser.storage.sync.set(dataToWrite);
            Logger.debug("Saved settings to storage:", dataToWrite);
        } catch (err) {
            Logger.error("Error writing data to storage:", err);
        }
    }

    browser.runtime.onMessage.addListener((message, _, sendResponse) => {
        if (message.type === "SCHEDULE_WRITE") {
            const { key, value } = message.payload;

            pendingWrites[key] = value;

            if (writeTimeout) {
                clearTimeout(writeTimeout);
            }

            writeTimeout = setTimeout(performWrite, 1000);

            sendResponse({ success: true });
        }
    });
});
