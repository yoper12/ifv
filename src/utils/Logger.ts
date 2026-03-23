const DEV = import.meta.env?.DEV;

export class Logger {
    /**
     * Used to log debugging messages (lowest priority). This will be disabled in production builds to avoid
     * performance impact.
     *
     * @example
     *
     * ```typescript
     * Logger.debug("This is a debugging message.", { some: "data" });
     * ```
     *
     * @returns A logging function that accepts the same arguments as `console.debug`.
     */
    static get debug() {
        if (!DEV) return () => {};

        return console.debug.bind(
            console,
            `%c[${new Date().toLocaleTimeString()}] %c[DEBUG]`,
            "color: gray;",
            "color: cyan;",
        );
    }

    /**
     * Used to log informational messages (medium-low priority). This will be disabled in production builds
     * to avoid performance impact.
     *
     * @example
     *
     * ```typescript
     * Logger.info("This is an informational message.", { some: "data" });
     * ```
     *
     * @returns A logging function that accepts the same arguments as `console.info`.
     */
    static get info() {
        if (!DEV) return () => {};

        return console.info.bind(
            console,
            `%c[${new Date().toLocaleTimeString()}] %c[INFO]`,
            "color: gray;",
            "color: royalblue;",
        );
    }

    /**
     * Used to log warning messages (medium-high priority). This will be disabled in production builds to
     * avoid performance impact.
     *
     * @example
     *
     * ```typescript
     * Logger.warn("This is a warning message.", { some: "data" });
     * ```
     *
     * @returns A logging function that accepts the same arguments as `console.warn`.
     */
    static get warn() {
        if (!DEV) return () => {};

        return console.warn.bind(
            console,
            `%c[${new Date().toLocaleTimeString()}] %c[WARN]`,
            "color: gray;",
            "color: orange;",
        );
    }

    /**
     * Used to log error messages (highest priority). This is the only logging method that is preserved in
     * production.
     *
     * @example
     *
     * ```typescript
     * Logger.error("This is an error message.", { some: "data" });
     * ```
     *
     * @returns A logging function that accepts the same arguments as `console.error`.
     */
    static get error() {
        return console.error.bind(
            console,
            `%c[${new Date().toLocaleTimeString()}] %c[ERROR]`,
            "color: gray;",
            "color: red;",
        );
    }
}
