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
        meta: { id: "test-css", name: "", description: "", matches: [] },
        css: "body { background: red; }",
    });

    await patch.init({});

    expect(document.adoptedStyleSheets.length).toBe(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((document.adoptedStyleSheets[0] as any).cssRules.has("body { background: red; }")).toBe(true);

    await patch.cleanup();

    expect(document.adoptedStyleSheets).toStrictEqual([]);
});

it("should inject css strings array and remove it on cleanup", async () => {
    const patch = definePatch({
        meta: { id: "test-css-array", name: "", description: "", matches: [] },
        css: ["body { background: red; }", "p { color: green; }"],
    });

    await patch.init({});

    expect(document.adoptedStyleSheets.length).toBe(2);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((document.adoptedStyleSheets[0] as any).cssRules.has("body { background: red; }")).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((document.adoptedStyleSheets[1] as any).cssRules.has("p { color: green; }")).toBe(true);

    await patch.cleanup();

    expect(document.adoptedStyleSheets).toStrictEqual([]);
});

it("should pass settings to init and cleanup", async () => {
    const mockInit = vi.fn();
    const mockCleanup = vi.fn();

    const patch = definePatch({
        meta: { id: "test-functions", name: "", description: "", matches: [] },
        init: mockInit,
        cleanup: mockCleanup,
    });

    await patch.init({ color: "#ff0000" });
    expect(mockInit).toHaveBeenCalledOnce();
    expect(mockInit).toHaveBeenCalledWith({ color: "#ff0000" }, expect.any(AbortSignal));

    const passedSignal = mockInit.mock.calls[0][1];

    await patch.cleanup();
    expect(mockCleanup).toHaveBeenCalledOnce();
    expect(passedSignal.aborted).toBe(true);
});
