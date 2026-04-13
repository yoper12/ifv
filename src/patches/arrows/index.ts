import { definePatch } from "@/utils/definePatch";
import { route } from "@/utils/route";

import css from "./style.css?inline";

export default definePatch({
    css,
    meta: {
        description:
            "Replaces close buttons with back buttons to indicate more accurately what action it corresponds to.",
        deviceTypes: ["mobile"],
        id: "arrows",
        matches: [route("*")],
        name: "Change close button icon",
        runStrategy: "once",
    },
});
