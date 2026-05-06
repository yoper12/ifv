import { definePatch } from "@/utils/definePatch";
import { waitForRender, waitForReplacement } from "@/utils/DomObservers";
import { route } from "@/utils/route";

import css from "./style.css?inline";

async function hideEmptyColumns(signal: AbortSignal) {
    await waitForRender(
        () =>
            document.querySelector(
                ".p-datatable-table .details-btn--appearance",
            ),
        document.body,
        signal,
    );

    const headers = document.querySelectorAll(".p-datatable-table th");

    for (const [index] of headers.entries()) {
        const cells = [
            ...document.querySelectorAll(
                "tbody tr td:nth-child(" + (index + 1) + ")",
            ),
        ];
        const check = cells.some((cell) => cell.textContent.trim().length > 0);

        const columnCells = document.querySelectorAll<HTMLElement>(
            "tr th:nth-child("
                + (index + 1)
                + "), tr td:nth-child("
                + (index + 1)
                + ")",
        );
        for (const cell of columnCells) {
            cell.style.display = check ? "" : "none";
        }
    }
}

async function prep(signal: AbortSignal) {
    if (window.innerWidth > 1024) {
        await waitForRender(
            () => document.querySelector(".MuiTabs-flexContainer > button"),
            document.body,
            signal,
        );

        await hideEmptyColumns(signal);
        for (const tabButton of document.querySelectorAll(
            ".MuiTabs-flexContainer > button",
        )) {
            tabButton.addEventListener(
                "click",
                async () => {
                    await waitForReplacement(
                        () =>
                            document.querySelector(
                                ".p-datatable-table .details-btn--appearance",
                            ),
                        document.body,
                        signal,
                    );
                    await hideEmptyColumns(signal);
                },
                { signal },
            );
        }
    } else {
        await waitForRender(
            () =>
                document.querySelector(
                    ".MuiAccordionDetails-root.accordion__full-width__content > .mobile__frame .grades__box",
                ),
            document.body,
            signal,
        );
        const mobileFrames = document.querySelectorAll(
            ".MuiAccordionDetails-root.accordion__full-width__content > .mobile__frame",
        );
        for (const semester of mobileFrames) {
            await waitForRender(
                () =>
                    semester.querySelector(
                        ".MuiAccordionDetails-root .grades__box .info-row .info-text > span",
                    ),
                semester as HTMLElement,
                signal,
            );
            for (const infoRow of semester.querySelectorAll(".info-row")) {
                const textContent =
                    infoRow
                        .querySelector(".info-text > span")
                        ?.textContent.trim() ?? "";
                if (textContent === "" || textContent === "0") {
                    infoRow.remove();
                }
            }
        }
    }
}

export default definePatch({
    css,
    init: (_, signal) => prep(signal),
    meta: {
        description:
            "Hides subjects without any grades and columns without content.",
        id: "cleanup-grades",
        matches: [route("*/oceny")],
        name: "Cleanup grades table",
    },
});
