import { definePatch } from "@/utils/definePatch.js";

beforeEach(() => {
    document.head.innerHTML = "";
});

it("should inject css and remove it on cleanup", async () => {
    const patch = definePatch({
        meta: { id: "test-css", name: "", description: "", matches: [] },
        css: "body { background: red; }",
    });

    await patch.init({});

    const styleElement = document.querySelector("#patch-css-test-css");
    expect(styleElement).not.toBeNull();
    expect(styleElement?.textContent).toBe("body { background: red; }");

    await patch.cleanup();

    expect(document.querySelector("#patch-css-test-css")).toBeNull();
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
    expect(mockInit).toHaveBeenCalledWith({ color: "#ff0000" }, expect.anything());

    await patch.cleanup();
    expect(mockCleanup).toHaveBeenCalledOnce();
});
