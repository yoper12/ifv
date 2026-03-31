import type { Setting } from "./Setting";

/** Metadata information for a patch. */
export interface Meta {
    /** The name of the patch. */
    name: string;
    /** The unique identifier of the patch. */
    id: string;
    /** A brief description of what the patch does. */
    description: string;
    /** The URL pattern where the patch should be applied. */
    matches: Array<RegExp>;
    /**
     * The types of devices the patch is applicable to.
     *
     * @default ["desktop", "mobile"]
     */
    deviceTypes?: Array<"desktop" | "mobile">;
    /** The settings associated with the patch. */
    settings?: readonly Setting[];
    /**
     * The strategy for running the patch. Want to run on every DOM change? Use `once` here and
     * `DomObservers` from `utils/` in your `init()` function.
     *
     * @default "onUrlChange"
     */
    runStrategy?: "once" | "onUrlChange";
    /**
     * The execution timing of the patch. This simulates the `run_at` property of content scripts in WebExtensions, since using real `run_at` would be ineffective and more resource intensive. `document_start` corrensponds to executing the patch as soon as possible, before any DOM is rendered, `document_end` corrensponds to `DOMContentLoaded` event and `document_idle` corrensponds to `load` event.
     *
     * @default "document_idle"
     * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_scripts#:~:text=only%20mandatory%20key.-,run_at,-String|Check on MDN}
     */
    runAt?: "document_start" | "document_end" | "document_idle";
    /**
     * The JavaScript execution context for the patch.
     *
     * @default "ISOLATED"
     * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_scripts#:~:text=The%20JavaScript%20world%20the%20script%20executes%20in.|Check on MDN}
     */
    world?: "MAIN" | "ISOLATED";
    /**
     * Indicates whether the patch supports dynamic reloading without a full page refresh. If `true`, the
     * patch will be dynamically cleanuped or initialized when user enables or disables it, without needing
     * to refresh the page. If `false`, the patch will require a page refresh to take effect after being
     * enabled or disabled. When set to `true` also modifying the patch's settings will take effect
     * immediately without needing a page refresh, since the patch will be cleanuped and immediately
     * re-initialized with the new settings.
     *
     * Patches heavily modifying the DOM should probably have this set to `false`, since writing a cleanup
     * function for them can be difficult. You should however strive to make your patches support dynamic
     * reloading, since it greatly improves the user experience.
     *
     * @default true
     */
    dynamicReloadReady?: boolean;
}
