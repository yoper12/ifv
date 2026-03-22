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
        setting: Extract<Setting, { type: "checkbox" }>;
    } = $props();
</script>

<div class="setting-boolean">
    <div class="checkbox-item">
        <input
            class="toggle-input"
            id={`${meta.name}-${setting.id}`}
            type="checkbox"
            checked={currentSettings[setting.id] as boolean}
            onchange={(e) => {
                const checked = (e.target as HTMLInputElement).checked;
                currentSettings[setting.id] = checked;
                SettingsManager.savePatchSetting(meta.id, setting.id, checked);
            }}
        />
        <label for={`${meta.name}-${setting.id}`}>
            {currentSettings[setting.id] ? "Enabled" : "Disabled"}
        </label>
    </div>
</div>

<style>
    .checkbox-item {
        display: flex;
        align-items: center;
        margin-top: 3px;
    }

    .checkbox-item input[type="checkbox"] {
        appearance: none;
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        background-color: #27272a;
        border: 1px solid #38383b;
        border-radius: 4px;
        cursor: pointer;
        position: relative;
        margin-right: 10px;
        transition:
            background-color 0.2s ease-in-out,
            border-color 0.2s ease-in-out;
    }

    .checkbox-item input[type="checkbox"]::before {
        content: "";
        position: absolute;
        left: 6px;
        top: 2px;
        width: 5px;
        height: 10px;
        border: solid #27272a;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
        transition: border-color 0.2s ease-in-out;
    }

    .checkbox-item input[type="checkbox"]:checked {
        background-color: #a87d00;
        border-color: #da9f00;

        &::before {
            border-color: #fff;
            border-width: 0 2px 2px 0;
        }
    }

    .checkbox-item label {
        font-size: 14px;
        color: #dfdfdd;
        cursor: pointer;
        user-select: none;
    }
</style>
