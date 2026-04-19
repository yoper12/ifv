import { waitForRender } from "./waitForElement.js";

let asideReads = 0;

export function clickOnAside(selector) {
    executeActionOnAside((aside) => aside.querySelector(selector)?.click());
}

export async function executeActionOnAside(callback) {
    const aside = await getAsideElement();
    await callback(aside);
    if (!document.querySelector("aside") && globalThis.asideMode === "hidden") {
        document.querySelector(".header__hamburger__icon button").click();
    } else asideReads--;
}

export async function getFromAside(callback) {
    const aside = await getAsideElement();
    const result = await callback(aside);
    closeAside();
    return result;
}

function closeAside() {
    const closeButton = document.querySelector(".aside-button--close");
    if (globalThis.asideMode !== "hidden") {
        asideReads--;
        if (closeButton && asideReads <= 0) closeButton.click();
        document.querySelector("aside")?.classList?.remove("hideAside");
    }
}

async function getAsideElement() {
    if (globalThis.asideMode === "hidden" && document.querySelector("aside")) {
        return document.querySelector("aside");
    }

    asideReads++;
    if (!document.querySelector("aside"))
        document.querySelector(".header__hamburger__icon button").click();
    await waitForRender(() => document.querySelector("aside"));
    document.querySelector("aside").classList.add("hideAside");
    return document.querySelector("aside");
}
