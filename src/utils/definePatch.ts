import type {
    Patch,
    PatchDefinition,
    PatchDefinitionWithoutSettings,
    PatchDefinitionWithSettings,
} from "@/types/Patch";
import type { Setting } from "@/types/Setting";

import { createElement } from "./ElementBuilder";

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
 * @param patch - The patch configuration object.
 * @returns The same patch configuration object, used for type inference.
 */
export function definePatch<const S extends readonly Setting[]>(
    patch: PatchDefinitionWithSettings<S>,
): Patch;
export function definePatch(patch: PatchDefinitionWithoutSettings): Patch;
export function definePatch(patch: PatchDefinition): Patch {
    const injectedStylesheets: CSSStyleSheet[] = [];
    let abortController: AbortController | undefined;

    return {
        async cleanup() {
            if (injectedStylesheets.length > 0) {
                document.adoptedStyleSheets =
                    document.adoptedStyleSheets.filter(
                        (sheet) => !injectedStylesheets.includes(sheet),
                    );
                injectedStylesheets.length = 0;
            }

            document.querySelector(`#patch-style-${patch.meta.id}`)?.remove();

            if (abortController) {
                abortController.abort();
                abortController = undefined;
            }

            if (patch.cleanup) {
                await patch.cleanup();
            }
        },

        async init(
            settings:
                | Record<string, never>
                | Record<string, Setting["defaultValue"]>,
        ) {
            if (patch.css && injectedStylesheets.length === 0) {
                if (document.adoptedStyleSheets?.push === undefined) {
                    const cssString =
                        Array.isArray(patch.css) ?
                            patch.css.join("\n")
                        :   patch.css;

                    createElement("style")
                        .id(`patch-style-${patch.meta.id}`)
                        .text(cssString)
                        .appendTo(document.head ?? document.documentElement);
                } else {
                    const cssStrings =
                        Array.isArray(patch.css) ? patch.css : [patch.css];

                    for (const cssString of cssStrings) {
                        const css = new CSSStyleSheet();
                        await css.replace(cssString);
                        document.adoptedStyleSheets.push(css);
                        injectedStylesheets.push(css);
                    }
                }
            }

            if (patch.init) {
                abortController = new AbortController();
                await (
                    patch.init as (
                        settings: unknown,
                        signal: AbortSignal,
                    ) => Promise<void> | void
                )(settings, abortController.signal);
            }
        },

        meta: patch.meta,
    };
}
