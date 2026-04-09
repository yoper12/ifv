import type { Patch, PatchDefWithSettings, PatchDefWithoutSettings, PatchDefinition } from "@/types/Patch";
import type { Setting } from "@/types/Setting";

/**
 * Defines a patch with the provided configuration.
 *
 * @example
 *
 * ```typescript
 * import { definePatch } from "@/utils/definePatch";
 * import css from "./style.css?inline"
 *
 * export default definePatch({
 *   meta: { ... },
 *   css,
 *   init() {
 *     // Patch initialization code here
 *   },
 *   cleanup() {
 *     // Optional cleanup code here
 *   },
 * });
 * ```
 *
 * @param patch The patch configuration object.
 * @returns The same patch configuration object, used for type inference.
 */
export function definePatch<const S extends readonly Setting[]>(patch: PatchDefWithSettings<S>): Patch;
export function definePatch(patch: PatchDefWithoutSettings): Patch;
export function definePatch(patch: PatchDefinition): Patch {
    const injectedStylesheets: CSSStyleSheet[] = [];
    let abortController: AbortController | undefined;

    return {
        meta: patch.meta,

        async init(settings: Record<string, Setting["defaultValue"]> | Record<string, never>) {
            if (patch.css && injectedStylesheets.length === 0) {
                const cssStrings = Array.isArray(patch.css) ? patch.css : [patch.css];

                for (const cssString of cssStrings) {
                    const css = new CSSStyleSheet();
                    await css.replace(cssString);
                    document.adoptedStyleSheets.push(css);
                    injectedStylesheets.push(css);
                }
            }

            if (patch.init) {
                abortController = new AbortController();
                await (patch.init as (settings: unknown, signal: AbortSignal) => void | Promise<void>)(
                    settings,
                    abortController.signal,
                );
            }
        },

        async cleanup() {
            if (injectedStylesheets.length > 0) {
                document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
                    (sheet) => !injectedStylesheets.includes(sheet),
                );
                injectedStylesheets.length = 0;
            }

            if (abortController) {
                abortController.abort();
                abortController = undefined;
            }

            if (patch.cleanup) {
                await patch.cleanup();
            }
        },
    };
}
