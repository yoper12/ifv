const messagesRegex = /(dziennik-)?wiadomosci.*/;
const studentOrMessagesRegex = /^(?:dziennik-)?(?:wiadomosci|uczen).*/;

const isMessagesPage = () => globalThis.location.hostname.match(messagesRegex);

function displayFullName() {
    const studentData = getStudentData();

    if (!studentData) return;

    const studentNameSpan = document.createElement("span");
    studentNameSpan.style = "font-size: 20px;";
    studentNameSpan.textContent = `${studentData}`;

    const usernameContainer = document.querySelector(
        ".user div:nth-of-type(2)",
    );
    usernameContainer.style =
        "display: flex; flex-direction: column; font-size: 16px;";

    usernameContainer.insertBefore(
        studentNameSpan,
        usernameContainer.firstChild,
    );
}

const getStudentData = () =>
    isMessagesPage() ?
        document
            .querySelector(".account__name span")
            ?.firstChild?.textContent?.split(" ")
            // eslint-disable-next-line unicorn/no-array-reverse
            .reverse()
            .join(" ")
    :   document.querySelector(".side_student")?.firstChild?.textContent;

globalThis.appendModule({
    doesRunHere: () =>
        !!studentOrMessagesRegex.test(globalThis.location.hostname),
    isLoaded: () =>
        document.querySelector(
            `.${isMessagesPage() ? "account__name span" : "side_student"}`,
        ),
    onlyOnReloads: true,
    run: displayFullName,
});
