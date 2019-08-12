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

export interface MenuBarColorScheme {
    readonly normal: Colors;
    readonly hotKey: Colors;
    readonly focused: Colors;
    readonly focusedHotKey: Colors;
    readonly disabled: Colors;
}

export interface MenuColorScheme {
    readonly frame: Colors;
    readonly normal: Colors;
    readonly hotKey: Colors;
    readonly focused: Colors;
    readonly focusedHotKey: Colors;
    readonly disabled: Colors;
}

export interface Theme {
    readonly default: SimpleColorScheme;
    readonly menuBar: MenuBarColorScheme;
    readonly menu: MenuColorScheme;
    readonly button: SimpleColorScheme;
    readonly checkBox: SimpleColorScheme;
    readonly radioGroup: SimpleColorScheme;
    readonly textBox: SimpleColorScheme;
}
