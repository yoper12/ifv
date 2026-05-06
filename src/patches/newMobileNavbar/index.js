import { getFromAside } from "../apis/aside.js";
import { waitForRender } from "../apis/waitForElement.js";
import { setHighlights } from "./highlights.js";

const studentRegex = /^(dziennik-)?(uczen).*/;
if (/^(?:dziennik-)?uczen.*/.test(globalThis.location.hostname))
    globalThis.asideMode = "hidden";

function getPages(selector = "aside > section > .MuiList-root > ul") {
    if (!document.querySelector("aside")) return [];
    return Array.from(document.querySelector(selector).children, (item) => {
        const isDirectLink = item.classList.contains("MuiListItem-gutters");
        const icon = getComputedStyle(
            isDirectLink ? item : item.querySelector("div > button"),
            ":before",
        ).getPropertyValue("content");
        const name = item.querySelector(
            isDirectLink ? "a" : ".accordion__title__content",
        )?.textContent;

        const items =
            isDirectLink ? undefined : (
                [...item.querySelector(".items").children]
            );

        return { element: item, icon, items, name, type: isDirectLink ? 1 : 2 };
    });
}

const BACK_ICON_URL =
    "https://raw.githubusercontent.com/banocean/ifv/new-navbar/assets/icons/keyboard_backspace_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg";

const navIcons = {
    frekwencja: "event_available",
    oceny: "counter_6",
    planZajec: "calendar_clock",
    tablica: "dashboard",
};

async function run() {
    const nav = document.createElement("nav");
    nav.classList.add("bottom-navigation-bar");

    const more = document.createElement("div");
    more.classList.add("more-popup", "list-modal");
    more.innerHTML = `<div><img src='${BACK_ICON_URL}'><h1>Więcej</h1></div><div></div>`;
    more.style.display = "none";

    more.querySelector("img").addEventListener("click", () => {
        more.style.display = "none";
        history.back();
        setHighlights();
    });

    await getFromAside(() => {}); // We need aside to just load
    await waitForRender(() => getPages().length > 1);

    const navPages = new Set(["frekwencja", "oceny", "planZajec", "tablica"]);
    const pages = getPages();
    for (const page of pages) {
        const itemClass = [...page.element.classList].find(
            (c) =>
                ![
                    "MuiListItem-gutters",
                    "MuiListItem-root",
                    "selected",
                ].includes(c),
        );
        const item = document.createElement("div");

        if (navPages.has(itemClass)) {
            item.innerHTML = `<div><img src="https://raw.githubusercontent.com/banocean/ifv/new-navbar/assets/icons/${navIcons[itemClass]}_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg"></div><div></div>`;
            item.querySelector("div:last-of-type").textContent = page.name;
            nav.append(item);
        } else {
            item.innerHTML =
                "<div class='icon'></div><span class='name'></span>";
            item.querySelector(".icon").style.content = page.icon;
            item.querySelector(".name").textContent = page.name;
            more.querySelector("div:last-of-type").append(item);
        }

        if (page.type === 1) {
            item.addEventListener("click", () => {
                document.querySelector(`.${itemClass} a`).click();
                more.style.display = "none";
                document
                    .querySelector(".header__hamburger__icon button")
                    .click();
                document.querySelector("div#root").scroll(0, 0);
                setHighlights();
            });
        } else {
            const detailedOptionsPage = document.createElement("div");
            detailedOptionsPage.innerHTML = `<div><img src='${BACK_ICON_URL}'><h1></h1></div><div></div>`;
            detailedOptionsPage.style.zIndex = "4002";
            detailedOptionsPage.style.display = "none";
            detailedOptionsPage.classList.add("list-modal");

            detailedOptionsPage.querySelector("h1").textContent = page.name;
            detailedOptionsPage
                .querySelector("img")
                .addEventListener("click", () => {
                    history.back();
                });

            for (let index = 0; index < page.items.length; index++) {
                const option = page.items[index];
                const element = document.createElement("div");
                element.innerHTML =
                    "<div class='icon'></div><span class='name'></span>";
                element.querySelector(".icon").style.content = page.icon;
                element.querySelector(".name").textContent =
                    option.firstChild.textContent;
                element.addEventListener("click", () => {
                    detailedOptionsPage.style.display = "none";
                    more.style.display = "none";
                    [...document.querySelectorAll(`.${itemClass} .items a`)][
                        index
                    ].click();
                    document
                        .querySelector(".header__hamburger__icon button")
                        .click();
                    document.querySelector("div#root").scroll(0, 0);
                });
                detailedOptionsPage.lastElementChild.append(element);
            }

            item.addEventListener("click", () => {
                detailedOptionsPage.style.display = "block";
                history.pushState(
                    { ...history.state, moreDetails: true },
                    "",
                    `${location.pathname}#${itemClass}`,
                );
            });

            addEventListener("popstate", (event) => {
                detailedOptionsPage.style.display =
                    event.state?.moreDetails ? "block" : "none";
            });

            document.body.append(detailedOptionsPage);
        }
    }

    const moreButton = document.createElement("div");
    moreButton.innerHTML = `
        <div>
            <img src="https://raw.githubusercontent.com/banocean/ifv/main/assets/icons/menu_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg">
        </div>
        <div>Więcej</div>
        `;

    moreButton.addEventListener("click", () => {
        more.style.display = "block";
        history.pushState(
            { ...history.state, more: true },
            "",
            `${location.pathname}#more`,
        );
        setHighlights();
    });

    nav.append(moreButton);

    document.body.append(nav);
    document.body.append(more);
}

addEventListener("popstate", (event) => {
    if (event.state?.moreDetails !== true) {
        if (event.state?.more) {
            document.querySelector(".more-popup").style.display = "block";
        } else {
            for (const element of document.querySelectorAll(".list-modal")) {
                element.style.display = "none";
            }
        }
    }
    setHighlights();
});

globalThis.appendModule({
    doesRunHere: () => globalThis.location.hostname.match(studentRegex),
    isLoaded: () => !!document.querySelector(".header__hamburger__icon"),
    onlyOnReloads: true,
    run,
});
