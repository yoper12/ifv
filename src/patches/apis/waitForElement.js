export async function waitForRender(getElement, target = document.body) {
    let promiseResolve;
    const wait = new Promise((resolve) => (promiseResolve = resolve));
    const observer = new MutationObserver((mutations, observer) => {
        if (!getElement()) return;
        promiseResolve();
        observer.disconnect();
    });
    observer.observe(target, { childList: true, subtree: true });

    const lastTry = getElement();
    if (!lastTry) {
        await wait;
    }
}

export async function waitForReplacement(getElement, target = document.body) {
    const initialElement = getElement();

    if (!initialElement) {
        return waitForRender(getElement, target);
    }

    let resolveDisappear;
    const waitForDisappear = new Promise(
        (resolve) => (resolveDisappear = resolve),
    );

    const disappearObserver = new MutationObserver((mutations, observer) => {
        if (!document.body.contains(initialElement)) {
            resolveDisappear();
            observer.disconnect();
        }
    });

    disappearObserver.observe(target, { childList: true, subtree: true });

    await waitForDisappear;

    return waitForRender(getElement, target);
}
