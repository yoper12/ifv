import { waitForRender } from "./apis/waitForElement.js";

async function fixGoingBack() {
    const observer = new MutationObserver(mutationHandler);
    observer.observe(document.body, { childList: true });
}

async function mutationHandler(mutationList) {
    for (let index = 0; index < mutationList.length; index++) {
        const modals = document.querySelectorAll(".MuiDrawer-modal");
        const modal = modals.at(-1) || undefined;

        if (modal && modal.dataset.hasListener !== "true") {
            history.pushState(
                { ...history.state, details: true },
                "",
                `${location.pathname}#`,
            );
            modal.dataset.hasListener = "true";

            for (const element of modals) {
                if (element === modal) continue;
                delete element.dataset.hasListener;
            }

            await waitForRender(() =>
                modal.querySelector(".modal-button--close"),
            );
            const closeButton = modal.querySelector(".modal-button--close");

            addEventListener("popstate", () => popstateHandler(closeButton), {
                once: true,
            });

            closeButton?.addEventListener("click", () => {
                if (history.state?.details) {
                    history.back();
                }
            });
        }
    }
}

function popstateHandler(element) {
    if (
        element?.closest("div[role=presentation].MuiDrawer-modal")?.dataset
            .hasListener !== "true"
    )
        return;
    element?.click();
}

globalThis.appendModule({
    doesRunHere: () =>
        [
            "dziennik-uczen.vulcan.net.pl",
            "dziennik-wiadomosci.vulcan.net.pl",
            "eduvulcan.pl",
            "uczen.eduvulcan.pl",
            "wiadomosci.eduvulcan.pl",
        ].includes(globalThis.location.hostname)
        && typeof InstallTrigger !== "undefined",
    isLoaded: () => true,
    onlyOnReloads: true,
    run: fixGoingBack,
});
