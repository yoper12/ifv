import type { Meta } from "./Meta.ts";
import type { Setting } from "./Setting.ts";

/**
 * A patch that can be applied to a webpage.
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
}
