import * as DomObservers from "@/utils/DomObservers";

beforeEach(() => {
    document.body.innerHTML = "";
});

describe("waitForRender", () => {
    it("should resolve if the element is already present", async () => {
        const div = document.createElement("div");
        div.id = "test-element";
        document.body.append(div);

        await expect(
            DomObservers.waitForRender(
                () => document.querySelector("#test-element") as HTMLElement,
            ),
        ).resolves.toBeUndefined();
    });

    it("should resolve when the element is added to the DOM", async () => {
        let isResolved = false;

        const promise = DomObservers.waitForRender(
            () => document.querySelector("#test-element") as HTMLElement,
        ).then(() => (isResolved = true));

        expect(isResolved).toBe(false);

        const div = document.createElement("div");
        div.id = "test-element";
        document.body.append(div);

        await promise;

        expect(isResolved).toBe(true);
    });

    it("should reject on abort", async () => {
        const controller = new AbortController();

        const promise = expect(
            DomObservers.waitForRender(
                () => document.querySelector("#test-element") as HTMLElement,
                document.body,
                controller.signal,
            ),
        ).rejects.toThrow("Aborted");

        controller.abort();

        await promise;
    });

    it("should throw when the parent element is removed", async () => {
        const parent = document.createElement("div");
        document.body.append(parent);

        const promise = expect(
            DomObservers.waitForRender(
                () => document.querySelector("#test-element") as HTMLElement,
                parent,
            ),
        ).rejects.toThrow(
            "Parent element disconnected while waiting for render.",
        );

        parent.remove();
        parent.append(document.createElement("div")); // Trigger mutation observer to detect disconnection

        await promise;
    });
});

describe("waitForReplacement", () => {
    it("should resolve if the element isn't present and then gets rendered", async () => {
        let isResolved = false;

        const promise = DomObservers.waitForReplacement(
            () => document.querySelector("#test-element") as HTMLElement,
        ).then(() => (isResolved = true));

        expect(isResolved).toBe(false);

        const div = document.createElement("div");
        div.id = "test-element";
        document.body.append(div);

        await promise;

        expect(isResolved).toBe(true);
    });

    it("should resolve when the element gets replaced", async () => {
        let isResolved = false;

        const initialDiv = document.createElement("div");
        initialDiv.id = "test-element";
        document.body.append(initialDiv);

        const promise = DomObservers.waitForReplacement(
            () => document.querySelector("#test-element") as HTMLElement,
        ).then(() => (isResolved = true));

        expect(isResolved).toBe(false);

        const newDiv = document.createElement("div");
        newDiv.id = "test-element";
        document.body.replaceChild(newDiv, initialDiv);

        await promise;

        expect(isResolved).toBe(true);
    });

    it("should reject on abort", async () => {
        const controller = new AbortController();

        const promise = expect(
            DomObservers.waitForReplacement(
                () => document.querySelector("#test-element") as HTMLElement,
                document.body,
                controller.signal,
            ),
        ).rejects.toThrow("Aborted");

        controller.abort();

        await promise;
    });

    it("should throw when the parent element is removed", async () => {
        const parent = document.createElement("div");
        document.body.append(parent);

        const promise = expect(
            DomObservers.waitForReplacement(
                () => document.querySelector("#test-element") as HTMLElement,
                parent,
            ),
        ).rejects.toThrow(
            "Parent element disconnected while waiting for render.",
        );

        parent.remove();
        parent.append(document.createElement("div")); // Trigger mutation observer to detect disconnection

        await promise;
    });
});

describe("watchElement", () => {
    it("should run the callback upon setup and on changes", async () => {
        const mockCallback = vi.fn();

        const div = document.createElement("div");
        div.id = "test-element";
        document.body.append(div);

        await DomObservers.watchElement(
            () => document.querySelector("#test-element") as HTMLElement,
            mockCallback,
        );

        expect(mockCallback).toHaveBeenCalledTimes(1);

        div.textContent = "Changed";
        await Promise.resolve(); // Wait one event loop tick for the mutation observer to trigger

        expect(mockCallback).toHaveBeenCalledTimes(2);
    });

    it("should disconnect when passed disconnect function is called", async () => {
        const mockCallback = vi.fn();

        const div = document.createElement("div");
        div.id = "test-element";
        document.body.append(div);

        await DomObservers.watchElement(
            () => document.querySelector("#test-element") as HTMLElement,
            (disconnect) => {
                mockCallback();
                disconnect();
            },
        );

        expect(mockCallback).toHaveBeenCalledTimes(1);

        div.textContent = "Changed";
        await Promise.resolve(); // Wait one event loop tick for the mutation observer to trigger

        expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it("should disconnect on abort", async () => {
        const mockCallback = vi.fn();

        const div = document.createElement("div");
        div.id = "test-element";
        document.body.append(div);

        const controller = new AbortController();

        await DomObservers.watchElement(
            () => document.querySelector("#test-element") as HTMLElement,
            () => {
                mockCallback();
            },
            { childList: true, subtree: true },
            controller.signal,
        );

        expect(mockCallback).toHaveBeenCalledTimes(1);

        controller.abort();

        div.textContent = "Changed";
        await Promise.resolve(); // Wait one event loop tick for the mutation observer to trigger

        expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it("should disconnect when the element is removed from the DOM", async () => {
        const mockCallback = vi.fn();

        const div = document.createElement("div");
        div.id = "test-element";
        document.body.append(div);

        await DomObservers.watchElement(
            () => document.querySelector("#test-element") as HTMLElement,
            mockCallback,
        );

        expect(mockCallback).toHaveBeenCalledTimes(1);

        div.remove();
        await Promise.resolve(); // Wait one event loop tick for the mutation observer to trigger

        div.textContent = "Changed";
        await Promise.resolve();
        document.body.append(div);
        await Promise.resolve();

        expect(mockCallback).toHaveBeenCalledTimes(1);
    });
});

describe("watchElementReplacement", () => {
    it("should run the callback when the element gets replaced", async () => {
        const mockCallback = vi.fn();

        const initialDiv = document.createElement("div");
        initialDiv.id = "test-element";
        document.body.append(initialDiv);

        await DomObservers.watchElementReplacement(
            () => document.querySelector("#test-element") as HTMLElement,
            mockCallback,
            document.body,
        );

        expect(mockCallback).toHaveBeenCalledTimes(1);

        const newDiv = document.createElement("div");
        newDiv.id = "test-element";
        document.body.replaceChild(newDiv, initialDiv);
        await Promise.resolve(); // Wait one event loop tick for the mutation observer to trigger

        expect(mockCallback).toHaveBeenCalledTimes(2);
    });

    it("should disconnect when passed disconnect function is called", async () => {
        const mockCallback = vi.fn();

        const initialDiv = document.createElement("div");
        initialDiv.id = "test-element";
        document.body.append(initialDiv);

        await DomObservers.watchElementReplacement(
            () => document.querySelector("#test-element") as HTMLElement,
            (disconnect) => {
                mockCallback();
                disconnect();
            },
            document.body,
        );

        expect(mockCallback).toHaveBeenCalledTimes(1);

        const newDiv = document.createElement("div");
        newDiv.id = "test-element";
        document.body.replaceChild(newDiv, initialDiv);
        await Promise.resolve(); // Wait one event loop tick for the mutation observer to trigger

        expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it("should disconnect on abort", async () => {
        const mockCallback = vi.fn();

        const initialDiv = document.createElement("div");
        initialDiv.id = "test-element";
        document.body.append(initialDiv);

        const controller = new AbortController();

        await DomObservers.watchElementReplacement(
            () => document.querySelector("#test-element") as HTMLElement,
            () => {
                mockCallback();
            },
            document.body,
            controller.signal,
        );

        expect(mockCallback).toHaveBeenCalledTimes(1);

        controller.abort();

        const newDiv = document.createElement("div");
        newDiv.id = "test-element";
        document.body.replaceChild(newDiv, initialDiv);
        await Promise.resolve(); // Wait one event loop tick for the mutation observer to trigger

        expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it("should disconnect when the parent element is removed from the DOM", async () => {
        const mockCallback = vi.fn();

        const parent = document.createElement("div");
        document.body.append(parent);

        const initialDiv = document.createElement("div");
        initialDiv.id = "test-element";
        parent.append(initialDiv);

        await DomObservers.watchElementReplacement(
            () => document.querySelector("#test-element") as HTMLElement,
            mockCallback,
            parent,
        );

        expect(mockCallback).toHaveBeenCalledTimes(1);

        parent.remove();
        parent.append(document.createElement("div")); // Trigger mutation observer to detect disconnection

        const newDiv = document.createElement("div");
        newDiv.id = "test-element";
        parent.append(newDiv);
        await Promise.resolve(); // Wait one event loop tick for the mutation observer to trigger

        expect(mockCallback).toHaveBeenCalledTimes(1);
    });
});
