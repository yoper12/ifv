import { clickOnAside } from "../apis/aside.js";

const messagesRegex = /^(?:dziennik-)?wiadomosci.*/;
const studentOrMessagesRegex = /^(?:dziennik-)?(?:wiadomosci|uczen).*/;

const isEV = () => !globalThis.location.hostname.startsWith("dziennik");

const getLogoElement = () =>
    document.querySelector(".header__logo-product")?.firstChild;

function setUpRedirectToBoard() {
    const logoElement = getLogoElement();
    if (messagesRegex.test(globalThis.location.hostname)) {
        const url = `https://${globalThis.location.hostname.replace(
            "wiadomosci",
            "uczen",
        )}/${globalThis.location.pathname.split("/")[1]}/App`;

        if (isEV()) logoElement.href = url;
        else {
            logoElement.addEventListener(
                "click",
                () => (globalThis.location.href = url),
            );
            logoElement.style = "cursor: pointer;";
        }
    } else {
        if (isEV()) logoElement.href = "javascript:void(0)";
        else logoElement.style = "cursor: pointer;";
        logoElement.addEventListener("click", () => clickOnAside(".tablica a"));
    }
}

globalThis.appendModule({
    doesRunHere: () =>
        !!studentOrMessagesRegex.test(globalThis.location.hostname),
    isLoaded: getLogoElement,
    onlyOnReloads: true,
    run: setUpRedirectToBoard,
});
