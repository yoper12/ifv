/**
 * Gets the URL of an icon in the extension's assets folder.
 *
 * @param iconName The name of the icon (without the .svg extension).
 * @returns The URL of the icon.
 *
 * @example
 * ```typescript
 * const calendarIconUrl = getIcon("calendar");
 * ```
 */
export function getIcon(iconName: string): string {
    return chrome.runtime.getURL(`assets/icons/${iconName}.svg`);
}
