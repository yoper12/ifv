<script lang="ts">
    import type { Meta } from "@/types/Meta";
    import type { Setting } from "@/types/Setting.js";
    import { SettingsManager } from "@/utils/SettingsManager.js";

    let {
        currentSettings,
        meta,
        setting,
    }: {
        currentSettings: Record<
            string,
            Extract<Setting, { type: "switch" }>["defaultValue"]
        >;
        meta: Meta;
        setting: Extract<Setting, { type: "switch" }>;
    } = $props();

    let isMoving = $state(false);

    let translateX = $state(0);
    let indicatorWidth = $state(0);

    let optionOn: HTMLSpanElement | null = $state(null);
    let optionOff: HTMLSpanElement | null = $state(null);

    function updateIndicator() {
        const isChecked = currentSettings[setting.id];
        const activeElement = isChecked ? optionOn : optionOff;
        const container = activeElement?.parentElement;

        if (activeElement && container) {
            const rect = activeElement.getBoundingClientRect();
            const parentRect = container.getBoundingClientRect();
            translateX = rect.left - parentRect.left - 1;
            indicatorWidth = rect.width;
        }
    }

    $effect(() => {
        updateIndicator();
    });

    function toggleSwitch() {
        const isChecked = currentSettings[setting.id];
        const newCheckedState = !isChecked;

        isMoving = true;
        setTimeout(() => {
            isMoving = false;
        }, 200);

        currentSettings[setting.id] = newCheckedState;
        updateIndicator();

        SettingsManager.savePatchSetting(meta.id, setting.id, newCheckedState);
    }
</script>

<div class="setting-boolean">
    <button
        type="button"
        role="switch"
        aria-checked={currentSettings[setting.id]}
        class="switch-button"
        class:moving={isMoving}
        style="--x: {translateX}px; --w: {indicatorWidth}px;"
        onclick={toggleSwitch}
    >
        <div class="indicator"></div>
        <span bind:this={optionOn}>On</span>
        <span bind:this={optionOff}>Off</span>
    </button>
</div>

<style>
    .setting-boolean {
        margin-top: 6px;
    }

    .switch-button {
        all: unset;
        background: #27272a;
        position: relative;
        overflow: hidden;
        border: solid 1px #38383b;
        border-radius: 8px;
        padding: 3px;
        height: 38px;
        display: inline-grid;
        grid-template-columns: 1fr 1fr;
        cursor: pointer;
        user-select: none;
        box-sizing: border-box;
        transition:
            border-color 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .indicator {
        position: absolute;
        top: 3px;
        bottom: 3px;
        left: 0;
        width: var(--w);
        background: #da9f0040;
        box-sizing: border-box;
        border: 1px solid #da9f0040;
        border-radius: 6px;
        z-index: 1;
        transform-origin: center;
        transform: translateX(var(--x));
        transition:
            transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
            width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
            border-radius 0.2s ease-out;
    }

    .switch-button.moving .indicator {
        transform: translateX(var(--x)) scaleX(1.1) scaleY(0.9);
        border-radius: 8px;
    }

    .switch-button:active .indicator {
        transform: translateX(var(--x)) scaleX(1.03) scaleY(0.96);
        border-radius: 5px;
    }

    .switch-button span {
        padding: 0 14px;
        font-size: 14px;
        font-weight: 500;
        color: #888885;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
        position: relative;
        transition: color 0.3s ease;
    }

    .switch-button[aria-checked="true"] span:first-of-type,
    .switch-button[aria-checked="false"] span:last-of-type {
        color: #dfdfdd;
    }

    .switch-button:focus-visible {
        border-color: #da9f0070;
        box-shadow: 0 0 0 2px #da9f0040;
        outline: none;
    }
    .switch-button:hover {
        box-shadow: 0 0 0 2px #da9f0040;
    }
</style>
