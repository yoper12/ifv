/**
 * A helper function to create URLPattern objects.
 * @param path A string representing the pathname pattern. E.g. "*\/oceny". To match all paths use "*".
 *
 * @example
 * ```typescript
 * // Matches URLs with any hostname and path starting with "/oceny"
 * route("/oceny*");
 *
 * // Matches all URLs
 * route("*");
 * ```
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URLPattern/pathname|Check on MDN}
 */
export function route(path: string): URLPattern;
/**
 * A helper function to create URLPattern objects.
 * @param options An object containing any of the following optional properties: `host`, `path` and `hash`. Each property corresponds to the respective component of a URL and accepts the same patterns as the URLPattern API.
 *
 * @example
 *
 * ```typescript
 * // Matches URLs with hostname "example.com"
 * route({ host: "example.com" });
 *
 * // Matches URLs with any hostname and path starting with "/oceny"
 * route({ path: "/oceny*" });
 *
 * // Matches URLs with hostname containing "wiadomosci" and any path
 * route({ host: "*wiadomosci*" });
 * ```
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URLPattern|Check on MDN}
 */
export function route(options: {
    host?: string;
    path?: string;
    hash?: string;
}): URLPattern;
/**
 * A helper function to create URLPattern objects.
 *
 * @param arg Either a string representing the pathname pattern or an object containing any of the following optional properties: `host`, `path` and `hash`. Each property corresponds to the respective component of a URL and accepts the same patterns as the URLPattern API.
 * @returns A URLPattern object created based on the provided argument.
 */
export function route(
    arg: string | { host?: string; path?: string; hash?: string },
) {
    if (typeof arg === "string") {
        return new URLPattern({ pathname: arg });
    }

    return new URLPattern({
        hostname: arg.host,
        pathname: arg.path,
        hash: arg.hash,
    });
}
