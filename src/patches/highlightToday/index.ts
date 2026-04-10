import css from "./style.css?inline";
import { definePatch } from "@/utils/definePatch";
import { route } from "@/utils/route";

export default definePatch({
    meta: {
        id: "highlight-today",
        name: "Highlight today",
        description: "Highlights today's date in the calendar.",
        matches: [
            route("*/sprawdzianyZadaniaDomowe"),
            route("*/planZajec"),
            route("*/frekwencja"),
        ],
    },
    css,
});
