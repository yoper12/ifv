import { definePatch } from "@/utils/definePatch";
import { route } from "@/utils/route";

import colors from "./colors.css?inline";
import eventHome from "./evHome.css?inline";
import main from "./main.css?inline";

export default definePatch({
    cleanup() {
        document.documentElement.classList.remove(
            "dark",
            "evHome-dark",
            "pureBlack",
            "evHome-pureBlack",
        );
    },
    css: [main, eventHome, colors],
    init(settings) {
        switch (settings.darkThemeEnabled) {
            case "auto": {
                if (
                    globalThis.matchMedia("(prefers-color-scheme: dark)")
                        .matches
                ) {
                    if (globalThis.location.hostname === "eduvulcan.pl") {
                        document.documentElement.classList.add(
                            settings.pureBlack ? "evHome-pureBlack" : (
                                "evHome-dark"
                            ),
                        );
                    } else {
                        document.documentElement.classList.add(
                            settings.pureBlack ? "pureBlack" : "dark",
                        );
                    }
                }
                break;
            }
            case "enabled": {
                if (globalThis.location.hostname === "eduvulcan.pl") {
                    document.documentElement.classList.add(
                        settings.pureBlack ? "evHome-pureBlack" : "evHome-dark",
                    );
                } else {
                    document.documentElement.classList.add(
                        settings.pureBlack ? "pureBlack" : "dark",
                    );
                }
                break;
            }
        }
    },
    meta: {
        description: "Adds dark theme.",
        id: "dark-theme",
        matches: [route("*")],
        name: "Dark theme",
        runAt: "document_start",
        settings: [
            {
                defaultValue: "auto",
                description: "Whether dark theme should be enabled.",
                id: "darkThemeEnabled",
                name: "Dark theme enabled",
                options: [
                    { label: "Auto", value: "auto" },
                    { label: "Enabled", value: "enabled" },
                    { label: "Disabled", value: "disabled" },
                ],
                type: "select",
            },
            {
                defaultValue: false,
                description:
                    "Enables a pure black dark theme that is easier on OLED screens.",
                id: "pureBlack",
                name: "Pure black theme",
                type: "switch",
            },
        ],
    },
});
