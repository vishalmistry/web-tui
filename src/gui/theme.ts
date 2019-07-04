
export interface Colors {
    readonly foreground: number;
    readonly background: number;
}

export interface ColorScheme {
    readonly normal: Colors;
    readonly hover: Colors;
    readonly focused: Colors;
}

export interface Theme {
    readonly default: ColorScheme;
    readonly button: ColorScheme;
    readonly checkBox: ColorScheme;
}
