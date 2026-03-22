<script lang="ts">
    import type { Meta } from "@/types/Meta";
    import type { Setting } from "@/types/Setting.js";
    import { SettingsManager } from "@/utils/SettingsManager.js";

    let {
        currentSettings,
        meta,
        setting,
    }: {
        currentSettings: Record<string, Setting["defaultValue"]>;
        meta: Meta;
        setting: Extract<Setting, { type: "text" }>;
    } = $props();
</script>

<input
    type="text"
    class="setting-text"
    value={currentSettings[setting.id]}
    placeholder={setting.defaultValue}
    onchange={(e) => {
        const value = (e.target as HTMLInputElement).value;
        currentSettings[setting.id] = value;
        SettingsManager.savePatchSetting(meta.id, setting.id, value);
    }}
/>

<style>
    .setting-text {
        background-color: #27272a;
        border: 1px solid #38383b;
        border-radius: 8px;
        padding: 10px 12px;
        font-size: 14px;
        color: #f4f4f5;
        box-sizing: border-box;
        transition:
            border-color 0.2s ease-in-out,
            box-shadow 0.2s ease-in-out;
        margin-top: 5px;
        width: 100%;
    }
    .setting-text:focus {
        border-color: #da9f00;
        box-shadow: 0 0 0 2px #da9f0040;
        outline: none;
    }
    .setting-text:hover {
        box-shadow: 0 0 0 2px #da9f0040;
    }
</style>
