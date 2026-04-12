import { waitForRender } from "../apis/waitForElement.js";
import { generateSettingsList } from "./generateSettingsList.js";

const backIconUrl =
    "https://raw.githubusercontent.com/banocean/ifv/new-navbar/assets/icons/keyboard_backspace_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg";
const settingsIconUrl =
    "https://raw.githubusercontent.com/banocean/ifv/refs/heads/main/assets/icons/settings.svg";

async function addMobileSettings() {
    const settingsButton = document.createElement("div");
    settingsButton.innerHTML = `<div class="icon" style="content: url(&quot;${settingsIconUrl}&quot;);"></div><span class="name">Ustawienia ifv</span>`;
    settingsButton.addEventListener("click", async () => {
        const settingsModal = document.createElement("div");
        settingsModal.classList.add("settings-popup", "list-modal");
        settingsModal.innerHTML = `<div><img src='${backIconUrl}'><h1>Ustawienia IFV</h1></div><div></div>`;
        settingsModal.querySelector("img").addEventListener("click", () => {
            settingsModal.remove();
        });
        const settingsList = await generateSettingsList();
        settingsModal.querySelector("div:last-of-type").append(settingsList);
        settingsModal
            .querySelector("div:last-of-type")
            .classList.add("ifv-patches-mobile");
        document.body.append(settingsModal);
    });

    await waitForRender(
        () => document.querySelectorAll(".more-popup.list-modal div")[1],
    );
    document
        .querySelectorAll(".more-popup.list-modal div")[1]
        .append(settingsButton);
}

globalThis.appendModule({
    doesRunHere: () =>
        ["dziennik-uczen.vulcan.net.pl", "uczen.eduvulcan.pl"].includes(
            globalThis.location.hostname,
        ) && window.innerWidth < 1024,
    onlyOnReloads: true,
    run: addMobileSettings,
});
