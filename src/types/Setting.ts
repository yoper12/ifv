/** The union type for all possible settings. */
export type Setting =
    | ColorSetting
    | MultiSelectSetting
    | NumberSetting
    | SelectSetting
    | SwitchSetting
    | TextSetting;

/** The base structure for all settings. */
interface BaseSetting<T extends string = string> {
    /** A brief description of what the setting changes. */
    description: string;
    /** The unique identifier of the setting. */
    id: string;
    /** The name of the setting. */
    name: string;
    /** The type of the setting. */
    type: T;
}

/** A color picker setting. */
interface ColorSetting extends BaseSetting<"color"> {
    /** The default value of the setting. */
    defaultValue: string;
}

/** A multi-select (multiple switches) setting. */
interface MultiSelectSetting extends BaseSetting<"multiselect"> {
    /** The default value of the setting. */
    defaultValue: Array<string>;
    /** The options available for selection. */
    options: Array<{
        /** The label displayed to the user. */
        label: string;
        /** The value passed to the patch. */
        value: string;
    }>;
}

/** A number input setting. */
interface NumberSetting extends BaseSetting<"number"> {
    /** The default value of the setting. */
    defaultValue: number;
    /** The maximum value of the setting. */
    max?: number;
    /** The minimum value of the setting. */
    min?: number;
    /** The step value of the setting. */
    step?: number;
}

/** A select dropdown setting. */
interface SelectSetting extends BaseSetting<"select"> {
    /** The default value of the setting. */
    defaultValue: string;
    /** The options available for selection. */
    options: Array<{
        /** The label displayed to the user. */
        label: string;
        /** The value passed to the patch. */
        value: string;
    }>;
}

/** A switch (boolean) setting. */
interface SwitchSetting extends BaseSetting<"switch"> {
    /** The default value of the setting. */
    defaultValue: boolean;
}

/** A text input setting. */
interface TextSetting extends BaseSetting<"text"> {
    /** The default value of the setting. */
    defaultValue: string;
}
