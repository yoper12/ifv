function getManifestLink(hostname) {
    switch (hostname) {
        case "dziennik-uczen.vulcan.net.pl": {
            return `https://ifv-pwa.banocean.com/dziennik/${globalThis.location.pathname.split("/")[1]}`;
        }
        case "eduvulcan.pl": {
            return "https://raw.githubusercontent.com/banocean/ifv/main/pwa/manifest-eduvulcan.json";
        }
        case "uczen.eduvulcan.pl": {
            return `https://ifv-pwa.banocean.com/eduvulcan/${globalThis.location.pathname.split("/")[1]}`;
        }
    }
}

function injectWebManifest() {
    const metaLink = document.createElement("link");

    metaLink.setAttribute("rel", "manifest");
    metaLink.setAttribute(
        "href",
        getManifestLink(globalThis.location.hostname),
    );

    document.head.append(metaLink);
}

globalThis.appendModule({
    doesRunHere: () =>
        [
            "dziennik-uczen.vulcan.net.pl",
            "eduvulcan.pl",
            "uczen.eduvulcan.pl",
        ].includes(globalThis.location.hostname),
    isLoaded: () => true,
    onlyOnReloads: true,
    run: injectWebManifest,
});
