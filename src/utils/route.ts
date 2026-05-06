/**
 * A helper function to create URLPattern objects.
 *
 * @example
 *
 * ```typescript
 * // Matches URLs with any hostname and path starting with "/oceny"
 * route("/oceny*");
 *
 * // Matches all URLs
 * route("*");
 * ```
 *
 * @param path - Path A string representing the pathname pattern. E.g.
 *   "(asterisk)/oceny". To match all paths use an asterisk.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URLPattern/pathname|Check on MDN}
 */
export function route(path: string): URLPattern;
/**
 * A helper function to create URLPattern objects.
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
 * @param options - An object containing any of the following optional
 *   properties: `host`, `path` and `hash`. Each property corresponds to the
 *   respective component of a URL and accepts the same patterns as the
 *   URLPattern API.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URLPattern|Check on MDN}
 */
export function route(options: {
    hash?: string;
    host?: string;
    path?: string;
}): URLPattern;
/**
 * A helper function to create URLPattern objects.
 *
 * @param arg - Either a string representing the pathname pattern or an object
 *   containing any of the following optional properties: `host`, `path` and
 *   `hash`. Each property corresponds to the respective component of a URL and
 *   accepts the same patterns as the URLPattern API.
 * @returns A URLPattern object created based on the provided argument.
 */
export function route(
    argument: string | { hash?: string; host?: string; path?: string },
) {
    if (typeof argument === "string") {
        return new URLPattern({ pathname: argument });
    }

    const pattern: URLPatternInit = {};

    if (argument.hash !== undefined) pattern.hash = argument.hash;
    if (argument.host !== undefined) pattern.hostname = argument.host;
    if (argument.path !== undefined) pattern.pathname = argument.path;

    return new URLPattern(pattern);
}
