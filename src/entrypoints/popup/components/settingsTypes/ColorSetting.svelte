<script lang="ts">
    import type { Meta } from "@/types/Meta";
    import type { Setting } from "@/types/Setting.js";
    import { SettingsManager } from "@/utils/SettingsManager.js";

    let {
        currentSettings,
        meta,
        setting,
    }: {
        currentSettings: Record<string, Extract<Setting, { type: "color" }>["defaultValue"]>;
        meta: Meta;
        setting: Extract<Setting, { type: "color" }>;
    } = $props();

    const hexColor = /^#[0-9a-fA-F]{6}$/;
</script>

<div class="setting-color">
    <input
        type="color"
        value={currentSettings[setting.id]}
        oninput={(e) => {
            const value = (e.target as HTMLInputElement).value;
            currentSettings[setting.id] = value;
            SettingsManager.savePatchSetting(meta.id, setting.id, value);
        }}
    />
    <input
        type="text"
        value={currentSettings[setting.id]}
        placeholder={setting.defaultValue.toString()}
        maxlength="7"
        oninput={(e) => {
            const value = (e.target as HTMLInputElement).value;
            if (!hexColor.test(value)) return;
            currentSettings[setting.id] = value;
            SettingsManager.savePatchSetting(meta.id, setting.id, value);
        }}
    />
</div>

<style>
    .setting-color {
        display: flex;
        align-items: center;
        gap: 5px;
        background-color: #27272a;
        border: 1px solid #38383b;
        border-radius: 8px;
        font-size: 14px;
        color: #dfdfdd;
        box-sizing: border-box;
        transition:
            border-color 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        margin-top: 5px;

        input[type="color"] {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            margin-left: 4px;
            width: auto;
            height: 28px;
            aspect-ratio: 1/1;
            padding: 0;
            border: none;
            background: none;
            cursor: pointer;
        }
        input[type="color"]::-webkit-color-swatch-wrapper {
            padding: 0;
        }
        input[type="color"]::-webkit-color-swatch {
            border-radius: 4px;
        }
        input[type="color"]::-moz-color-swatch {
            border-radius: 4px;
        }
        input[type="text"] {
            background: none;
            border: none;
            color: #dfdfdd;
            font-size: 14px;
            width: 100%;
            height: 34px;

            &:focus {
                outline: none;
            }
        }
    }
    .setting-color:focus-within {
        border-color: #da9f0070;
        box-shadow: 0 0 0 2px #da9f0040;
        outline: none;
    }
    .setting-color:hover {
        box-shadow: 0 0 0 2px #da9f0040;
    }
</style>
