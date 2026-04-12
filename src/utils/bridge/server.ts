import type {
    BridgeAPI,
    BridgeEvent,
    BridgeResponse,
    PortMessage,
} from "@/types/Bridge";

let connectedPort: MessagePort;

/**
 * Initializes the bridge server by setting up a message listener on the window object to handle incoming connection requests from the bridge client. When a client attempts to connect, it establishes a MessageChannel for communication and listens for incoming requests from the client. The server processes these requests by invoking the corresponding methods provided in the `exposedMethods` object and sends back responses with the results or error messages.
 *
 * @param exposedMethods An object containing the methods that the bridge server will expose to the client.
 */
export function initBridgeServer(exposedMethods: BridgeAPI) {
    async function onWindowMessage(event: MessageEvent) {
        if (
            event.source !== window
            || !event.data
            || event.data.source !== "hephaestus-bridge"
        )
            return;

        if (event.data.type === "CLIENT_PING") {
            window.postMessage(
                { source: "hephaestus-bridge", type: "BRIDGE_READY" },
                "*",
            );
        } else if (
            event.data.type === "INIT_BRIDGE"
            && event.ports
            && event.ports.length > 0
        ) {
            window.removeEventListener("message", onWindowMessage);

            connectedPort = event.ports[0];

            connectedPort.onmessage = async (e) => {
                const data: PortMessage = JSON.parse(e.data);

                if (data.type === "BRIDGE_REQUEST") {
                    const req = data.payload;
                    const response: BridgeResponse = {
                        id: req.id,
                        success: false,
                    };

                    try {
                        const methodKey = req.method as keyof BridgeAPI;
                        const method = exposedMethods[methodKey];

                        if (typeof method === "function") {
                            const callableMethod = method as (
                                ...args: unknown[]
                            ) => unknown;
                            response.data = await callableMethod(...req.args);
                            response.success = true;
                        } else {
                            response.error = `Method '${req.method}' not initialized on bridge server`;
                        }
                    } catch (err) {
                        response.error =
                            err instanceof Error ? err.message : String(err);
                    }

                    const responseMessage: PortMessage = {
                        type: "BRIDGE_RESPONSE",
                        payload: response,
                    };
                    connectedPort?.postMessage(JSON.stringify(responseMessage));
                }
            };
        }
    }

    window.addEventListener("message", onWindowMessage);

    window.postMessage(
        { source: "hephaestus-bridge", type: "BRIDGE_READY" },
        "*",
    );
}

/**
 * Emits an event from the bridge server to all connected clients. The event is identified by its name and can carry an associated data payload. Clients that have registered listeners for the specified event name will receive the event data when it is emitted. This allows the server to notify clients of asynchronous occurrences or changes in state without requiring a direct request from the client.
 *
 * @param eventName The name of the event to emit to the clients. Clients can listen for this event name to receive the associated data when the event is emitted.
 * @param data The data payload to send along with the event. This can be of any type and will be received by clients that are listening for the specified event name.
 */
export function emitExtensionEvent(eventName: string, data: unknown) {
    if (!connectedPort) return;

    const payload: BridgeEvent = { eventName, data };
    const message: PortMessage = { type: "EVENT", payload };

    connectedPort.postMessage(JSON.stringify(message));
}
