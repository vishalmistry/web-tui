export interface Colors {
    readonly foreground: number;
    readonly background: number;
}

export interface SimpleColorScheme {
    readonly normal: Colors;
    readonly hover: Colors;
    readonly focused: Colors;
    readonly disabled: Colors;
}

export interface Theme {
    readonly default: SimpleColorScheme;
    readonly button: SimpleColorScheme;
    readonly checkBox: SimpleColorScheme;
    readonly radioGroup: SimpleColorScheme;
    readonly textBox: SimpleColorScheme;
}
