import { definePatch } from "@/utils/definePatch";
import { route } from "@/utils/route";

import css from "./style.css?inline";

export default definePatch({
    css,
    meta: {
        description: "Hides footer.",
        deviceTypes: ["mobile"],
        id: "hide-footer",
        matches: [
            route({ host: "uczen.eduvulcan.pl" }),
            route({ host: "dziennik-uczen.vulcan.net.pl" }),
            route({ host: "wiadomosci.eduvulcan.pl" }),
            route({ host: "dziennik-wiadomosci.vulcan.net.pl" }),
        ],
        name: "Hide footer",
        runStrategy: "once",
    },
});
