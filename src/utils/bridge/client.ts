import type { BridgeAPI, BridgeRequest, PortMessage } from "@/types/Bridge";

import { Logger } from "../Logger";

let bridgePort: MessagePort | undefined;
let initPromise: Promise<MessagePort> | undefined;

type EventCallback = (data: unknown) => void;
const eventListeners: Record<string, Set<EventCallback>> = {};

const pendingRequests: Record<
    string,
    { reject: (error: Error) => void; resolve: (data: unknown) => void }
> = {};

/**
 * Sends a request to the bridge server to invoke a specific method with the
 * provided arguments. Rejects if an error occurs or if no response is received
 * within 5 seconds.
 *
 * @param method - The name of the method to invoke on the bridge server.
 * @param args - Arguments to pass to the server method.
 * @returns A promise that resolves with the response data from the server or
 *   rejects with an error if the request fails or times out.
 */
export async function callIsolated<K extends keyof BridgeAPI>(
    method: K,
    ...arguments_: Parameters<BridgeAPI[K]>
): Promise<Awaited<ReturnType<BridgeAPI[K]>>> {
    const port = await getPort();

    return new Promise<Awaited<ReturnType<BridgeAPI[K]>>>((resolve, reject) => {
        const id = crypto.randomUUID();

        const timeoutId = setTimeout(() => {
            delete pendingRequests[id];
            resetConnection();
            reject(
                new Error(
                    `No response received for method '${method}' within timeout period.`,
                ),
            );
        }, 5000);

        pendingRequests[id] = {
            reject: (error) => {
                clearTimeout(timeoutId);
                reject(error);
            },
            resolve: (data) => {
                clearTimeout(timeoutId);
                resolve(data as Awaited<ReturnType<BridgeAPI[K]>>);
            },
        };

        const request: BridgeRequest = { args: arguments_, id, method };
        const message: PortMessage = {
            payload: request,
            type: "BRIDGE_REQUEST",
        };

        port.postMessage(JSON.stringify(message));
    });
}

/**
 * Registers a callback function to be invoked when a specific event is emitted
 * from the bridge server. The callback will receive the data payload associated
 * with the event whenever it occurs. This allows the client to react to
 * asynchronous events sent by the server.
 *
 * @param eventName - The name of the event to listen for from the bridge
 *   server.
 * @param callback - A function to be called with the event data whenever the
 *   specified event is emitted by the server.
 * @returns A promise that resolves once the event listener has been registered
 *   and the bridge connection is established.
 */
export async function onExtensionEvent<T = unknown>(
    eventName: string,
    callback: (data: T) => void,
) {
    await getPort();

    if (!eventListeners[eventName]) {
        eventListeners[eventName] = new Set();
    }
    eventListeners[eventName].add(callback as EventCallback);
}

/**
 * Initializes the bridge client by establishing a connection to the bridge
 * server through a MessageChannel. It listens for messages from the server and
 * routes them to the appropriate handlers based on their type (requests,
 * responses, or events).
 *
 * @returns A promise that resolves to the connected MessagePort for
 *   communication with the bridge server.
 */
async function getPort() {
    if (bridgePort) return bridgePort;
    if (initPromise) return initPromise;

    initPromise = new Promise((resolve) => {
        function onWindowMessage(event: MessageEvent) {
            if (
                // eslint-disable-next-line unicorn/prefer-global-this
                event.source !== window
                || !event.data
                || event.data.source !== "hephaestus-bridge"
            )
                return;

            if (event.data.type === "BRIDGE_READY") {
                window.removeEventListener("message", onWindowMessage);
                clearInterval(pingInterval);

                const channel = new MessageChannel();
                bridgePort = channel.port1;

                bridgePort.addEventListener("message", (event) => {
                    const data: PortMessage = JSON.parse(event.data);

                    if (data.type === "BRIDGE_RESPONSE") {
                        const response = data.payload;
                        if (pendingRequests[response.id]) {
                            if (response.success)
                                pendingRequests[response.id]?.resolve(
                                    response.data,
                                );
                            else
                                pendingRequests[response.id]?.reject(
                                    new Error(
                                        `Bridge error: ${response.error}`,
                                    ),
                                );
                            delete pendingRequests[response.id];
                        }
                    } else if (data.type === "EVENT") {
                        const payload = data.payload;
                        const listeners = eventListeners[payload.eventName];
                        if (listeners) {
                            for (const callback of listeners)
                                callback(payload.data);
                        }
                    }
                });

                bridgePort.addEventListener("messageerror", () => {
                    resetConnection();
                });

                window.postMessage(
                    { source: "hephaestus-bridge", type: "INIT_BRIDGE" },
                    "*",
                    [channel.port2],
                );
                resolve(bridgePort);
            }
        }

        window.addEventListener("message", onWindowMessage);

        const pingInterval = globalThis.setInterval(() => {
            window.postMessage(
                { source: "hephaestus-bridge", type: "CLIENT_PING" },
                "*",
            );
        }, 50);
    });

    return initPromise;
}

function resetConnection() {
    if (bridgePort) {
        bridgePort.close();
        bridgePort = undefined;
    }
    initPromise = undefined;
    Logger.info("Bridge connection reset due to error or timeout.");
}
