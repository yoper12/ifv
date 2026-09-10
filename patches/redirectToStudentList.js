function redirectToLoginPage() {
    window.location.pathname = "/dostep-do-dziennika";
}

window.appendModule({
    onlyOnReloads: true,
    run: redirectToLoginPage,
    doesRunHere: () =>
        window.location.hostname === "eduvulcan.pl"
        && window.location.pathname === "/"
        && !document.querySelector(".vdpo-login-link")
});
