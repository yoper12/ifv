import { watchElement } from "@/utils/DomObservers";
import { definePatch } from "@/utils/definePatch";
import { route } from "@/utils/route";

export default definePatch({
    meta: {
        id: "redirect-to-login",
        name: "Auto redirect to login page",
        description:
            "Automatically redirects to the login page when opening the homepage.",
        matches: [
            route({ host: "eduvulcan.pl", path: "/" }),
            route({ host: "dziennik-uczen.vulcan.net.pl", path: "/:symbol/" }),
        ],
        runAt: "document_start",
        runStrategy: "once",
    },
    init() {
        if (window.location.hostname === "eduvulcan.pl") {
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
                        window.location.pathname = "/logowanie";
                    }
                },
            );
        } else {
            window.location.pathname = `/${window.location.pathname.split("/")[1]}/LoginEndpoint.aspx`;
        }
    },
});
