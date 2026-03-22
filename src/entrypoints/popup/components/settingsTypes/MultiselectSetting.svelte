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
        setting: Extract<Setting, { type: "multiselect" }>;
    } = $props();
</script>

<div class="setting-multiselect">
    {#each setting.options as option (option.value)}
        <div class="checkbox-item">
            <input
                type="checkbox"
                class="setting-multiselect-checkbox"
                value={option.value}
                id={`${meta.name}-${setting.id}-${option.value}`}
                checked={(
                    currentSettings[setting.id] as string[] | undefined
                )?.includes(option.value) ?? false}
                onchange={(e) => {
                    const checked = (e.target as HTMLInputElement).checked;
                    const current =
                        (currentSettings[setting.id] as string[]) ?? [];
                    currentSettings[setting.id] =
                        checked ?
                            [...current, option.value]
                        :   current.filter((v) => v !== option.value);
                    SettingsManager.savePatchSetting(
                        meta.id,
                        setting.id,
                        currentSettings[setting.id],
                    );
                }}
            />
            <label for={`${meta.name}-${setting.id}-${option.value}`}>
                {option.label}
            </label>
        </div>
    {/each}
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

    .setting-multiselect .checkbox-item {
        margin-bottom: 5px;
    }
</style>
