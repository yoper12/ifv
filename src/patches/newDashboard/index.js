import { mapDay } from "../apis/mapTimetable.js";
import { waitForRender } from "../apis/waitForElement.js";

function doesHaveClickableParent(element) {
    if (["a", "button"].includes(element.tagName.toLowerCase())) return true;
    if (!element.parentElement) return false;
    return doesHaveClickableParent(element.parentElement);
}

const icons = [
    [
        "Dzisiejszy plan zajęć",
        "calendar_clock_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg",
    ],
    [
        "Oceny od ostatniego logowania",
        "counter_6_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg",
    ],
    ["Sprawdziany", "quiz_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg"],
    ["Zadania domowe", "summarize_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg"],
    ["Informacje", "folder_info_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg"],
    ["Ogłoszenia", "campaign_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg"],
    ["Ankiety", "feedback_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg"],
    [
        "Frekwencja",
        "event_available_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg",
    ],
    [
        "Dyżurni",
        "person_raised_hand_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg",
    ],
    ["Ważne dzisiaj", "strategy_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg"],
];

function applyIcons() {
    for (const [tileTitle, fileName] of icons) {
        const icon = document.createElement("img");
        icon.src = `https://raw.githubusercontent.com/banocean/ifv/refs/heads/main/assets/icons/${fileName}`;
        const container = [
            ...document.querySelectorAll(".content-container .tile.box"),
        ]
            ?.find(
                (element) =>
                    element.querySelector("h2").textContent === tileTitle,
            )
            ?.querySelector(".tile__header.flex__items > .flex__item-auto");

        if (container) container.insertBefore(icon, container.firstChild);
        else return console.debug(`Tile ${tileTitle} not found`);

        container.parentElement?.parentElement?.addEventListener(
            "click",
            (event) => {
                if (doesHaveClickableParent(event.target)) return;
                container.parentElement.querySelector("a.tile__link")?.click();
            },
        );
    }
}

let maxLessons = 0;
async function createToolbar() {
    const getContainer = () =>
        document.querySelector(
            ".content-container > .tile-container > .tile-subcontainer",
        );
    await waitForRender(getContainer);

    const element = document.createElement("div");
    element.classList.add("dashboard-info-toolbar");
    element.innerHTML = `
        <div>
            <img src="https://raw.githubusercontent.com/banocean/ifv/refs/heads/main/assets/icons/star_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg">
            <span>-</span>
        </div>
        <div>
            <img src="https://raw.githubusercontent.com/banocean/ifv/refs/heads/main/assets/icons/event_note_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg">
            <span>-</span>
        </div>
        <div>
            <img src="https://raw.githubusercontent.com/banocean/ifv/refs/heads/main/assets/icons/mail_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg">
            <span>-</span>
        </div>
    </div>`;

    const container = getContainer();
    container.insertBefore(element, container.firstChild);

    const getLuckyNumber = () =>
        document.querySelector(
            ".lucky-number__circle.lucky-number__number > span",
        )?.textContent;
    await waitForRender(getLuckyNumber);
    element.querySelector("div:first-of-type > span").textContent =
        getLuckyNumber();

    const getAmountOfMessages = () =>
        document.querySelector(
            'a[title="Przejdź do modułu wiadomości"] .MuiBadge-anchorOriginTopRightRectangle',
        ).textContent;
    await waitForRender(getAmountOfMessages);
    element.querySelector("div:last-of-type > span").textContent =
        getAmountOfMessages();
    element.querySelector("div:last-of-type").addEventListener("click", () => {
        document
            .querySelector('a[title="Przejdź do modułu wiadomości"]')
            ?.click();
    });
}

function renderTimetable() {
    const timetableElement = document.querySelector(".plan-zajec");
    const timetable = mapDay(timetableElement);
    if (timetable.length < maxLessons) return;
    maxLessons = timetable.length;

    const elements = timetable.map((lesson) => {
        const element = document.createElement("li");
        if (lesson.type === "conflicted") {
            element.textContent = `Więcej pozycji`;
        } else {
            element.classList.add(lesson.type);
            element.textContent = `${lesson.subject} (${lesson.classroom}) ${
                lesson.type === "unknown" ? lesson.annotationText : ""
            }`;
        }
        return element;
    });

    const container = document.createElement("ol");
    container.classList.add("lessons-container");
    container.append(...elements);

    const existingContainer = document.querySelector(".lessons-container");
    if (existingContainer) {
        existingContainer.remove();
    }

    timetableElement.parentElement.insertBefore(container, timetableElement);
}

async function replaceTimetable() {
    await waitForRender(() => document.querySelector(".plan-zajec"));
    renderTimetable();
    const observer = new MutationObserver(renderTimetable);
    observer.observe(document.querySelector(".plan-zajec"), {
        childList: true,
        subtree: true,
    });
}

globalThis.appendModule({
    doesRunHere: () => globalThis.location.href.endsWith("tablica"),
    isLoaded: () =>
        document.querySelector(".plan-zajec")
        && !document.querySelector(".spinner"),
    onlyOnReloads: false,
    run: () => {
        applyIcons();
        createToolbar();
        replaceTimetable();
    },
});
