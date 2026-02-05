import type { Setting } from "./Setting.ts";

/**
 * Metadata information for a patch.
 */
export interface Meta {
    /**
     * The name of the patch.
     */
    name: string;
    /**
     * The unique identifier of the patch.
     */
    id: string;
    /**
     * A brief description of what the patch does.
     */
    description: string;
    /**
     * The URL pattern where the patch should be applied.
     */
    matches: Array<RegExp>;
    /**
     * The settings associated with the patch.
     */
    settings?: readonly Array<Setting>;
    /**
     * The strategy for running the patch.
     * Want to run on every DOM change? Use `once` here and `watchElement.ts` from `utils/` in your `init()` function.
     *
     * @default "onUrlChange"
     */
    runStrategy?: "once" | "onUrlChange";
    /**
     * The execution timing of the patch.
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
}
