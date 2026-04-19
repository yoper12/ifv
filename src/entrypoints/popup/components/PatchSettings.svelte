<script lang="ts">
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";

    import type { Meta } from "@/types/Meta";
    import type { Setting } from "@/types/Setting.js";

    import { getPatchSettings } from "@/utils/SettingsManager.js";

    import ColorSetting from "./settingsTypes/ColorSetting.svelte";
    import MultiselectSetting from "./settingsTypes/MultiselectSetting.svelte";
    import NumberSetting from "./settingsTypes/NumberSetting.svelte";
    import SelectSetting from "./settingsTypes/SelectSetting.svelte";
    import SwitchSetting from "./settingsTypes/SwitchSetting.svelte";
    import TextSetting from "./settingsTypes/TextSetting.svelte";

    let { meta }: { meta: Meta } = $props();

    let currentSettings = $state<Record<string, Setting["defaultValue"]>>({});

    onMount(async () => {
        currentSettings = await getPatchSettings(meta);
    });
</script>

<div class="patch-settings" transition:slide={{ duration: 200 }}>
    {#each meta.settings ?? [] as setting (setting.id)}
        <div class="setting-item">
            <div class="setting-header">
                <span class="setting-name">{setting.name}</span>
                <span class="setting-description">{setting.description}</span>
            </div>
            <div class="setting-input">
                {#if setting.type === "switch"}
                    <SwitchSetting
                        currentSettings={currentSettings as Record<
                            string,
                            boolean
                        >}
                        {meta}
                        {setting}
                    />
                {/if}
                {#if setting.type === "number"}
                    <NumberSetting
                        currentSettings={currentSettings as Record<
                            string,
                            number
                        >}
                        {meta}
                        {setting}
                    />
                {/if}
                {#if setting.type === "text"}
                    <TextSetting
                        currentSettings={currentSettings as Record<
                            string,
                            string
                        >}
                        {meta}
                        {setting}
                    />
                {/if}
                {#if setting.type === "color"}
                    <ColorSetting
                        currentSettings={currentSettings as Record<
                            string,
                            string
                        >}
                        {meta}
                        {setting}
                    />
                {/if}
                {#if setting.type === "select"}
                    <SelectSetting
                        currentSettings={currentSettings as Record<
                            string,
                            string
                        >}
                        {meta}
                        {setting}
                    />
                {/if}
                {#if setting.type === "multiselect"}
                    <MultiselectSetting
                        currentSettings={currentSettings as Record<
                            string,
                            string[]
                        >}
                        {meta}
                        {setting}
                    />
                {/if}
            </div>
        </div>
    {/each}
</div>

<style>
    .patch-settings {
        margin-left: 8px;
        padding-left: 10px;
        border-left: 1px solid #da9f0080;
    }
    .setting-item {
        margin-bottom: 20px;

        &:last-child {
            margin-bottom: 0;
        }
    }
    .setting-header {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    .setting-name {
        font-size: 13px;
        font-weight: 600;
    }
    .setting-description {
        color: #d2d2d3;
    }
</style>
