// @vitest-environment node
import { fakeBrowser } from "#imports";

import type { Meta } from "@/types/Meta.js";

import * as SettingsManager from "@/utils/SettingsManager.js";

beforeEach(() => {
    beforeEach(async () => {
        fakeBrowser.reset();
        vi.resetModules();
        SettingsManager.resetCache();
    });
});

describe("onSettingsChange", () => {
    it("should register a listener and call it on relevant storage changes", async () => {
        const callback = vi.fn();
        SettingsManager.onSettingsChange(callback);

        await SettingsManager.isPatchEnabled("init-cache"); // just to initialise the cache and set up the listener

        await fakeBrowser.storage.sync.set({
            "patch_enabled_test-patch": true,
        });
        expect(callback).toHaveBeenCalledWith(new Set(["test-patch"]));

        await fakeBrowser.storage.sync.set({
            "patch_settings_test-patch": { color: "#ff0000" },
        });
        expect(callback).toHaveBeenCalledWith(new Set(["test-patch"]));

        await fakeBrowser.storage.sync.set({ unrelated_key: 123 });
        expect(callback).toHaveBeenLastCalledWith(new Set(["test-patch"]));
    });
});

describe("isPatchEnabled", () => {
    it("should be enabled by default", async () => {
        const isEnabled = await SettingsManager.isPatchEnabled("test-patch");
        expect(isEnabled).toBe(true);
    });

    it("should correctly return saved state", async () => {
        await fakeBrowser.storage.sync.set({
            "patch_enabled_test-patch": false,
        });

        const isEnabled = await SettingsManager.isPatchEnabled("test-patch");
        expect(isEnabled).toBe(false);
    });
});

describe("enablePatch", () => {
    it("should send save message to background script", async () => {
        const sendMessageSpy = vi.spyOn(fakeBrowser.runtime, "sendMessage");

        await SettingsManager.enablePatch("test-patch");

        expect(sendMessageSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: expect.objectContaining({
                    key: "patch_enabled_test-patch",
                    value: true,
                }),
                type: "SCHEDULE_WRITE",
            }),
        );
    });
});

describe("disablePatch", () => {
    it("should send save message to background script", async () => {
        const sendMessageSpy = vi.spyOn(fakeBrowser.runtime, "sendMessage");

        await SettingsManager.disablePatch("test-patch");

        expect(sendMessageSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: expect.objectContaining({
                    key: "patch_enabled_test-patch",
                    value: false,
                }),
                type: "SCHEDULE_WRITE",
            }),
        );
    });
});

describe("togglePatch", () => {
    it("should toggle to enabled state", async () => {
        const sendMessageSpy = vi.spyOn(fakeBrowser.runtime, "sendMessage");

        await fakeBrowser.storage.sync.set({
            "patch_enabled_test-patch": false,
        });

        await SettingsManager.togglePatch("test-patch");

        expect(sendMessageSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: expect.objectContaining({
                    key: "patch_enabled_test-patch",
                    value: true,
                }),
                type: "SCHEDULE_WRITE",
            }),
        );
    });

    it("should toggle to disabled state", async () => {
        const sendMessageSpy = vi.spyOn(fakeBrowser.runtime, "sendMessage");

        await SettingsManager.togglePatch("test-patch");

        expect(sendMessageSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                payload: expect.objectContaining({
                    key: "patch_enabled_test-patch",
                    value: false,
                }),
                type: "SCHEDULE_WRITE",
            }),
        );
    });
});

describe("getPatchSettings", () => {
    it("should join default and stored values", async () => {
        const patchMeta: Meta = {
            description: "",
            id: "test-patch",
            matches: [],
            name: "",
            settings: [
                {
                    defaultValue: "#ff0000",
                    description: "",
                    id: "color",
                    name: "",
                    type: "color",
                },
                {
                    defaultValue: 10,
                    description: "",
                    id: "size",
                    name: "",
                    type: "number",
                },
            ],
        };

        await fakeBrowser.storage.sync.set({
            "patch_settings_test-patch": { size: 20 },
        });

        const settings = await SettingsManager.getPatchSettings(patchMeta);
        expect(settings.color).toBe("#ff0000");
        expect(settings.size).toBe(20);
    });

    it("should return empty object when patch has no settings defined", async () => {
        const patchMeta: Meta = {
            description: "",
            id: "test-patch",
            matches: [],
            name: "",
        };

        const settings = await SettingsManager.getPatchSettings(patchMeta);
        expect(settings).toEqual({});
    });
});

describe("savePatchSetting", () => {
    it("should merge with existing settings", async () => {
        const sendMessageSpy = vi.spyOn(fakeBrowser.runtime, "sendMessage");
        await fakeBrowser.storage.sync.set({
            "patch_settings_test-patch": { color: "#ff0000", size: 10 },
        });

        await SettingsManager.savePatchSetting("test-patch", "size", 20);

        expect(sendMessageSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: expect.objectContaining({
                    value: { color: "#ff0000", size: 20 },
                }),
            }),
        );
    });
});
