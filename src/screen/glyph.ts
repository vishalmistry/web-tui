import { Palette } from '.';
import { EventEmitter } from '../common';

export type GlyphProperty = 'code' | 'background' | 'foreground';

export class Glyph {
    public readonly changed = new EventEmitter<GlyphProperty>();

    // tslint:disable-next-line: max-line-length
    private static readonly CHARACTERS = ' ☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼ !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ';
    // tslint:disable-next-line: max-line-length
    private static readonly SPRITE_SHEET_URL = 'data:image/png;base64,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';
    private static readonly SPRITE_BITMAP = Glyph.loadSpriteSheetImage()
        .then((image) => Glyph.convertImageToSpriteBitmap(image));
    public static readonly WIDTH = 9;
    public static readonly HEIGHT = 16;

    private _code = 32;
    private _foreground = 0;
    private _background = 0;

    public get code() {
        return this._code;
    }

    public set code(code: number) {
        if (this._code !== code) {
            this._code = code;
            this.changed.emit('code');
        }
    }

    public get character() {
        return Glyph.CHARACTERS[this._code];
    }

    public set character(c: string) {
        if (c.length > 1) {
            throw new Error('Expected character, not string');
        }
        const code = Glyph.CHARACTERS.indexOf(c);
        if (code < 0) {
            throw new Error('Invalid character');
        }
        this.code = code;
    }

    public get foreground() {
        return this._foreground;
    }

    public set foreground(color: number) {
        if (this._foreground !== color) {
            this._foreground = color;
            this.changed.emit('foreground');
        }
    }

    public get background() {
        return this._background;
    }

    public set background(color: number) {
        if (this._background !== color) {
            this._background = color;
            this.changed.emit('background');
        }
    }

    public render(outCtx: CanvasRenderingContext2D, x: number, y: number, palette: Palette, invert: boolean = false) {
        Glyph.SPRITE_BITMAP.then((bitmap) => {
            const bgColor = invert ? palette.getInvertedColor(this.background) : palette.getColor(this.background);
            const fgColor = invert ? palette.getInvertedColor(this.foreground) : palette.getColor(this.foreground);
            const width = Glyph.WIDTH;
            const height = Glyph.HEIGHT;
            const columns = Math.floor(bitmap.width / width);
            const positionX = (this.code % columns) * width;
            const positionY = Math.floor(this.code / columns) * height;

            outCtx.fillStyle = `rgb(${bgColor.r},${bgColor.g},${bgColor.b})`;
            outCtx.fillRect(x, y, width, height);

            outCtx.fillStyle = `rgb(${fgColor.r},${fgColor.g},${fgColor.b})`;
            for (let j = 0; j < height; j++) {
                for (let i = 0; i < width; i++) {
                    const bit = bitmap.bitmap[((positionY + j) * bitmap.width) + (positionX + i)];
                    if (bit) {
                        outCtx.fillRect(x + i, y + j, 1, 1);
                    }
                }
            }
        });
    }

    private static loadSpriteSheetImage(): Promise<HTMLImageElement> {
        return new Promise<HTMLImageElement>(
            (resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = (e) => reject(e);
                image.src = Glyph.SPRITE_SHEET_URL;
            });
    }

    private static convertImageToSpriteBitmap(image: HTMLImageElement) {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        const context = canvas.getContext('2d');
        if (context === null) {
            return { width: 0, height: 0, bitmap: new Array<boolean>(0) };
        }

        context.drawImage(image, 0, 0);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        const bits = new Array<boolean>(image.width * imageData.height);
        for (let y = 0; y < imageData.height; y++) {
            for (let x = 0; x < imageData.width; x++) {
                const index = 4 * ((y * imageData.width) + x);
                const r = imageData.data[index];

                bits[(y * imageData.width) + x] = (r !== 0);
            }
        }

        return {
            width: canvas.width,
            height: canvas.height,
            bitmap: bits,
        };
    }
}
