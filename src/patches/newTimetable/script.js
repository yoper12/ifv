import { SelectorRenderer } from "../apis/bottomDateSelector/index.js";
import { mapDay } from "../apis/mapTimetable.js";
import { waitForRender } from "../apis/waitForElement.js";

const mapData = () =>
    Array.from(
        document.querySelectorAll(".app__content .MuiPaper-root"),
        (element) => ({
            day: element.querySelector(".MuiAccordionSummary-content > h2")
                ?.textContent,
            lessons: mapDay(element),
            note: element.querySelector(".plan-zajec__accordion__wolne")
                ?.textContent,
        }),
    );
const isOpened = (element) =>
    element.querySelector(".MuiCollapse-root")?.style?.height !== "0px";

function mapStartingHours(data) {
    const all = new Set();
    for (const day of data)
        if (day.lessons)
            for (const lesson of day.lessons)
                if (lesson.startingHour) all.add(lesson.startingHour);
    const result = all.toSorted();
    const [firstHour, firstMinutes] = (result[0] || "08:00").split(":");
    return Number(firstHour) <= 7 && Number(firstMinutes) <= 30 ?
            result
        :   ["7:00", ...result];
}

async function openAll() {
    const container = document.querySelectorAll(".app__content .MuiPaper-root");
    for (const element of container) {
        if (!isOpened(element))
            element.querySelector(".accordion__full-width__header h2")?.click();
        await waitForRender(() => isOpened(element), element);
    }
}

const getStartingHours = () =>
    JSON.parse(localStorage.getItem("startingHours") || "[]");

async function renderDay(data) {
    await openAll();

    if (!data.note) {
        await waitForRender(() =>
            document.querySelector(".details-btn--position-r-bottom"),
        );
    }

    const startingHours = getStartingHours();
    const lessons = mapDay(data.element);
    const element = document.createElement("section");
    element.classList.add("timetable");

    if (lessons.length === 0) {
        const infoElement = document.createElement("div");
        infoElement.innerHTML =
            "<div><span class='no-lessons-title'>Nie ma lekcji 😎</span><br><span></span></div>";
        if (data.note)
            infoElement.querySelector("span:last-of-type").textContent =
                data.note;
        element.append(infoElement);
    } else {
        for (const lesson of lessons) {
            const lessonElement = document.createElement("div");
            lessonElement.innerHTML = `
                <div>${startingHours.indexOf(lesson.startingHour)}</div>
                <article>
                    <div class='info'><span></span><span></span></div>
                    <div class='data'></div>
                </article>
            `;
            const lessonDataElement = lessonElement.querySelector(".data");

            const timeContainer = lessonElement.querySelector(".info");
            timeContainer.firstElementChild.textContent = lesson.startingHour;
            timeContainer.lastElementChild.textContent = lesson.endingHour;

            lessonElement.classList.add("lesson", lesson.type);

            if (lesson.type === "conflicted") {
                lessonDataElement.innerHTML = `
                    <div class='subject'>Wpisana jest więcej niż jedna lekcja</div>
                    <div class='additional-info'>Kliknij, aby wyświetlić</div>
                `;
            } else {
                lessonDataElement.innerHTML = `<div class="subject"></div> <div class="additional-info"></div>`;
                lessonDataElement.querySelector(".subject").textContent =
                    lesson.subject;
                lessonDataElement.querySelector(
                    ".additional-info",
                ).textContent =
                    // eslint-disable-next-line unicorn/no-array-reverse
                    `${lesson.classroom} ${lesson.teacher?.split(" ")?.reverse()?.join(" ")}`;
            }

            lessonElement.addEventListener("click", () =>
                lesson.originalElement.querySelector("button").click(),
            );
            element.append(lessonElement);
        }
    }

    return element;
}

async function run() {
    document.querySelector(
        "section.app__content .app__content__header",
    ).style.display = "none";
    document.querySelector(
        "section.app__content .mobile__frame > div",
    ).style.display = "none";

    await openAll();
    localStorage.setItem(
        "startingHours",
        JSON.stringify(mapStartingHours(mapData())),
    );

    new SelectorRenderer(renderDay);
}

const isLoaded = () =>
    document.querySelector(".app__content .MuiCollapse-root")?.style?.minHeight
    && document.querySelector("section.app__content .mobile__frame .plan-zajec")
    && !document.querySelector(".spinner")
    && document.querySelector(
        ".position__lesson__hours, .conflicted--details--hours",
    );

globalThis.appendModule({
    doesRunHere: () => globalThis.location.pathname.endsWith("planZajec"),
    isLoaded,
    onlyOnReloads: false,
    run,
});
