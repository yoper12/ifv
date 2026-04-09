<script lang="ts">
    import type { Meta } from "@/types/Meta";
    import type { Setting } from "@/types/Setting.js";
    import { savePatchSetting } from "@/utils/SettingsManager.js";

    let {
        currentSettings,
        meta,
        setting,
    }: {
        currentSettings: Record<
            string,
            Extract<Setting, { type: "number" }>["defaultValue"]
        >;
        meta: Meta;
        setting: Extract<Setting, { type: "number" }>;
    } = $props();
</script>

<input
    type="number"
    class="setting-number"
    value={currentSettings[setting.id]}
    step={setting.step || 1}
    placeholder={String(setting.defaultValue)}
    onchange={(e) => {
        let value = (e.target as HTMLInputElement).valueAsNumber;
        value = isNaN(value) ? (setting.defaultValue as number) : value;
        currentSettings[setting.id] = value;
        savePatchSetting(meta.id, setting.id, value);
    }}
/>

<style>
    .setting-number {
        background-color: #27272a;
        border: 1px solid #38383b;
        border-radius: 8px;
        padding: 10px 12px;
        font-size: 14px;
        color: #dfdfdd;
        box-sizing: border-box;
        transition:
            border-color 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        margin-top: 5px;
        width: 100%;
    }
    .setting-number:focus {
        border-color: #da9f0070;
        box-shadow: 0 0 0 2px #da9f0040;
        outline: none;
    }
    .setting-number:hover {
        box-shadow: 0 0 0 2px #da9f0040;
    }
</style>
