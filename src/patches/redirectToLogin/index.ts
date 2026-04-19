import { definePatch } from "@/utils/definePatch";
import { watchElement } from "@/utils/DomObservers";
import { route } from "@/utils/route";

export default definePatch({
    init() {
        if (globalThis.location.hostname === "eduvulcan.pl") {
            watchElement(
                () => document.querySelector(".user-controls"),
                (disconnect) => {
                    if (document.querySelector('a[aria-label="Wylogowanie"]')) {
                        disconnect();
                    } else if (
                        document.querySelector(
                            'a[aria-label="Logowanie/tworzenie konta"]',
                        )
                    ) {
                        disconnect();
                        globalThis.location.pathname = "/logowanie";
                    }
                },
            );
        } else {
            globalThis.location.pathname = `/${globalThis.location.pathname.split("/")[1]}/LoginEndpoint.aspx`;
        }
    },
    meta: {
        description:
            "Automatically redirects to the login page when opening the homepage.",
        id: "redirect-to-login",
        matches: [
            route({ host: "eduvulcan.pl", path: "/" }),
            route({ host: "dziennik-uczen.vulcan.net.pl", path: "/:symbol/" }),
        ],
        name: "Auto redirect to login page",
        runAt: "document_start",
        runStrategy: "once",
    },
});
