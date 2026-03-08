import { browser } from "#imports";
import type { PublicPath } from "wxt/browser";

type IconPath = Extract<PublicPath, `/assets/icons/${string}.svg`>;
type IconName =
    IconPath extends `/assets/icons/${infer Name}.svg` ? Name : never;

/**
 * Gets the URL of an icon in the extension's assets folder.
 *
 * @example
 *
 * ```typescript
 * const calendarIconUrl = getIcon("calendar");
 * ```
 *
 * @param iconName The name of the icon (without the .svg extension).
 * @returns The URL of the icon.
 */
export function getIcon<TName extends IconName>(iconName: TName): string {
    const path: `/assets/icons/${TName}.svg` = `/assets/icons/${iconName}.svg`;
    return browser.runtime.getURL(path);
}
