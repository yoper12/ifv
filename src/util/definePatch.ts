import type { Setting } from "../types/Setting.ts";
import type {
    Patch,
    PatchDefWithSettings,
    PatchDefWithoutSettings,
    PatchDefinition,
} from "../types/Patch.ts";
import type { ElementBuilder } from "./ElementBuilder.ts";
import { createElement } from "./ElementBuilder.ts";

/**
 * Defines a patch with the provided configuration.
 *
 * @param patch The patch configuration object.
 * @returns The same patch configuration object, used for type inference.
 *
 * @example
 * ```typescript
 * import { definePatch } from "../types/Patch.ts";
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
 */
export function definePatch<const S extends readonly Setting[]>(
    patch: PatchDefWithSettings<S>,
): Patch;
export function definePatch(patch: PatchDefWithoutSettings): Patch;
export function definePatch(patch: PatchDefinition): Patch {
    let styleElement: ElementBuilder<"style"> | null = null;

    return {
        meta: patch.meta,

        async init(settings: Record<string, Setting["defaultValue"]> = {}) {
            if (patch.css && !styleElement) {
                const css = Array.isArray(patch.css)
                    ? patch.css.join("\n")
                    : patch.css;
                styleElement = createElement("style")
                    .setId(`patch-css-${patch.meta.id}`)
                    .setTextContent(css)
                    .appendTo(document.head);
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
