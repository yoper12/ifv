<script lang="ts">
    import type { Meta } from "@/types/Meta";
    import { onMount } from "svelte";
    import PatchSettings from "./PatchSettings.svelte";

    let {
        meta,
        isEnabled,
        toggle,
    }: {
        meta: Meta;
        isEnabled: boolean;
        toggle: (next: boolean) => Promise<void>;
    } = $props();

    let isLoaded = $state(false);
    let showSettings = $state(false);
    function toggleSettingsVisibility() {
        showSettings = !showSettings;
    }

    onMount(async () => {
        isLoaded = true;
    });
</script>

{#if isLoaded}
    <div class="patch-item">
        <label class:is-enabled={isEnabled}>
            <div style="flex: 1;">
                <p class="title">{meta.name}</p>
                <p class="desc">{meta.description}</p>
            </div>
            {#if meta.deviceTypes?.length === 1 && meta.deviceTypes.includes("mobile")}
                <img
                    src="/assets/icons/mobile.svg"
                    alt="This patch is for mobile only"
                    title="This patch is for mobile only"
                />
            {/if}
            {#if meta.deviceTypes?.length === 1 && meta.deviceTypes.includes("desktop")}
                <img
                    src="/assets/icons/desktop.svg"
                    alt="This patch is for desktop only"
                    title="This patch is for desktop only"
                />
            {/if}
            <div class="toggle-wrapper">
                <input
                    id="toggle-{meta.id}"
                    class="toggle-input"
                    type="checkbox"
                    checked={isEnabled}
                    onchange={() => toggle(!isEnabled)}
                />
                <div class="toggle-switch"></div>
            </div>
        </label>
        {#if !!meta.settings?.length}
            <button
                id="settings-{meta.id}"
                class="setting-button"
                class:open={showSettings && isEnabled}
                disabled={!isEnabled}
                onclick={toggleSettingsVisibility}
            >
                <img
                    src="/assets/icons/chevron_right.svg"
                    alt="{meta.name}'s settings"
                    title="{meta.name}'s settings"
                    height="30"
                />
            </button>
        {/if}
    </div>
    {#if showSettings && isEnabled}
        <PatchSettings {meta} />
    {/if}
{/if}

<style>
    .patch-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;

        &::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 0;
            height: 100%;
            background-color: #27272a;
        }
    }

    label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 2px 0;
        padding: 10px;
        border-radius: 7px;
        background: #27272a;
        cursor: pointer;
        flex: 1;
        border: 1px solid #38383b;
        position: relative;
        transition:
            background-color 0.3s ease,
            border-color 0.3s ease,
            box-shadow 0.3s ease;
    }

    label > * {
        position: relative;
        z-index: 2;
    }

    label.is-enabled {
        background: #2c2a25;
        border-color: #da9f0030;
    }

    label:hover {
        background: #323235;
        border-color: #da9f0040;
        box-shadow: 0 4px 12px rgba(218, 159, 0, 0.05);
    }

    label::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(
            ellipse at 50% 120%,
            rgba(218, 159, 0, 0.15) 0%,
            transparent 60%
        );
        opacity: 0;
        transition: opacity 400ms ease;
        z-index: 0;
    }

    label:hover::after {
        opacity: 1;
        animation: glow 2000ms infinite alternate ease-in-out;
    }

    @keyframes glow {
        0% {
            opacity: 0.5;
        }
        100% {
            opacity: 1;
        }
    }

    label .desc {
        margin: 5px 0 0 0;
        font-size: 14px;
        color: #a1a1aa;
        line-height: 16px;
    }

    label .title {
        font-size: 15px;
        color: #f4f4f5;
        line-height: 18px;
        font-weight: 600;
        margin: 0;
    }

    .setting-button {
        background: transparent;
        border: none;
        padding: 0;
        cursor: pointer;
        margin-right: -9px;

        img {
            transition: transform 0.2s;
        }
    }

    .setting-button:not(:disabled):hover img {
        transform: rotate(15deg);
    }

    .setting-button:not(:disabled).open img {
        transform: rotate(90deg);
    }

    .setting-button:not(:disabled).open:hover img {
        transform: rotate(75deg);
    }

    .setting-button:disabled {
        cursor: auto;
        opacity: 0.5;
    }

    /* https://uiverse.io/ClawHack1/itchy-bobcat-18 */

    .toggle-wrapper {
        margin-left: 10px;
        position: relative;
        display: inline-block;
        width: 40px;
        height: 24px;
    }

    .toggle-wrapper .toggle-switch {
        position: absolute;
        top: 0;
        left: 0;
        width: 40px;
        height: 24px;
        background-color: #52525b;
        border-radius: 34px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .toggle-wrapper .toggle-switch::before {
        content: "";
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        top: 2px;
        left: 2px;
        background-color: #fff;
        box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.3);
        transition: transform 0.3s;
    }

    .toggle-wrapper .toggle-input:checked + .toggle-switch::before {
        transform: translateX(16px);
    }

    .toggle-wrapper .toggle-input:checked + .toggle-switch {
        background-color: #da9f00;
    }

    .toggle-wrapper .toggle-input:checked + .toggle-switch::before {
        transform: translateX(16px);
    }
</style>
