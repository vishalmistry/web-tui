export interface Color {
    readonly r: number;
    readonly g: number;
    readonly b: number;
}

export class Palette {
    public static readonly dos = new Palette([
        '#000000', '#0000aa', '#00aa00', '#00aaaa', '#aa0000', '#aa00aa', '#aa5500', '#aaaaaa',
        '#555555', '#5555ff', '#55ff55', '#55ffff', '#ff5555', '#ff55ff', '#ffff55', '#ffffff',
    ].map((c) => Palette.parseColor(c) || { r: 0, g: 0, b: 0 }), 7, 0);

    public static readonly xterm = new Palette([
        '#000000', '#800000', '#008000', '#808000', '#000080', '#800080', '#008080', '#c0c0c0',
        '#808080', '#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff', '#00ffff', '#ffffff',
    ].map((c) => Palette.parseColor(c) || { r: 0, g: 0, b: 0 }), 7, 0);

    public static readonly xterm256 = new Palette([
        // Primary
        '#000000', '#800000', '#008000', '#808000', '#000080', '#800080', '#008080', '#c0c0c0',
        '#808080', '#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff', '#00ffff', '#ffffff',

        // Main
        '#000000', '#00005f', '#000087', '#0000af', '#0000d7', '#0000ff',
        '#005f00', '#005f5f', '#005f87', '#005faf', '#005fd7', '#005fff',
        '#008700', '#00875f', '#008787', '#0087af', '#0087d7', '#0087ff',
        '#00af00', '#00af5f', '#00af87', '#00afaf', '#00afd7', '#00afff',
        '#00d700', '#00d75f', '#00d787', '#00d7af', '#00d7d7', '#00d7ff',
        '#00ff00', '#00ff5f', '#00ff87', '#00ffaf', '#00ffd7', '#00ffff',
        '#5f0000', '#5f005f', '#5f0087', '#5f00af', '#5f00d7', '#5f00ff',
        '#5f5f00', '#5f5f5f', '#5f5f87', '#5f5faf', '#5f5fd7', '#5f5fff',
        '#5f8700', '#5f875f', '#5f8787', '#5f87af', '#5f87d7', '#5f87ff',
        '#5faf00', '#5faf5f', '#5faf87', '#5fafaf', '#5fafd7', '#5fafff',
        '#5fd700', '#5fd75f', '#5fd787', '#5fd7af', '#5fd7d7', '#5fd7ff',
        '#5fff00', '#5fff5f', '#5fff87', '#5fffaf', '#5fffd7', '#5fffff',
        '#870000', '#87005f', '#870087', '#8700af', '#8700d7', '#8700ff',
        '#875f00', '#875f5f', '#875f87', '#875faf', '#875fd7', '#875fff',
        '#878700', '#87875f', '#878787', '#8787af', '#8787d7', '#8787ff',
        '#87af00', '#87af5f', '#87af87', '#87afaf', '#87afd7', '#87afff',
        '#87d700', '#87d75f', '#87d787', '#87d7af', '#87d7d7', '#87d7ff',
        '#87ff00', '#87ff5f', '#87ff87', '#87ffaf', '#87ffd7', '#87ffff',
        '#af0000', '#af005f', '#af0087', '#af00af', '#af00d7', '#af00ff',
        '#af5f00', '#af5f5f', '#af5f87', '#af5faf', '#af5fd7', '#af5fff',
        '#af8700', '#af875f', '#af8787', '#af87af', '#af87d7', '#af87ff',
        '#afaf00', '#afaf5f', '#afaf87', '#afafaf', '#afafd7', '#afafff',
        '#afd700', '#afd75f', '#afd787', '#afd7af', '#afd7d7', '#afd7ff',
        '#afff00', '#afff5f', '#afff87', '#afffaf', '#afffd7', '#afffff',
        '#d70000', '#d7005f', '#d70087', '#d700af', '#d700d7', '#d700ff',
        '#d75f00', '#d75f5f', '#d75f87', '#d75faf', '#d75fd7', '#d75fff',
        '#d78700', '#d7875f', '#d78787', '#d787af', '#d787d7', '#d787ff',
        '#d7af00', '#d7af5f', '#d7af87', '#d7afaf', '#d7afd7', '#d7afff',
        '#d7d700', '#d7d75f', '#d7d787', '#d7d7af', '#d7d7d7', '#d7d7ff',
        '#d7ff00', '#d7ff5f', '#d7ff87', '#d7ffaf', '#d7ffd7', '#d7ffff',
        '#ff0000', '#ff005f', '#ff0087', '#ff00af', '#ff00d7', '#ff00ff',
        '#ff5f00', '#ff5f5f', '#ff5f87', '#ff5faf', '#ff5fd7', '#ff5fff',
        '#ff8700', '#ff875f', '#ff8787', '#ff87af', '#ff87d7', '#ff87ff',
        '#ffaf00', '#ffaf5f', '#ffaf87', '#ffafaf', '#ffafd7', '#ffafff',
        '#ffd700', '#ffd75f', '#ffd787', '#ffd7af', '#ffd7d7', '#ffd7ff',
        '#ffff00', '#ffff5f', '#ffff87', '#ffffaf', '#ffffd7', '#ffffff',

        // Greys
        '#080808', '#121212', '#1c1c1c', '#262626', '#303030', '#3a3a3a',
        '#444444', '#4e4e4e', '#585858', '#606060', '#666666', '#767676',
        '#808080', '#8a8a8a', '#949494', '#9e9e9e', '#a8a8a8', '#b2b2b2',
        '#bcbcbc', '#c6c6c6', '#d0d0d0', '#dadada', '#e4e4e4', '#eeeeee',
    ].map((c) => Palette.parseColor(c) || { r: 0, g: 0, b: 0 }), 7, 0);

    private constructor(
        private _colors: Color[],
        private _defaultForegroundCode: number,
        private _defaultBackgroundCode: number) {
    }

    public get defaultForegroundCode() {
        return this._defaultForegroundCode;
    }

    public get defaultBackgroundCode() {
        return this._defaultBackgroundCode;
    }

    public getColor(code: number): Color {
        this.validateCode(code);
        return this._colors[code];
    }

    public getInvertedColor(code: number): Color {
        this.validateCode(code);
        const invertedCode = (code + 7) % this._colors.length;
        return this._colors[invertedCode];
    }

    private validateCode(code: number) {
        if (code < 0 || code >= this._colors.length) {
            throw new Error(`Palette color code must be in the range of 0..${this._colors.length}`);
        }
    }

    private static parseColor(input: string): Color | undefined {
        let m = input.match(/^#([0-9a-f]{3})$/i);
        if (m !== null) {
            // in three-character format, each value is multiplied by 0x11 to give an
            // even scale from 0x00 to 0xff
            return {
                r: parseInt(m[1].charAt(0), 16) * 0x11,
                g: parseInt(m[1].charAt(1), 16) * 0x11,
                b: parseInt(m[1].charAt(2), 16) * 0x11,
            };
        }

        m = input.match(/^#([0-9a-f]{6})$/i);
        if (m !== null) {
            return {
                r: parseInt(m[1].substr(0, 2), 16),
                g: parseInt(m[1].substr(2, 2), 16),
                b: parseInt(m[1].substr(4, 2), 16),
            };
        }

        m = input.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
        if (m !== null) {
            return {
                r: parseInt(m[1], 10),
                g: parseInt(m[2], 10),
                b: parseInt(m[3], 10),
            };
        }

        return undefined;
    }
}
