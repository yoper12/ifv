import { definePatch } from "@/utils/definePatch";
import { route } from "@/utils/route";

import css from "./style.css?inline";

export default definePatch({
    css,
    meta: {
        description: "Highlights today's date in the calendar.",
        id: "highlight-today",
        matches: [
            route("*/sprawdzianyZadaniaDomowe"),
            route("*/planZajec"),
            route("*/frekwencja"),
        ],
        name: "Highlight today",
        runStrategy: "once",
    },
});
