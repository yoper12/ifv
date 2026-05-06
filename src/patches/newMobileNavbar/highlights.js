const studentRegex = /^(dziennik-)?(uczen).*/;

export function setHighlights() {
    let index;
    if (document.querySelector(".more-popup").style.display === "block")
        index = 4;
    else if (globalThis.location.pathname.endsWith("tablica")) index = 0;
    else if (globalThis.location.pathname.endsWith("oceny")) index = 1;
    else if (globalThis.location.pathname.endsWith("frekwencja")) index = 2;
    else if (globalThis.location.pathname.endsWith("planZajec")) index = 3;

    const buttons = [
        ...document.querySelector(".bottom-navigation-bar").children,
    ];
    for (const [index_, button] of buttons.entries()) {
        const img = button.querySelector("div > img");
        img.classList.toggle("highlight", index === index_);
    }
}

globalThis.appendModule({
    doesRunHere: () => globalThis.location.hostname.match(studentRegex),
    isLoaded: () =>
        document.querySelector(".bottom-navigation-bar")?.children?.length,
    onlyOnReloads: false,
    run: setHighlights,
});
