import { getFromAside } from "./aside.js";
import { waitForRender } from "./waitForElement.js";

export const getUserData = async () =>
    await getFromAside(async () => {
        await waitForRender(
            () =>
                document.querySelector(
                    globalThis.location.hostname.includes("wiadomosci") ?
                        ".account__name span"
                    :   ".side_important-text.side_student",
                ) && document.querySelector(".user div:nth-child(2)"),
        );

        return {
            fullName:
                globalThis.location.hostname.includes("wiadomosci") ?
                    document
                        .querySelector(".account__name span")
                        ?.firstChild?.textContent?.split(" ")
                        // eslint-disable-next-line unicorn/no-array-reverse
                        .reverse()
                        .join(" ")
                :   document.querySelector(".side_important-text.side_student")
                        ?.textContent,
            username: document.querySelector(".user div:nth-child(2)").lastChild
                .textContent,
        };
    });
