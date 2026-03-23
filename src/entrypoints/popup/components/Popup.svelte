<script lang="ts">
    import { browser } from "#imports";
    import type { Patch } from "@/types/Patch";
    import { SettingsManager } from "@/utils/SettingsManager.js";
    import { onMount } from "svelte";
    import PatchItem from "./PatchItem.svelte";

    const patches = import.meta.glob<Patch>("@/patches/**/index.ts", { eager: true, import: "default" });
    const patchesMetas = Object.values(patches).map((p) => p.meta);

    let searchQuery = $state("");
    let category = $state<"desktop" | "mobile" | "all">("all");
    let patchEnabledById = $state<Record<string, boolean>>({});

    async function loadPatchStates() {
        const entries = await Promise.all(
            patchesMetas.map(
                async (patch) => [patch.id, await SettingsManager.isPatchEnabled(patch.id)] as const,
            ),
        );
        patchEnabledById = Object.fromEntries(entries);
    }

    let isEverythingEnabled = $derived(patchesMetas.every((p) => patchEnabledById[p.id] ?? true));

    onMount(async () => {
        const savedCategory = (await browser.storage.local.get("category")).category;

        category =
            savedCategory === "desktop" || savedCategory === "mobile" || savedCategory === "all" ?
                savedCategory
            : document.body.classList.contains("mobile") ? "mobile"
            : "desktop";

        await loadPatchStates();
    });

    let filteredPatches = $derived(
        patchesMetas
            .filter((patch) => {
                const matchesSearch =
                    patch.name.toLowerCase().includes(searchQuery.toLowerCase())
                    || patch.description.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCategory =
                    category === "all"
                    || (patch.deviceTypes ?
                        patch.deviceTypes.includes(category as "desktop" | "mobile")
                    :   true);

                return matchesSearch && matchesCategory;
            })
            .sort((a, b) => a.name.localeCompare(b.name, "pl")),
    );

    async function toggleAll() {
        const next = !isEverythingEnabled;
        const nextStates: Record<string, boolean> = {};
        for (const patch of patchesMetas) {
            nextStates[patch.id] = next;
        }
        await Promise.all(
            patchesMetas.map((p) =>
                next ? SettingsManager.enablePatch(p.id) : SettingsManager.disablePatch(p.id),
            ),
        );
        patchEnabledById = nextStates;
    }

    $effect(() => {
        browser.storage.local.set({ category });
    });
</script>

<main>
    <header>
        <img src="/icons/128.png" alt="Hephaestus logo" />
        <h1>Hephaestus</h1>
    </header>
    <h2>
        Changing any option below will refresh opened pages.<br />
        <span class="disclamer">
            We are not affiliated, associated, authorized, endorsed by, or in any way officially connected
            with ██████ ███ █ ████, or any of its subsidiaries or its affiliates.
        </span>
    </h2>

    <div class="filter">
        <div>
            <img src="/assets/icons/search.svg" alt="Search" />
            <!-- svelte-ignore a11y_autofocus -->
            <input placeholder="Search" type="text" autofocus bind:value={searchQuery} />
            <button id="clear" onclick={() => (searchQuery = "")}>
                <img src="/assets/icons/clear.svg" alt="Clear input" />
            </button>
        </div>
        <button class="toggle-all" onclick={toggleAll}>
            {isEverythingEnabled ? "Disable All" : "Enable All"}
        </button>
    </div>

    <select class="categories" bind:value={category}>
        <option value="all">All</option>
        <option value="desktop">Desktop</option>
        <option value="mobile">Mobile</option>
    </select>

    <div class="options">
        {#each filteredPatches as patch (patch.id)}
            {#if patchEnabledById[patch.id] !== undefined}
                <PatchItem
                    meta={patch}
                    isEnabled={patchEnabledById[patch.id] ?? true}
                    toggle={async (nextState) => {
                        patchEnabledById = { ...patchEnabledById, [patch.id]: nextState };
                        if (nextState) await SettingsManager.enablePatch(patch.id);
                        else await SettingsManager.disablePatch(patch.id);
                    }}
                />
            {/if}
        {/each}
    </div>

    <footer>
        <button
            class="clear-data"
            onclick={async () => {
                if (
                    confirm(
                        "Are you sure you want to clear all extension data? This action cannot be undone.",
                    )
                ) {
                    await Promise.all([browser.storage.sync.clear(), browser.storage.local.clear()]);
                    window.location.reload();
                }
            }}>Clear extension storage</button
        >
        <div class="links">
            <a href="https://github.com/banocean/ifv" target="_blank">
                <img src="/github.svg" alt="Github" width="25" />
            </a>
            <a href="https://ifv.banocean.com/discord" style="height: 19px" target="_blank">
                <img src="/discord.svg" alt="Discord" width="25" />
            </a>
        </div>
    </footer>
</main>

<style>
    .disclamer {
        font-size: 10px;
        color: #9f9f9f;
    }
    .filter > div {
        box-sizing: border-box;
        width: 100%;
        color: white;
        border: 1px solid #38383b;
        border-radius: 8px;
        background: #27272a;
        padding-left: 5px;
        display: flex;
        align-items: center;
        transition:
            border-color 0.2s ease-in-out,
            box-shadow 0.2s ease-in-out;
    }

    .filter > div > input::placeholder {
        color: #8e8e8e;
    }

    .filter > div > input {
        box-sizing: border-box;
        width: 100%;
        color: white;
        border: none;
        background: transparent;
        padding-block: 7px;
    }

    .filter > div:focus-within {
        border-color: #da9f0070;
        box-shadow: 0 0 0 2px #da9f0040;
    }

    .filter > div:hover {
        box-shadow: 0 0 0 2px #da9f0040;
    }

    .filter > div > input:focus,
    .filter > div > input:hover {
        outline: none;
    }

    .toggle-all {
        box-sizing: border-box;
        width: min-content;
        height: 100%;
        padding: 5px 10px;
        background: #27272a;
        color: white;
        margin-left: 5px;
        border: 1px solid #38383b;
        cursor: pointer;
        border-radius: 8px;
        white-space: nowrap;
        transition:
            border-color 0.2s ease-in-out,
            box-shadow 0.2s ease-in-out;
    }

    .toggle-all:active {
        border-color: #da9f0070;
        box-shadow: 0 0 0 2px #da9f0040;
        outline: none;
    }

    .toggle-all:hover {
        box-shadow: 0 0 0 2px #da9f0040;
    }

    .filter {
        width: 100%;
        height: 30px;
        display: flex;
        align-items: stretch;
        margin-bottom: 5px;
    }

    .categories {
        box-sizing: border-box;
        width: 100%;
        height: 30px;
        margin-bottom: 15px;
        background: #27272a;
        color: white;
        border: 1px solid #38383b;
        border-radius: 8px;
        text-align: center;
        transition:
            border-color 0.2s ease-in-out,
            box-shadow 0.2s ease-in-out;
    }

    .categories:focus {
        border-color: #da9f0070;
        box-shadow: 0 0 0 2px #da9f0040;
        outline: none;
    }

    .categories:hover {
        box-shadow: 0 0 0 2px #da9f0040;
    }

    #clear {
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        padding-block: 6px;
        padding-left: 2px;
        padding-right: 5px;
        border-radius: 50%;
    }

    header {
        display: flex;
        align-items: center;
        justify-content: center;

        img {
            height: 28px;
            vertical-align: middle;
            margin-right: 10px;
        }
    }

    h1 {
        margin: 5px 0;
        color: #fafafa;
    }

    h2 {
        color: #d4d4d8;
        font-size: small;
        font-weight: normal;
        text-align: center;
    }

    .options {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .links {
        padding-top: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
    }

    .links a {
        color: #a1a1aa;
    }

    .clear-data {
        background: unset;
        border: unset;
        color: #505050;
        cursor: pointer;
        text-decoration: underline;
        display: block;
        width: 100%;
        text-align: center;
        margin-top: 15px;
    }
</style>
