import type { Meta } from "./Meta";
import type { Setting } from "./Setting";

/** Defines the API available on the bridge. */
export interface BridgeAPI {
    /**
     * Disables a specific patch.
     *
     * @param patchId - ID of the patch to disable.
     * @returns A promise that resolves when the patch has been disabled.
     */
    disablePatch: (patchId: string) => Promise<void>;
    /**
     * Enables a specific patch.
     *
     * @param patchId - ID of the patch to enable.
     * @returns A promise that resolves when the patch has been enabled.
     */
    enablePatch: (patchId: string) => Promise<void>;
    /**
     * Retrieves the configuration settings for a given patch.
     *
     * @param patchMeta - Metadata defined in patch definition.
     * @returns A promise that resolves to the configuration object for the
     *   patch.
     */
    getPatchSettings: (
        patchMeta: Meta,
    ) => Promise<Record<string, Setting["defaultValue"]>>;
    /**
     * Checks if a specific patch is currently enabled.
     *
     * @param patchId - ID of the patch to check.
     * @returns A promise that resolves to true if the patch is enabled, false
     *   otherwise.
     */
    isPatchEnabled: (patchId: string) => Promise<boolean>;
    /**
     * Saves a new value for a specific setting of a patch.
     *
     * @param patchId - ID of the patch.
     * @param settingId - ID of the setting.
     * @param newValue - The new value to be saved.
     * @returns A promise that resolves when the setting has been saved.
     */
    savePatchSetting: (
        patchId: string,
        settingId: string,
        newValue: Setting["defaultValue"],
    ) => Promise<void>;
    /**
     * Toggles the enabled state of a specific patch.
     *
     * @param patchId - ID of the patch to toggle.
     * @returns A promise that resolves to the new enabled state.
     */
    togglePatch: (patchId: string) => Promise<boolean>;
}

/** Represents an event emitted from the bridge server to the client. */
export interface BridgeEvent {
    /**
     * The data payload associated with the event. This can be of any type and
     * is defined by the server when emitting the event.
     */
    data: unknown;
    /** The name of the event being emitted. */
    eventName: string;
}

/** Represents a request sent from the bridge client to the server. */
export interface BridgeRequest {
    /** An array of arguments to be passed to the server method. */
    args: unknown[];
    /** A unique identifier for the request, used to match responses to requests. */
    id: string;
    /** The name of the method being called on the server. */
    method: string;
}

/** Represents a response sent from the bridge server back to the client. */
export interface BridgeResponse {
    /**
     * If `success` is true, this field contains the data returned by the server
     * method. Otherwise, it may be undefined.
     */
    data?: unknown;
    /**
     * If `success` is false, this field contains an error message describing
     * what went wrong. Otherwise, it may be undefined.
     */
    error?: string;
    /**
     * The unique identifier of the original request that this response
     * corresponds to.
     */
    id: string;
    /**
     * A boolean indicating whether the server successfully processed the
     * request.
     */
    success: boolean;
}

/**
 * Represents a message sent through the MessageChannel between the client and
 * server.
 *
 * @param type - The type of the message, which can be one of "BRIDGE_REQUEST",
 *   "BRIDGE_RESPONSE", or "EVENT".
 * @param payload - The payload of the message, varies on the type.
 */
export type PortMessage =
    | { payload: BridgeEvent; type: "EVENT" }
    | { payload: BridgeRequest; type: "BRIDGE_REQUEST" }
    | { payload: BridgeResponse; type: "BRIDGE_RESPONSE" };
