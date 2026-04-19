const startingWidth = window.innerWidth;

function startListening() {
    addEventListener("resize", () => {
        if (startingWidth < 1024 !== window.innerWidth < 1024)
            globalThis.location.reload();
    });
}

globalThis.appendModule({
    doesRunHere: () => true,
    onlyOnReloads: true,
    run: startListening,
});
