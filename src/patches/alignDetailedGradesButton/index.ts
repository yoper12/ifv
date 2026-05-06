import { definePatch } from "@/utils/definePatch";
import { route } from "@/utils/route";

import css from "./style.css?inline";

export default definePatch({
    css,
    meta: {
        description: "Aligns detailed grades button with other buttons.",
        id: "align-detailed-grades-button",
        matches: [route("*/oceny")],
        name: "Align detailed grades button",
        runStrategy: "once",
    },
});
