import { getSetting, saveSetting } from "../apis/settings.js";
import { markTextInElement, removeMarks } from "./markers.js";
import { settingRenderers } from "./settingRenderers.js";

const searchIconUrl =
    "https://raw.githubusercontent.com/banocean/ifv/refs/heads/main/assets/icons/search.svg";
const clearIconUrl =
    "https://raw.githubusercontent.com/banocean/ifv/refs/heads/main/assets/icons/clear.svg";

export async function generateSettingsList() {
    const patches = JSON.parse(sessionStorage.getItem("IFV_PATCHES")) || [];
    const config = JSON.parse(sessionStorage.getItem("ifv_options")) || {};
    const patchesSettingsDiv = document.createElement("div");
    patchesSettingsDiv.className = "patches-list";

    patchesSettingsDiv.innerHTML = `
        <div class="search-bar">
            <img src="${searchIconUrl}">
            <input placeholder="Search" type="text" autofocus />
            <button id="clear">
                <img src="${clearIconUrl}">
            </button>
        </div>
        <div class="no-results-message">Nie znaleziono pasujących patchy 😿</div>
    `;

    setupSearchbar(patchesSettingsDiv);

    for (const patch of patches) {
        if (!patch.settings?.length) continue;
        if (config[patch.name] === false) continue;
        if (patch.devices === "mobile" && window.innerWidth >= 1024) continue;
        if (patch.devices === "desktop" && window.innerWidth < 1024) continue;

        const patchDiv = document.createElement("div");
        patchDiv.className = "patch";
        patchDiv.innerHTML = `
            <div class="patch-header">
                <p class="patch-name">${patch.name}</p>
                <p class="patch-description">${patch.description}</p>
            </div>
            <div class="settings-list"></div>
        `;

        const settingsListDiv = patchDiv.querySelector(".settings-list");

        for (const setting of patch.settings) {
            const settingContainerDiv = document.createElement("div");
            settingContainerDiv.className = "setting";
            settingContainerDiv.innerHTML = `
                <div class="setting-header">
                    <span class="setting-name">${setting.name}</span>
                    <span class="separator">—</span>
                    <span class="setting-description">${setting.description}</span>
                </div>
            `;

            const settingInputDiv = document.createElement("div");
            settingInputDiv.className = "setting-input";

            const renderer = settingRenderers[setting.type];
            if (renderer) {
                const currentValue = getSetting(patch.name, setting.id);
                settingInputDiv.innerHTML = renderer(
                    setting,
                    patch.name,
                    currentValue,
                );
            }

            settingContainerDiv.append(settingInputDiv);
            settingsListDiv.append(settingContainerDiv);
        }
        patchesSettingsDiv.append(patchDiv);
    }

    addListenersToInputs(patchesSettingsDiv);
    addBttmButtons(patchesSettingsDiv, patches);

    return patchesSettingsDiv;
}

/**
 * Dodaje dolne przyciski.
 *
 * @param {Node} patchesSettingsDiv
 * @returns {void}
 */
function addBttmButtons(patchesSettingsDiv, patches) {
    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "buttons";
    buttonsDiv.innerHTML = `
        <button class="reset-button" title="spowoduje odświeżenie strony">Zresetuj do domyślnych</button>
        <button class="apply-button" title="spowoduje odświeżenie strony">Zastosuj ustawienia</button>
    `;
    patchesSettingsDiv.append(buttonsDiv);

    patchesSettingsDiv
        .querySelector(".apply-button")
        .addEventListener("click", () => globalThis.location.reload());
    patchesSettingsDiv
        .querySelector(".reset-button")
        .addEventListener("click", () => {
            for (const patch of patches) {
                if (!patch.settings?.length) continue;
                for (const setting of patch.settings) {
                    saveSetting(patch.name, setting.id, setting.default);
                }
            }
            globalThis.location.reload();
        });
}

/**
 * Dodaje listenery do inputów.
 *
 * @param {Node} patchesSettingsDiv
 * @returns {void}
 */
function addListenersToInputs(patchesSettingsDiv) {
    for (const toggle of patchesSettingsDiv.querySelectorAll(
        ".setting-boolean-toggle",
    )) {
        toggle.querySelector(".toggle-switch").addEventListener("click", () => {
            toggle.querySelector(".toggle-input").checked =
                !toggle.querySelector(".toggle-input").checked;
            saveSetting(
                toggle.querySelector(".toggle-input").dataset.patch,
                toggle.querySelector(".toggle-input").dataset.setting,
                toggle.querySelector(".toggle-input").checked,
            );
        });
    }

    for (const input of patchesSettingsDiv.querySelectorAll(
        ".setting-select, .setting-text, .setting-color, .setting-number",
    )) {
        input.addEventListener("change", () => {
            saveSetting(
                input.dataset.patch,
                input.dataset.setting,
                input.value,
            );
        });
    }

    for (const checkbox of patchesSettingsDiv.querySelectorAll(
        ".setting-multiselect-checkbox",
    )) {
        checkbox.addEventListener("change", () => {
            const patchName = checkbox.dataset.patch;
            const settingId = checkbox.dataset.setting;
            const selectedValues = Array.from(
                patchesSettingsDiv.querySelectorAll(
                    `.setting-multiselect-checkbox[data-patch='${patchName}'][data-setting='${settingId}']:checked`,
                ),
                (callback) => callback.value,
            );
            saveSetting(patchName, settingId, selectedValues);
        });
    }
}

/**
 * Ustawia funkcjonalność paska wyszukiwania.
 *
 * @param {Node} patchesSettingsDiv
 * @returns {void}
 */
function setupSearchbar(patchesSettingsDiv) {
    const searchInput = patchesSettingsDiv.querySelector(".search-bar > input");

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();
        const noResultsMessageDiv = patchesSettingsDiv.querySelector(
            ".no-results-message",
        );
        let visiblePatchesCount = 0;

        for (const patchDiv of patchesSettingsDiv.querySelectorAll(".patch")) {
            const patchNameElement = patchDiv.querySelector(".patch-name");
            const patchDescElement =
                patchDiv.querySelector(".patch-description");

            removeMarks(patchNameElement);
            removeMarks(patchDescElement);
            for (const settingDiv of patchDiv.querySelectorAll(".setting")) {
                removeMarks(settingDiv.querySelector(".setting-name"));
                removeMarks(settingDiv.querySelector(".setting-description"));
            }

            if (query === "") {
                patchDiv.style.display = "block";
                continue;
            }

            let combinedTextContent =
                patchNameElement.textContent.toLowerCase()
                + " "
                + patchDescElement.textContent.toLowerCase()
                + " ";

            for (const settingDiv of patchDiv.querySelectorAll(".setting")) {
                combinedTextContent +=
                    settingDiv
                        .querySelector(".setting-name")
                        .textContent.toLowerCase() + " ";
                combinedTextContent +=
                    settingDiv
                        .querySelector(".setting-description")
                        .textContent.toLowerCase() + " ";
            }

            if (combinedTextContent.includes(query)) {
                patchDiv.style.display = "block";
                visiblePatchesCount++;

                markTextInElement(patchNameElement, query);
                markTextInElement(patchDescElement, query);

                for (const settingDiv of patchDiv.querySelectorAll(
                    ".setting",
                )) {
                    markTextInElement(
                        settingDiv.querySelector(".setting-name"),
                        query,
                    );
                    markTextInElement(
                        settingDiv.querySelector(".setting-description"),
                        query,
                    );
                }
            } else {
                patchDiv.style.display = "none";
            }
        }

        if (query === "") {
            noResultsMessageDiv.style.display = "none";
        } else if (visiblePatchesCount === 0) {
            noResultsMessageDiv.style.display = "block";
        } else {
            noResultsMessageDiv.style.display = "none";
        }
    });

    const clearButton = patchesSettingsDiv.querySelector("#clear");
    clearButton.addEventListener("click", () => {
        searchInput.value = "";
        searchInput.dispatchEvent(new Event("input"));
    });
}
