import type { Setting } from "@/types/Setting";
import type { Patch, PatchDefWithSettings, PatchDefWithoutSettings, PatchDefinition } from "@/types/Patch";
import type { ElementBuilder } from "./ElementBuilder";
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
 * @param patch The patch configuration object.
 * @returns The same patch configuration object, used for type inference.
 */
export function definePatch<const S extends readonly Setting[]>(patch: PatchDefWithSettings<S>): Patch;
export function definePatch(patch: PatchDefWithoutSettings): Patch;
export function definePatch(patch: PatchDefinition): Patch {
    let styleElement: ElementBuilder<"style"> | null = null;

    return {
        meta: patch.meta,

        async init(settings: Record<string, Setting["defaultValue"]> = {}) {
            if (patch.css && !styleElement) {
                const css = Array.isArray(patch.css) ? patch.css.join("\n") : patch.css;
                styleElement = createElement("style")
                    .setId(`patch-css-${patch.meta.id}`)
                    .setTextContent(css)
                    .appendTo(document.head || document.documentElement);
            }

            if (patch.init) {
                await patch.init(settings);
            }
        },

        async cleanup() {
            if (styleElement) {
                styleElement.remove();
                styleElement = null;
            }

            if (patch.cleanup) {
                await patch.cleanup();
            }
        },
    };
}
