import { definePatch } from "@/utils/definePatch";
import { route } from "@/utils/route";

import css from "./style.css?inline";

export default definePatch({
    css,
    meta: {
        description: "Hides exam results instead of showing no data.",
        deviceTypes: ["mobile"],
        id: "hide-empty-exam-results",
        matches: [route("*/oceny")],
        name: "Hide empty exam results",
        runStrategy: "once",
    },
});
