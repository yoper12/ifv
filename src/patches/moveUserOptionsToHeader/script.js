import { executeActionOnAside, getFromAside } from "../apis/aside.js";
import { getUserData } from "../apis/getUserData.js";
import { waitForRender } from "../apis/waitForElement.js";

const studentOrMessagesRegex = /^(?:dziennik-)?(?:wiadomosci|uczen).*/;

async function moveUserOptionsToHeader() {
    const userLinks = await getFromAside(async () => {
        const user = document.querySelector(".user");
        if (user) {
            user.click();
            await waitForRender(() => document.querySelector(".user__links a"));
            return document.querySelectorAll(".user__links a");
        }
    });
    const userData = await getUserData();

    const modalBackground = document.createElement("div");
    const modalElement = document.createElement("div");

    modalBackground.classList.add("modal-background");
    modalElement.classList.add("modal-user");

    const userDataElement = document.createElement("div");
    userDataElement.classList.add("modal-data");

    const userAvatar = document.createElement("div");
    userAvatar.innerHTML = `<span></span>`;
    userAvatar.querySelector("span").textContent = userData.fullName[0];
    userAvatar.classList.add("user-avatar");
    userDataElement.append(userAvatar.cloneNode(true));

    const nameElement = document.createElement("div");
    nameElement.classList.add("modal-name");
    nameElement.innerHTML = `<span style="font-size: 20px"></span><span style="font-size: 1rem;"></span>`;
    nameElement.querySelectorAll("span")[0].textContent = userData?.fullName;
    nameElement.querySelectorAll("span")[1].textContent = userData?.username;
    userDataElement.append(nameElement);

    modalElement.append(userDataElement);

    for (const [index, link] of userLinks.entries()) {
        const linkContainer = document.createElement("div");
        linkContainer.classList.add("modal-link-container");

        const linkText = document.createElement("span");
        linkText.innerHTML = link.textContent;

        linkText.addEventListener("click", () => {
            executeActionOnAside(async () => {
                document.querySelector(".user").click();
                await waitForRender(() =>
                    document.querySelector(".user__links"),
                );
                document.querySelectorAll(".user__links a")[index].click();
            });
            toggleModal();
        });

        linkContainer.append(linkText);
        modalElement.append(linkContainer);
    }

    const backButtonContainer = document.createElement("div");
    backButtonContainer.classList.add("modal-back-container");
    const backButton = document.createElement("span");
    backButton.classList.add("modal-cancel");
    backButton.innerHTML = "Anuluj";
    backButtonContainer.append(backButton);
    modalElement.append(backButtonContainer);

    modalBackground.addEventListener("click", () => {
        history.back();
    });
    backButton.addEventListener("click", () => {
        history.back();
    });
    userAvatar.addEventListener("click", () => {
        toggleModal();
        history.pushState(
            { ...history.state, userModal: true },
            "",
            `${location.pathname}#user-modal`,
        );
    });

    document.body.append(modalElement);
    document.body.append(modalBackground);
    document
        .querySelector(".header_logo_tools_user-wrapper")
        .append(userAvatar);

    addEventListener("popstate", () => {
        if (
            document.querySelector(".modal-user").classList.contains("active")
        ) {
            toggleModal();
        }
    });
}

function toggleModal() {
    document.querySelector(".modal-background").classList.toggle("active");
    document.querySelector(".modal-user").classList.toggle("active");
}

globalThis.appendModule({
    doesRunHere: () =>
        !!studentOrMessagesRegex.test(globalThis.location.hostname),
    isLoaded: () =>
        document.querySelector(".header__logo-product")?.firstChild
        && document.querySelector(".header__hamburger__icon button"),
    onlyOnReloads: true,
    run: moveUserOptionsToHeader,
});
