import { definePatch } from "@/utils/definePatch";
import { route } from "@/utils/route";

import css from "./style.css?inline";

export default definePatch({
    css,
    meta: {
        description:
            "Hides eduVulcan app download links tile, eduVulcan banner and ribbon.",
        id: "cleanup-eduvulcan-home",
        matches: [route({ host: "eduvulcan.pl" })],
        name: "Hide unnecessary tiles in eduVulcan home",
    },
});
