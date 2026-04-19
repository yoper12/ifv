const urlCallbacks = new Set<() => void>();
let isObserverInitialized = false;

/**
 * Registers a callback to be invoked whenever the URL changes, including SPA
 * navigations. Used only in content scripts to deduplicate event listeners
 * across them.
 */
export function onUrlChange(callback: () => void) {
    urlCallbacks.add(callback);

    if (!isObserverInitialized) {
        isObserverInitialized = true;

        function triggerAll() {
            for (const callback of urlCallbacks) {
                callback();
            }
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (window.navigation) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.navigation.addEventListener("navigatesuccess", triggerAll);
        } else {
            let lastUrl = location.href;

            function checkUrlChange() {
                if (location.href !== lastUrl) {
                    lastUrl = location.href;
                    triggerAll();
                }
            }

            const observer = new MutationObserver(checkUrlChange);
            observer.observe(document.documentElement, {
                childList: true,
                subtree: true,
            });

            globalThis.addEventListener("popstate", checkUrlChange);
        }
    }
}
