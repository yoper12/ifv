import type { Meta } from "./Meta";
import type { Setting } from "./Setting";

export interface PatchDefWithSettings<S extends readonly Setting[]> {
    /** Metadata information for a patch. */
    meta: Omit<Meta, "settings"> & { settings: S };
    /**
     * Optional CSS string or an array of CSS strings to be applied when the patch is active.
     *
     * @example
     *
     * ```typescript
     * import css1 from "./style1.css?inline"
     * import css2 from "./style2.css?inline"
     *
     * export default definePatch({
     *   meta: { ... },
     *   css: [css1, css2],
     * });
     * ```
     */
    css?: string | Array<string>;
    /**
     * Opitional initialization function for the patch.
     *
     * @param settings The configuration settings for the patch.
     */
    init?: (settings: InferSettings<S>) => void | Promise<void>;
    /**
     * Optional cleanup function. Should remove event listeners, disconnect observers, and remove injected
     * DOM element if the patch needs to be unloaded (e.g., on URL change or toggle off).
     *
     * **This function is never called if you set `runStrategy` to `"once"` in the patch's metadata, since
     * the patch will never be unloaded in that case.**
     */
    cleanup?: () => void | Promise<void>;
}

export interface PatchDefWithoutSettings {
    /** Metadata information for a patch. */
    meta: Omit<Meta, "settings">;
    /**
     * Optional CSS string or an array of CSS strings to be applied when the patch is active.
     *
     * @example
     *
     * ```typescript
     * import css1 from "./style1.css?inline"
     * import css2 from "./style2.css?inline"
     *
     * export default definePatch({
     *   meta: { ... },
     *   css: [css1, css2],
     * });
     * ```
     */
    css?: string | Array<string>;
    /**
     * Opitional initialization function for the patch.
     *
     * @param settings The configuration settings for the patch.
     */
    init?: () => void | Promise<void>;
    /**
     * Optional cleanup function. Should remove event listeners, disconnect observers, and remove injected
     * DOM element if the patch needs to be unloaded (e.g., on URL change or toggle off).
     *
     * **This function is never called if you set `runStrategy` to `"once"` in the patch's metadata, since
     * the patch will never be unloaded in that case.**
     */
    cleanup?: () => void | Promise<void>;
}

export type PatchDefinition = PatchDefWithSettings<readonly Setting[]> | PatchDefWithoutSettings;

export interface Patch {
    meta: Meta;
    init: (settings?: Record<string, Setting["defaultValue"]>) => void | Promise<void>;
    cleanup: () => void | Promise<void>;
}

/** Infers the settings object type from an array of settings definitions. */
type InferSettings<S extends readonly Setting[]> = { [K in S[number] as K["id"]]: SettingValueType<K> } & {};

/** Maps a setting definition to its object type. */
type SettingValueType<S extends Setting> =
    S["type"] extends "switch" ? boolean
    : S["type"] extends "number" ? number
    : S["type"] extends "multiselect" ?
        S extends { options: { value: infer V }[] } ?
            V[]
        :   string[]
    : S["type"] extends "select" ?
        S extends { options: { value: infer V }[] } ?
            V
        :   string
    :   string;
