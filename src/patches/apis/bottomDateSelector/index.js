import { waitForRender } from "../waitForElement.js";

const dayNames = [
    "poniedziałek",
    "wtorek",
    "środa",
    "czwartek",
    "piątek",
    "sobota",
    "niedziela",
];

const getWeekStartingMonday = (index) => (index === 0 ? 6 : index - 1);

function getWeek(date) {
    const DAY = 24 * 60 * 60 * 1000;
    const firstDay = new Date(`${date.getFullYear()}-01-01`);
    return Math.floor((date.getTime() - firstDay.getTime()) / DAY / 7);
}

const isSameWeek = (date, comparedDate) =>
    getWeek(date) === getWeek(comparedDate);

export class SelectorRenderer {
    constructor(renderContentFunction) {
        this.renderContent = renderContentFunction;

        this.#render()
            .then(() => console.debug("Rendered date selector"))
            .catch((error) =>
                console.error("Failed to render date selector", error),
            );
    }

    #createSelector(dayName) {
        const element = document.createElement("div");
        element.innerHTML = `
            <input type="date">
            <div>
                <img src='https://raw.githubusercontent.com/banocean/ifv/refs/heads/main/assets/icons/chevron_left_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg'>
                <span></span>
                <img src='https://raw.githubusercontent.com/banocean/ifv/refs/heads/main/assets/icons/chevron_right_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg'>
            </div>
        `;

        const dayDisplay = element.querySelector("span");
        dayDisplay.textContent = dayName;
        dayDisplay.addEventListener("click", () =>
            element.querySelector("input").showPicker(),
        );

        const datePicker = element.querySelector("input");
        datePicker.addEventListener("change", () =>
            this.#setDay(datePicker.value, datePicker.valueAsDate),
        );

        element
            .querySelector("img:first-of-type")
            .addEventListener("click", () => this.#setSiblingDay(-1));
        element
            .querySelector("img:last-of-type")
            .addEventListener("click", () => this.#setSiblingDay(1));
        element.classList.add("date-selector");

        return element;
    }

    #getDaysDropdowns() {
        return Array.from(
            document.querySelectorAll(".app__content .MuiPaper-root"),
            (element) => ({
                day: element.querySelector(".MuiAccordionSummary-content > h2")
                    ?.textContent,
                element,
                note: element.querySelector(".plan-zajec__accordion__wolne")
                    ?.textContent,
            }),
        );
    }

    #isDayListLoaded() {
        return !document.querySelector(".spinner") && this.#isWeekChanged();
    }

    #isWeekChanged() {
        return (
            !this.firstDayName
            || document.querySelector(
                ".app__content .MuiPaper-root .MuiAccordionSummary-content > h2",
            )?.textContent !== this.firstDayName
        );
    }

    async #render() {
        let replaceable = document.querySelector(".day-content");
        if (!replaceable) {
            replaceable = document.createElement("div");
            document
                .querySelector("section.app__content .mobile__frame")
                .append(replaceable);
        }

        this.cachedWeek = this.#getDaysDropdowns();

        if (this.currentWeekDay === undefined) {
            const today = new Date();
            const day = getWeekStartingMonday(today.getDay());
            this.currentWeekDay = this.cachedWeek.findIndex(
                (timetableDay) =>
                    (timetableDay.day || "-, ").split(", ")[0].toLowerCase()
                    === dayNames[day],
            );
            if (this.currentWeekDay === -1)
                this.currentWeekDay = this.cachedWeek.length - 1;
        }

        const content = await this.renderContent(
            this.cachedWeek[this.currentWeekDay],
        );
        content.classList.add("day-content");
        replaceable.replaceWith(content);

        if (document.querySelector(".date-selector")) {
            this.#updateSelectorDate(this.cachedWeek[this.currentWeekDay].day);
        } else
            document
                .querySelector("section.app__content .mobile__frame")
                .append(
                    this.#createSelector(
                        this.cachedWeek[this.currentWeekDay].day,
                    ),
                );

        this.#setupAutoRender();
    }

    #setChecking() {
        this.firstDayName = this.cachedWeek[0].day;
    }

    async #setDay(value, valueDate) {
        if (
            !isSameWeek(
                document.querySelector(".week-selector input").valueAsDate,
                valueDate,
            )
        ) {
            this.#setChecking();

            if (!value || !valueDate) return;
            updateReactInput(
                document.querySelector(".week-selector input"),
                value,
            );

            await waitForRender(() => this.#isDayListLoaded());
        }

        this.currentWeekDay = Math.min(
            getWeekStartingMonday(valueDate.getDay()),
            this.cachedWeek.length - 1,
        );
        await this.#render();
    }

    async #setSiblingDay(direction = 1) {
        this.#setChecking();
        document.querySelector("#root").scroll(0, 0);

        const target = this.currentWeekDay + direction;
        if (target >= this.cachedWeek.length || target < 0) {
            if (target < 0) {
                this.currentWeekDay = 4;
                document
                    .querySelector(".week-selector > button:first-of-type")
                    .click();
            } else {
                this.currentWeekDay = 0;
                document
                    .querySelector(".week-selector > button:last-of-type")
                    .click();
            }

            await waitForRender(() => this.#isDayListLoaded());
        } else {
            this.currentWeekDay = target;
        }

        await this.#render();
    }

    async #setupAutoRender() {
        if (this.observer) return;
        this.observer = new MutationObserver(async () => {
            const content = await this.renderContent(
                this.cachedWeek[this.currentWeekDay],
            );
            content.classList.add("day-content");
            document.querySelector(".day-content").replaceWith(content);
        });

        this.observer.observe(
            document.querySelector(
                ".content-container__tab-subheader:has(.week-selector) + div",
            ),
            { childList: true, subtree: true },
        );
    }

    #updateSelectorDate(name) {
        document.querySelector(".date-selector span").textContent = name;
    }
}

function updateReactInput(input, value) {
    const setValue = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(input),
        "value",
    ).set;
    const event = new Event("input", { bubbles: true });

    setValue.call(input, value);
    input.dispatchEvent(event);
}
