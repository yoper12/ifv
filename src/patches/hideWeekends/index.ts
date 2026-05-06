import { definePatch } from "@/utils/definePatch";
import { route } from "@/utils/route";

import css from "./style.css?inline";

export default definePatch({
    css,
    meta: {
        description:
            "Hides weekends in monthly calendars in timetable, exams and frequency views.",
        id: "hide-weekends",
        matches: [
            route("*/planZajec"),
            route("*/sprawdzianyZadaniaDomowe"),
            route("*/frekwencja"),
        ],
        name: "Hide weekends in monthly calendars",
        runStrategy: "once",
    },
});
