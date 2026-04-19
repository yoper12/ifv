import type { Meta } from "./Meta";
import type { Setting } from "./Setting";

export interface Patch {
    cleanup: () => Promise<void> | void;
    init: (
        settings: Record<string, Setting["defaultValue"]>,
    ) => Promise<void> | void;
    meta: Meta;
}

export type PatchDefinition =
    | PatchDefinitionWithoutSettings
    | PatchDefinitionWithSettings<readonly Setting[]>;

export interface PatchDefinitionWithoutSettings {
    /**
     * Optional cleanup function. Should reverse any changes made by the patch
     * in the `init` function, such as removing injected DOM elements. You
     * should always check whether the elements you want to modify still exist
     * in the DOM, as the website could have already removed them. You don't
     * need to worry about removing event listeners or mutation observers if you
     * used the provided `AbortSignal` in your `init` function, since they will
     * be automatically aborted.
     *
     * This function is called when the patch needs to be unloaded, e.g. the
     * user toggles it off or the patch is no longer applicable due to a URL
     * change.
     */
    cleanup?: () => Promise<void> | void;
    /**
     * Optional CSS string or an array of CSS strings to be applied when the
     * patch is active.
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
    css?: Array<string> | string;
    /**
     * Opitional initialization function for the patch.
     *
     * @param settings - The configuration settings for the patch.
     * @param signal - An AbortSignal instance that will be automatically
     *   triggered during patch cleanup. You should use this signal to
     *   automatically abort any ongoing asynchronous operations in your patch
     *   during unloading to avoid performing actions after the patch has been
     *   unloaded.
     */
    init?: (
        settings: Record<PropertyKey, never>,
        signal: AbortSignal,
    ) => Promise<void> | void;
    /** Metadata information for a patch. */
    meta: Omit<Meta, "settings">;
}

export interface PatchDefinitionWithSettings<S extends readonly Setting[]> {
    /**
     * Optional cleanup function. Should reverse any changes made by the patch
     * in the `init` function, such as removing injected DOM elements. You
     * should always check whether the elements you want to modify still exist
     * in the DOM, as the website could have already removed them. You don't
     * need to worry about removing event listeners or mutation observers if you
     * used the provided `AbortSignal` in your `init` function, since they will
     * be automatically aborted in that case.
     *
     * This function is called when the patch needs to be unloaded, e.g. the
     * user toggles it off or the patch is no longer applicable due to a URL
     * change.
     */
    cleanup?: () => Promise<void> | void;
    /**
     * Optional CSS string or an array of CSS strings to be applied when the
     * patch is active.
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
    css?: Array<string> | string;
    /**
     * Opitional initialization function for the patch.
     *
     * @param settings - The configuration settings for the patch.
     * @param signal - An AbortSignal instance that will be automatically
     *   triggered during patch cleanup. You should use this signal to
     *   automatically abort any ongoing asynchronous operations in your patch
     *   during unloading to avoid performing actions after the patch has been
     *   unloaded.
     */
    init?: (
        settings: InferSettings<S>,
        signal: AbortSignal,
    ) => Promise<void> | void;
    /** Metadata information for a patch. */
    meta: Omit<Meta, "settings"> & { settings: S };
}

/** Infers the settings object type from an array of settings definitions. */
type InferSettings<S extends readonly Setting[]> = {
    [K in S[number] as K["id"]]: SettingValueType<K>;
} & {};

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
