import type { Meta } from "./Meta.ts";
import type { Setting } from "./Setting.ts";

/**
 * A patch that can be applied to a webpage.
 *
 * @template SettingsType The interface defining the settings for this patch.
 * This allows for strict typing of the `settings` object passed to the `init` function.
 *
 * @example
 * ```typescript
 * interface MyPatchSettings {
 *   darkMode: boolean;
 *   accentColor: "blue" | "red";
 * }
 *
 * export const myPatch: Patch<MyPatchSettings> = {
 *   meta: { ... },
 *   init: (settings) => {
 *     // settings is strictly typed here!
 *     if (settings?.darkMode) { ... }
 *   }
 * };
 * ```
 */
export interface Patch<
    SettingsType = Record<string, Setting["defaultValue"]> | undefined,
> {
    /**
     * Metadata information for a patch.
     */
    meta: Meta;
    /**
     * The initialization function for the patch.
     *
     * @param settings The configuration settings for the patch.
     */
    init: (settings?: SettingsType) => void | Promise<void>;
    /**
     * Optional cleanup function.
     * Should remove event listeners, disconnect observers, and remove injected DOM element if the patch needs to be unloaded (e.g., on URL change or toggle off).
     */
    cleanup?: () => void | Promise<void>;
}
