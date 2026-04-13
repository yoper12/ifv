import { definePatch } from "@/utils/definePatch";
import { route } from "@/utils/route";

import css from "./style.css?inline";

export default definePatch({
    css,
    meta: {
        description: "Hides the WCAG accessibility buttons.",
        id: "hide-wcag",
        matches: [route("*")],
        name: "Hide WCAG",
    },
});
