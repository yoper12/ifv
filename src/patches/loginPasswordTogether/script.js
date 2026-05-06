function fixLoginPage() {
    setAutocomplete();
    hideBtNext();
    if (globalThis.location.hostname === "eduvulcan.pl") moveEVLinks();
    swapLoginInput();
}

function hideBtNext() {
    document.querySelector("#btNext").remove();
}

function moveEVLinks() {
    const linksElement = document.querySelector(
        "#wizard1 > div > .flex-row:has(a)",
    );
    document.querySelector("#wizard2").append(linksElement);
}

function setAutocomplete() {
    document.querySelector("#Login")?.setAttribute("autocomplete", "username");
    document
        .querySelector("#Haslo")
        ?.setAttribute("autocomplete", "current-password");
}

function swapLoginInput() {
    const wizard2 = document.querySelector("#wizard2");
    wizard2.parentElement.insertBefore(
        document.querySelector("#wizard1"),
        wizard2,
    );
    // Force firefox to check inputs again
    const centerBox = document.querySelector(".center-box");
    // eslint-disable-next-line no-self-assign
    centerBox.innerHTML = centerBox.innerHTML;
}

globalThis.appendModule({
    doesRunHere: () =>
        ["dziennik-logowanie.vulcan.net.pl", "eduvulcan.pl"].includes(
            globalThis.location.hostname,
        ),
    isLoaded: () => document.querySelector("#Haslo"),
    onlyOnReloads: true,
    run: fixLoginPage,
});
