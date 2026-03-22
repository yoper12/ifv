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
            urlCallbacks.forEach((cb) => cb());
        }

        // @ts-expect-error - navigation api is not yet included in lib.dom.ts
        if (window.navigation) {
            // @ts-expect-error - navigation api is not yet included in lib.dom.ts
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

            window.addEventListener("popstate", checkUrlChange);
        }
    }
}
