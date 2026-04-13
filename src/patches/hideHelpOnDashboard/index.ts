import { definePatch } from "@/utils/definePatch";
import { route } from "@/utils/route";

import css from "./style.css?inline";

export default definePatch({
    css,
    meta: {
        description: 'Hides "Do you need help" tile.',
        id: "hide-help-on-dashboard",
        matches: [route("*/tablica")],
        name: "Hide help on dashboard",
    },
});
