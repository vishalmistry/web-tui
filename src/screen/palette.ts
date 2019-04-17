export interface IColor {
    r: number;
    g: number;
    b: number;
}

export class Palette {
    public static readonly default = new Palette([
        '#000000', '#0000AA', '#00AA00', '#00AAAA',
        '#AA0000', '#AA00AA', '#AA5500', '#AAAAAA',
        '#555555', '#5555FF', '#55FF55', '#55FFFF',
        '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF',
    ].map((c) => Palette.parseColor(c) || { r: 0, g: 0, b: 0 }), 7, 0);

    private constructor(
        private colors: IColor[],
        private _defaultForegroundCode: number,
        private _defaultBackgroundCode: number) {
    }

    public get defaultForegroundCode() {
        return this._defaultForegroundCode;
    }

    public get defaultBackgroundCode() {
        return this._defaultBackgroundCode;
    }

    public getColor(code: number): IColor {
        this.validateCode(code);
        return this.colors[code];
    }

    public getInvertedColor(code: number): IColor {
        this.validateCode(code);
        const invertedCode = (code + 7) % this.colors.length;
        return this.colors[invertedCode];
    }

    private validateCode(code: number) {
        if (code < 0 || code >= this.colors.length) {
            throw new Error(`Palette color code must be in the range of 0..${this.colors.length}`);
        }
    }

    private static parseColor(input: string): IColor | undefined {
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
