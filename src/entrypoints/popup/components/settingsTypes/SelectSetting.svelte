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
        setting: Extract<Setting, { type: "select" }>;
    } = $props();
</script>

<select
    class="setting-select"
    onchange={(e) => {
        const value = (e.target as HTMLSelectElement).value;
        currentSettings[setting.id] = value;
        SettingsManager.savePatchSetting(meta.id, setting.id, value);
    }}
>
    {#each setting.options as option (option.value)}
        <option
            value={option.value}
            selected={option.value === currentSettings[setting.id]}
            >{option.label}</option
        >
    {/each}
</select>

<style>
    .setting-select {
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
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23f4f4f5'%3E%3Cpath d='M7 10l5 5 5-5H7z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;
        background-size: 18px;
        padding-right: 36px;
    }
    .setting-select:focus {
        border-color: #da9f00;
        box-shadow: 0 0 0 2px #da9f0040;
        outline: none;
    }
    .setting-select:hover {
        box-shadow: 0 0 0 2px #da9f0040;
    }
</style>
