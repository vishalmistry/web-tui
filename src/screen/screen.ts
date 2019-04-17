import { Glyph } from '.';
import { Palette } from './palette';

interface ICoord {
    x: number;
    y: number;
}
function isCoord(object: any): object is ICoord {
    return typeof object === 'object' && 'x' in object && 'y' in object;
}

export class Screen {
    private glyphWidth = Glyph.WIDTH;
    private glyphHeight = Glyph.HEIGHT;

    private context: CanvasRenderingContext2D;
    private _width: number;
    private _height: number;
    private palette = Palette.default;
    private state: Glyph[][];

    public foreground = this.palette.defaultForegroundCode;
    public background = this.palette.defaultBackgroundCode;
    private mouseLocation: ICoord = { x: 0, y: 0 };

    constructor(canvas: HTMLCanvasElement) {
        canvas.style.cursor = 'none';

        const context = canvas.getContext('2d');
        if (context === null) {
            throw new Error('Unable to get canvas 2D context');
        }

        this.context = context;
        this._width = Math.floor(canvas.width / this.glyphWidth);
        this._height = Math.floor(canvas.height / this.glyphHeight);
        this.state = Screen.createState(
            this._width,
            this._height,
            this.foreground,
            this.background,
            (g, x, y) => this.renderGlyph(g, x, y));
        this.render(0, 0, this._width, this._height);

        console.log(`Screen size: ${this.width}x${this.height}`);
        const message = ' HELLO WORLD ';
        this.foreground = 15;
        this.background = 1;
        this.print(Math.floor(this.width / 2) - Math.floor(message.length / 2), Math.floor(this.height / 2), message);

        canvas.addEventListener('mousemove', (ev) => this.onCanvasMouseMove(ev));
    }

    public get width() {
        return this._width;
    }

    public get height() {
        return this._height;
    }

    public print(position: ICoord, str: string): void;
    public print(x: number, y: number, str: string): void;
    print(a: ICoord | number, b: number | string, c?: string) {
        let x: number;
        let y: number;
        let str: string;

        if (isCoord(a) && typeof b === 'string') {
            x = a.x;
            y = a.y;
            str = b;
        } else if (typeof a === 'number' && typeof b === 'number' && typeof c === 'string') {
            x = a;
            y = b;
            str = c;
        } else {
            throw new Error('Bad arguments');
        }

        if (y >= this.height) {
            throw new Error('Invalid row');
        }
        if (str.length > (this.width - x)) {
            throw new Error('String is too long to print at specified position');
        }

        for (let i = 0; i < str.length; i++) {
            const glyph = this.state[y][x + i];
            glyph.character = str[i];
            glyph.foreground = this.foreground;
            glyph.background = this.background;
        }
    }

    public render(x: number, y: number, w: number, h: number) {
        for (let j = y; j < (y + h); j++) {
            for (let i = x; i < (x + w); i++) {
                this.renderGlyph(this.state[j][i], i, j);
            }
        }
    }

    private renderGlyph(g: Glyph, x: number, y: number, invert = false) {
        g.render(this.context, x * this.glyphWidth, y * this.glyphHeight, this.palette, invert);
    }

    private onMouseMove(previous: ICoord, current: ICoord) {
        this.renderGlyph(this.state[previous.y][previous.x], previous.x, previous.y);
        this.renderGlyph(this.state[current.y][current.x], current.x, current.y, true);
    }

    private onCanvasMouseMove(ev: MouseEvent): void {
        const posX = Math.floor(ev.clientX / this.glyphWidth);
        const posY = Math.floor(ev.clientY / this.glyphHeight);

        if (this.mouseLocation.x !== posX || this.mouseLocation.y !== posY) {
            const oldLocation = this.mouseLocation;
            this.mouseLocation = { x: posX, y: posY };
            this.onMouseMove(oldLocation, this.mouseLocation);
        }
    }

    private static createState(
        width: number,
        height: number,
        foreground: number,
        background: number,
        renderer: (g: Glyph, x: number, y: number) => void): Glyph[][] {
        const matrix: Glyph[][] = [];
        for (let y = 0; y < height; y++) {
            const row: Glyph[] = [];
            for (let x = 0; x < width; x++) {
                const glyph = new Glyph();
                glyph.foreground = foreground;
                glyph.background = background;
                glyph.addEventHandler('changed', () => renderer(glyph, x, y));
                row.push(glyph);
            }
            matrix.push(row);
        }

        return matrix;
    }
}
