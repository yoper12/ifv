import type { ElementBuilder } from "./ElementBuilder";
import { createElement } from "./ElementBuilder";
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
    let styleElement: ElementBuilder<"style"> | null = null;
    let abortController: AbortController | null = null;

    return {
        meta: patch.meta,

        async init(settings: Record<string, Setting["defaultValue"]> | Record<string, never>) {
            if (patch.css && !styleElement) {
                const css = Array.isArray(patch.css) ? patch.css.join("\n") : patch.css;
                styleElement = createElement("style")
                    .setId(`patch-css-${patch.meta.id}`)
                    .setTextContent(css)
                    .appendTo(document.head || document.documentElement);
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
            if (styleElement) {
                styleElement.remove();
                styleElement = null;
            }

            if (abortController) {
                abortController.abort();
                abortController = null;
            }

            if (patch.cleanup) {
                await patch.cleanup();
            }
        },
    };
}
