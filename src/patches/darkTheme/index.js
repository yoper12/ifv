import { getSetting } from "../apis/settings.js";

function applyDarkTheme() {
    if (
        (getSetting("Dark theme", "darkThemeEnabled") === "auto"
            && globalThis.matchMedia("(prefers-color-scheme: dark)").matches)
        || getSetting("Dark theme", "darkThemeEnabled") === "enabled"
    ) {
        if (globalThis.location.hostname === "eduvulcan.pl") {
            document.documentElement.classList.add("evHome-dark");
        } else {
            document.documentElement.classList.add("dark");
        }
    }
}

globalThis.appendModule({ run: applyDarkTheme });
