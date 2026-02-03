/**
 * The union type for all possible settings.
 */
export type Setting =
    | TextSetting
    | BooleanSetting
    | ColorSetting
    | NumberSetting
    | SelectSetting
    | MultiSelectSetting;

/**
 * The base structure for all settings.
 */
interface BaseSetting<T extends string = string> {
    /**
     * The name of the setting.
     */
    name: string;
    /**
     * The unique identifier of the setting.
     */
    id: string;
    /**
     * A brief description of what the setting changes.
     */
    description: string;
    /**
     * The type of the setting.
     */
    type: T;
}

/**
 * A text input setting.
 */
interface TextSetting extends BaseSetting<"text"> {
    /**
     * The default value of the setting.
     */
    defaultValue: string;
}

/**
 * A boolean (switch) setting.
 */
interface BooleanSetting extends BaseSetting<"boolean"> {
    /**
     * The default value of the setting.
     */
    defaultValue: boolean;
}

/**
 * A color picker setting.
 */
interface ColorSetting extends BaseSetting<"color"> {
    /**
     * The default value of the setting.
     */
    defaultValue: string;
}

/**
 * A number input setting.
 */
interface NumberSetting extends BaseSetting<"number"> {
    /**
     * The default value of the setting.
     */
    defaultValue: number;
    /**
     * The minimum value of the setting.
     */
    min?: number;
    /**
     * The maximum value of the setting.
     */
    max?: number;
    /**
     * The step value of the setting.
     */
    step?: number;
}

/**
 * A select dropdown setting.
 */
interface SelectSetting extends BaseSetting<"select"> {
    /**
     * The default value of the setting.
     */
    defaultValue: string;
    /**
     * The options available for selection.
     */
    options: Array<{
        /**
         * The label displayed to the user.
         */
        label: string;
        /**
         * The value passed to the patch.
         */
        value: string;
    }>;
}

/**
 * A multi-select (multiple switches) setting.
 */
interface MultiSelectSetting extends BaseSetting<"multiselect"> {
    /**
     * The default value of the setting.
     */
    defaultValue: Array<string>;
    /**
     * The options available for selection.
     */
    options: Array<{
        /**
         * The label displayed to the user.
         */
        label: string;
        /**
         * The value passed to the patch.
         */
        value: string;
    }>;
}
