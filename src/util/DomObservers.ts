export class DomObservers {
    /**
     * Waits for an element to be rendered in the DOM.
     * Disconnects automatically if the parent element is removed from the DOM, preventing memory leaks.
     *
     * @example
     * ```typescript
     * await DomObservers.waitForRender(() => document.querySelector('.modal'), document.querySelector('#app'));
     * console.log('Modal is now in #app!');
     * ```
     *
     * @param selector A function that returns the target element or null if the element does not exist yet.
     * @param parent The root element to observe for changes. Defaults to `document.body`, you should however consider using a more specific parent element for better performance. Make sure the parent element exists when calling this method.
     * @param signal An optional `AbortSignal` that can be used to cancel the waiter. If aborted, the promise will reject with an `AbortError`. Use this in your patch's cleanup function to prevent memory leaks, for example: `abortController.abort()`.
     * @returns A promise that resolves when the element is found.
     */
    static async waitForRender(
        selector: () => HTMLElement | null,
        parent = document.body,
        signal?: AbortSignal,
    ): Promise<void> {
        signal?.throwIfAborted();

        if (selector()) {
            return;
        }

        return new Promise((resolve, reject) => {
            const observer = new MutationObserver(() => {
                if (!parent.isConnected) {
                    observer.disconnect();
                    reject(
                        new Error(
                            "Parent element disconnected while waiting for render.",
                        ),
                    );
                    return;
                }

                if (selector()) {
                    observer.disconnect();
                    resolve();
                }
            });

            if (signal) {
                signal.addEventListener("abort", () => {
                    observer.disconnect();
                    reject(new DOMException("Aborted", "AbortError"));
                });
            }

            observer.observe(parent, { subtree: true, childList: true });
        });
    }

    /**
     * Waits for an element to be replaced in the DOM.
     * Disconnects automatically if the parent element is removed from the DOM, preventing memory leaks.
     *
     * @example
     * ```typescript
     * await DomObservers.waitForReplacement(() => document.querySelector('.modal'), document.querySelector('#app'));
     * console.log('New modal has been created in #app!');
     * ```
     *
     * @param selector A function that returns the target element or null if the element does not exist already.
     * @param parent The root element to observe for changes. Defaults to `document.body`, you should however consider using a more specific parent element for better performance. Make sure the parent element exists when calling this method.
     * @param signal An optional `AbortSignal` that can be used to cancel the waiter. If aborted, the promise will reject with an `AbortError`. Use this in your patch's cleanup function to prevent memory leaks, for example: `abortController.abort()`.
     * @returns A promise that resolves when the element has been replaced.
     */
    static async waitForReplacement(
        selector: () => HTMLElement | null,
        parent = document.body,
        signal?: AbortSignal,
    ): Promise<void> {
        signal?.throwIfAborted();

        const initialElement = selector();

        if (!initialElement) {
            return this.waitForRender(selector, parent, signal);
        }

        await new Promise<void>((resolve, reject) => {
            const observer = new MutationObserver(() => {
                if (!parent.isConnected) {
                    observer.disconnect();
                    reject(
                        new Error(
                            "Parent element disconnected while waiting for replacement.",
                        ),
                    );
                    return;
                }

                if (!initialElement.isConnected) {
                    observer.disconnect();
                    resolve();
                }
            });

            if (signal) {
                signal.addEventListener("abort", () => {
                    observer.disconnect();
                    reject(new DOMException("Aborted", "AbortError"));
                });
            }

            observer.observe(parent, { subtree: true, childList: true });
        });

        return this.waitForRender(selector, parent, signal);
    }

    /**
     * Watches for changes in a specific element and triggers the callback when a change occurs. Runs the callback immediately upon setup.
     * Disconnects automatically if the element is removed from the DOM, preventing memory leaks.
     *
     * @example
     * ```typescript
     * DomObservers.watchElement(
     *   () => document.querySelector('.modal'),
     *   (disconnect) => {
     *     console.log('Modal content changed!');
     *     // Call disconnect() to stop watching
     *   }
     * );
     * ```
     *
     * @param selector A function that returns the target element or null if the element does not exist.
     * @param callback A function to be called when a change is detected in the target element.
     * @param signal An optional `AbortSignal` that can be used to stop the watcher. Use this in your patch's cleanup function to prevent memory leaks, for example: `abortController.abort()`.
     * @param observerOptions Options for the `MutationObserver`. Defaults to observing `subtree` and `childList` changes.
     * @return A promise that resolves when the watcher has been set up.
     */
    static async watchElement(
        selector: () => HTMLElement | null,
        callback: (disconnect: () => void) => void | Promise<void>,
        observerOptions: MutationObserverInit = {
            subtree: true,
            childList: true,
        },
        signal?: AbortSignal,
    ): Promise<void> {
        signal?.throwIfAborted();

        await this.waitForRender(selector, document.body, signal);
        const el = selector();
        if (!el) return;

        const observer = new MutationObserver(async () => {
            if (!el.isConnected) {
                observer.disconnect();
                return;
            }

            await callback(() => observer.disconnect());
        });

        if (signal) {
            signal.addEventListener("abort", () => observer.disconnect());
        }

        await callback(() => observer.disconnect());

        observer.observe(el, observerOptions);
    }

    /**
     * Watches for the replacement of a specific element and triggers the callback when it is replaced. Runs the callback immediately upon setup.
     * Disconnects automatically if the parent element is removed from the DOM, preventing memory leaks.
     *
     * @example
     * ```typescript
     * DomObservers.watchElementReplacement(
     *   () => document.querySelector('.modal'),
     *   (disconnect) => {
     *     console.log('Modal has been replaced!');
     *     // Call disconnect() to stop watching
     *   },
     *   document.querySelector('#app')
     * );
     * ```
     *
     * @param selector A function that returns the target element or null if the element does not exist.
     * @param callback A function to be called when the target element is replaced.
     * @param parent The root element to observe for changes. You should not use document.body here, since this watcher is long-term and using it would cause observable performance impact. Make sure the parent element exists when calling this method.
     * @param signal An optional `AbortSignal` that can be used to stop the watcher. Use this in your patch's cleanup function to prevent memory leaks, for example: `abortController.abort()`.
     * @returns A promise that resolves when the watcher has been set up.
     */
    static async watchElementReplacement(
        selector: () => HTMLElement | null,
        callback: (disconnect: () => void) => void | Promise<void>,
        parent: HTMLElement,
        signal?: AbortSignal,
    ): Promise<void> {
        signal?.throwIfAborted();

        let currentElement = selector();

        const observer = new MutationObserver(async () => {
            const element = selector();

            if (element && element !== currentElement) {
                currentElement = element;

                if (!parent.isConnected) {
                    observer.disconnect();
                    return;
                }

                await callback(() => observer.disconnect());
            }
        });

        if (signal) {
            signal.addEventListener("abort", () => observer.disconnect());
        }

        if (currentElement) {
            await callback(() => observer.disconnect());
        }

        observer.observe(parent, { subtree: true, childList: true });
    }
}
