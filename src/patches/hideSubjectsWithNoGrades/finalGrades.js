import { waitForRender, waitForReplacement } from "../apis/waitForElement.js";

async function hideEmptyColumns() {
    await waitForRender(() =>
        document.querySelector(".p-datatable-table .details-btn--appearance"),
    );

    const headers = document.querySelectorAll(".p-datatable-table th");

    for (const [index] of headers.entries()) {
        const cells = [
            ...document.querySelectorAll(
                "tbody tr td:nth-child(" + (index + 1) + ")",
            ),
        ];
        const check = cells.some((cell) => cell.textContent.trim().length > 0);

        const columnCells = document.querySelectorAll(
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

async function prep() {
    if (window.innerWidth > 1024) {
        await waitForRender(() =>
            document.querySelector(".MuiTabs-flexContainer > button"),
        );

        hideEmptyColumns();
        for (const tabButton of document.querySelectorAll(
            ".MuiTabs-flexContainer > button",
        )) {
            tabButton.addEventListener("click", async () => {
                await waitForReplacement(() =>
                    document.querySelector(
                        ".p-datatable-table .details-btn--appearance",
                    ),
                );
                hideEmptyColumns();
            });
        }
    } else {
        await waitForRender(() =>
            document.querySelector(
                ".MuiAccordionDetails-root.accordion__full-width__content > .mobile__frame .grades__box",
            ),
        );
        const mobileFrames = document.querySelectorAll(
            ".MuiAccordionDetails-root.accordion__full-width__content > .mobile__frame",
        );
        for (const semester of mobileFrames) {
            await waitForRender(() =>
                semester.querySelector(
                    ".MuiAccordionDetails-root .grades__box .info-row .info-text > span",
                ),
            );
            for (const infoRow of semester.querySelectorAll(".info-row")) {
                if (
                    infoRow
                        .querySelector(".info-text > span")
                        .textContent.trim() === ""
                    || infoRow
                        .querySelector(".info-text > span")
                        .textContent.trim() === "0"
                ) {
                    infoRow.remove();
                }
            }
        }
    }
}

globalThis.appendModule({
    doesRunHere: () => globalThis.location.pathname.endsWith("oceny"),
    onlyOnReloads: false,
    run: prep,
});
