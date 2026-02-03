import type { Meta } from "./Meta.ts";

/**
 * A patch that can be applied to a webpage.
 */
export interface Patch<ConfigType = Record<string, any> | undefined> {
    /**
     * Metadata information for a patch.
     */
    meta: Meta;
    /**
     * The initialization function for the patch.
     *
     * @param config The configuration settings for the patch.
     */
    init: (config?: ConfigType) => void | Promise<void>;
}
