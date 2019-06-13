
export interface Attribute {
    readonly foreground: number;
    readonly background: number;
}

export interface ColorScheme {
    readonly normal: Attribute;
    readonly hover: Attribute;
    readonly focused: Attribute;
}

export interface Theme {
    readonly default: ColorScheme;
    readonly button: ColorScheme;
}
