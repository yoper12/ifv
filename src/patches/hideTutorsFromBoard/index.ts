import { definePatch } from "@/utils/definePatch";
import { route } from "@/utils/route";

import css from "./style.css?inline";

export default definePatch({
    css,
    meta: {
        description: "Hides tutors tile from the board view.",
        id: "hide-tutors-from-board",
        matches: [route("*/tablica")],
        name: "Hide tutors from board",
    },
});
