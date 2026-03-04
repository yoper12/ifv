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
export function getIcon(iconName: string): string {
    return chrome.runtime.getURL(`assets/icons/${iconName}.svg`);
}
