import type { Meta } from "./Meta.ts";
import type { Setting } from "./Setting.ts";

interface PatchWithSettings<S extends readonly Setting[]> {
    /**
     * Metadata information for a patch.
     */
    meta: Omit<Meta, "settings"> & { settings: S };
    /**
     * The initialization function for the patch.
     *
     * @param settings The configuration settings for the patch.
     */
    init: (settings: InferSettings<S>) => void | Promise<void>;
    /**
     * Optional cleanup function.
     * Should remove event listeners, disconnect observers, and remove injected DOM element if the patch needs to be unloaded (e.g., on URL change or toggle off).
     */
    cleanup?: () => void | Promise<void>;
}

interface PatchWithoutSettings {
    /**
     * Metadata information for a patch.
     */
    meta: Omit<Meta, "settings">;
    /**
     * The initialization function for the patch.
     */
    init: () => void | Promise<void>;
    /**
     * Optional cleanup function.
     * Should remove event listeners, disconnect observers, and remove injected DOM element if the patch needs to be unloaded (e.g., on URL change or toggle off).
     */
    cleanup?: () => void | Promise<void>;
}

/**
 * A patch that can be applied to a webpage.
 */
export type Patch =
    | PatchWithSettings<readonly Setting[]>
    | PatchWithoutSettings;

/**
 * Defines a patch with the provided configuration.
 *
 * @example
 * ```typescript
 * import { definePatch } from "../types/Patch.ts";
 *
 * export default definePatch({
 *   meta: { ... },
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
export function definePatch<const S extends readonly Setting[]>(
    patch: PatchWithSettings<S>,
): PatchWithSettings<S>;
export function definePatch(patch: PatchWithoutSettings): PatchWithoutSettings;
export function definePatch(patch: Patch): Patch {
    return patch;
}

/**
 * Infers the settings object type from an array of settings definitions.
 */
type InferSettings<S extends readonly Setting[]> = {
    [K in S[number] as K["id"]]: SettingValueType<K>;
} & {};

/**
 * Maps a setting definition to its object type.
 */
type SettingValueType<S extends Setting> = S["type"] extends "boolean"
    ? boolean
    : S["type"] extends "number"
      ? number
      : S["type"] extends "multiselect"
        ? S extends { options: { value: infer V }[] }
            ? V[]
            : string[]
        : S["type"] extends "select"
          ? S extends { options: { value: infer V }[] }
              ? V
              : string
          : string;
