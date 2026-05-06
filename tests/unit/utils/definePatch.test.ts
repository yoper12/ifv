import { definePatch } from "@/utils/definePatch.js";

beforeEach(() => {
    document.head.innerHTML = "";
    document.adoptedStyleSheets = [];

    globalThis.CSSStyleSheet = class {
        cssRules = new Set<string>();
        async replace(css: string) {
            this.cssRules.add(css);
            return this;
        }
    } as unknown as typeof CSSStyleSheet;
});

it("should inject css string and remove it on cleanup", async () => {
    const patch = definePatch({
        css: "body { background: red; }",
        meta: { description: "", id: "test-css", matches: [], name: "" },
    });

    await patch.init({});

    expect(document.adoptedStyleSheets.length).toBe(1);
    expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (document.adoptedStyleSheets[0] as any).cssRules.has(
            "body { background: red; }",
        ),
    ).toBe(true);

    await patch.cleanup();

    expect(document.adoptedStyleSheets).toStrictEqual([]);
});

it("should inject css strings array and remove it on cleanup", async () => {
    const patch = definePatch({
        css: ["body { background: red; }", "p { color: green; }"],
        meta: { description: "", id: "test-css-array", matches: [], name: "" },
    });

    await patch.init({});

    expect(document.adoptedStyleSheets.length).toBe(2);
    expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (document.adoptedStyleSheets[0] as any).cssRules.has(
            "body { background: red; }",
        ),
    ).toBe(true);
    expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (document.adoptedStyleSheets[1] as any).cssRules.has(
            "p { color: green; }",
        ),
    ).toBe(true);

    await patch.cleanup();

    expect(document.adoptedStyleSheets).toStrictEqual([]);
});

it("should pass settings to init and cleanup", async () => {
    const mockInit = vi.fn();
    const mockCleanup = vi.fn();

    const patch = definePatch({
        cleanup: mockCleanup,
        init: mockInit,
        meta: { description: "", id: "test-functions", matches: [], name: "" },
    });

    await patch.init({ color: "#ff0000" });
    expect(mockInit).toHaveBeenCalledOnce();
    expect(mockInit).toHaveBeenCalledWith(
        { color: "#ff0000" },
        expect.any(AbortSignal),
    );

    const passedSignal = mockInit.mock.calls[0]![1];

    await patch.cleanup();
    expect(mockCleanup).toHaveBeenCalledOnce();
    expect(passedSignal.aborted).toBe(true);
});
