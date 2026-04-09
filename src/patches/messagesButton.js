import { getFromAside } from "./apis/aside.js";
import { waitForRender } from "./apis/waitForElement.js";

const studentRegex = /^(dziennik-)?(uczen).*/;

async function move() {
    const inner = await getFromAside(async () => {
        await waitForRender(() => document.querySelector(".messages"));
        return document.querySelector(".messages")?.innerHTML;
    });

    const messages = document.createElement("div");
    messages.innerHTML = inner;
    messages.style.float = "right";
    messages.style.padding = "20px";
    messages.style.marginLeft = "auto";
    messages.querySelector(
        ".MuiBadge-anchorOriginTopRightRectangle",
    ).style.transitionDuration = "0ms";

    document
        .querySelector(".header_logo_tools-container")
        .appendChild(messages);
}

window.appendModule({
    run: move,
    doesRunHere: () => window.location.hostname.match(studentRegex),
    onlyOnReloads: true,
    isLoaded: () => !!document.querySelector(".header__hamburger__icon"),
});
