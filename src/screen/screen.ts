import { Glyph } from '.';
import { Palette } from './palette';

interface ICoord {
    readonly x: number;
    readonly y: number;
}
function isCoord(object: any): object is ICoord {
    return typeof object === 'object' && 'x' in object && 'y' in object;
}

export type ScreenMouseEventType = 'mousemove' | 'mousedown' | 'mouseup' | 'click' | 'dblclick';
export interface IScreenMouseEvent {
    readonly type: ScreenMouseEventType;
    readonly position: ICoord;
    readonly buttons: number;
}
export type ScreenMouseEventHandler = (ev: IScreenMouseEvent) => void;

export type ScreenKeyboardEventType = 'keyup' | 'keydown' | 'keypress';
export interface IScreenKeyboardEvent {
    readonly type: ScreenKeyboardEventType;
}
export type ScreenKeyboardEventHandler = (ev: IScreenKeyboardEvent) => void;

export type ScreenEventType = ScreenMouseEventType | ScreenKeyboardEventType;

export class Screen {
    private glyphWidth = Glyph.WIDTH;
    private glyphHeight = Glyph.HEIGHT;

    private context: CanvasRenderingContext2D;
    private _columns: number;
    private _rows: number;
    private palette = Palette.default;
    private state: Glyph[][];

    public foreground = this.palette.defaultForegroundCode;
    public background = this.palette.defaultBackgroundCode;

    private _isMouseEnabled = false;
    private originalCursor: string | null = null;
    private mouseLocation: ICoord = { x: 0, y: 0 };
    private mouseEventHandlers: { [key in ScreenMouseEventType]?: ScreenMouseEventHandler[]; } = { };

    constructor(private canvas: HTMLCanvasElement) {
        const context = canvas.getContext('2d');
        if (context === null) {
            throw new Error('Unable to get canvas 2D context');
        }

        this.context = context;
        this._columns = Math.floor(canvas.width / this.glyphWidth);
        this._rows = Math.floor(canvas.height / this.glyphHeight);
        this.state = Screen.createState(
            this._columns,
            this._rows,
            this.foreground,
            this.background,
            this.renderGlyph);
        this.render(0, 0, this._columns, this._rows);
    }

    public get columns() {
        return this._columns;
    }

    public get rows() {
        return this._rows;
    }

    public get isMouseEnabled() {
        return this._isMouseEnabled;
    }

    public set isMouseEnabled(isEnabled: boolean) {
        if (this._isMouseEnabled === isEnabled) {
            return;
        }

        this._isMouseEnabled = isEnabled;
        if (this._isMouseEnabled) {
            this.enableMouse();
        } else {
            this.disableMouse();
        }
    }

    public setCharacter(position: ICoord, s: string | number): void;
    public setCharacter(x: number, y: number, n: string | number): void;
    setCharacter(a: ICoord | number, b: string | number, c?: string | number): void {
        let x: number;
        let y: number;
        let char: string | number;
        if (isCoord(a)) {
            x = a.x;
            y = a.y;
            char = b;
        } else if (typeof a === 'number' && typeof b === 'number' && c !== undefined) {
            x = a;
            y = b;
            char = c;
        } else {
            throw new Error('Bad arguments');
        }

        if (x < 0 || x >= this.columns) {
            throw new Error('Invalid column');
        }
        if (y < 0 || y >= this.rows) {
            throw new Error('Invalid row');
        }

        const glyph = this.state[y][x];
        if (typeof char === 'string') {
            glyph.character = char;
        } else if (typeof char === 'number') {
            glyph.code = char;
        } else {
            throw new Error('Bad arguments');
        }
        glyph.foreground = this.foreground;
        glyph.background = this.background;
    }

    public print(position: ICoord, str: string): void;
    public print(x: number, y: number, str: string): void;
    print(a: ICoord | number, b: number | string, c?: string): void {
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

        if (y < 0 || y >= this.rows) {
            throw new Error('Invalid row');
        }
        if (x < 0) {
            throw new Error('Invalid column');
        }
        if (str.length > (this.columns - x)) {
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

    public addEventHandler(event: ScreenMouseEventType, handler: ScreenMouseEventHandler) {
        let eventHandlers = this.mouseEventHandlers[event];
        if (eventHandlers === undefined) {
            eventHandlers = [];
            this.mouseEventHandlers[event] = eventHandlers;
        }

        if (eventHandlers.indexOf(handler) < 0) {
            eventHandlers.push(handler);
        }
    }

    public removeEventHandler(event: ScreenMouseEventType, handler: ScreenMouseEventHandler) {
        const eventHandlers = this.mouseEventHandlers[event];
        if (eventHandlers === undefined) {
            return;
        }

        const index = eventHandlers.indexOf(handler);
        if (index >= 0) {
            eventHandlers.splice(index, 1);
        }
    }

    public destroy() {
        if (this._isMouseEnabled) {
            this.disableMouse();
        }
    }

    private renderGlyph = (g: Glyph, x: number, y: number, invert = false) => {
        g.render(this.context, x * this.glyphWidth, y * this.glyphHeight, this.palette, invert);
    }

    private onMouseMove(event: MouseEvent, previous: ICoord, current: ICoord) {
        this.renderGlyph(this.state[previous.y][previous.x], previous.x, previous.y);
        this.renderGlyph(this.state[current.y][current.x], current.x, current.y, true);

        this.fireMouseEvent(event, 'mousemove');
    }

    private onCanvasContextMenu = (event: MouseEvent) => event.preventDefault();
    private onCanvasMouseMove = (event: MouseEvent) => {
        const posX = Math.floor(event.clientX / this.glyphWidth);
        const posY = Math.floor(event.clientY / this.glyphHeight);

        if (posX < this.columns && posY < this.rows) {
            if (this.mouseLocation.x !== posX || this.mouseLocation.y !== posY) {
                const oldLocation = this.mouseLocation;
                this.mouseLocation = { x: posX, y: posY };
                this.onMouseMove(event, oldLocation, this.mouseLocation);
            }
        }
    }
    private onCanvasMouseDown = (event: MouseEvent) => this.fireMouseEvent(event, 'mousedown');
    private onCanvasMouseUp = (event: MouseEvent) => this.fireMouseEvent(event, 'mouseup');
    private onCanvasMouseClick = (event: MouseEvent) => this.fireMouseEvent(event, 'click');
    private onCanvasMouseDblClick = (event: MouseEvent) => this.fireMouseEvent(event, 'dblclick');

    private fireMouseEvent(event: MouseEvent, screenEventType: ScreenMouseEventType) {
        this.fireEvent(screenEventType, {
            type: screenEventType,
            position: this.mouseLocation,
            buttons: event.buttons,
        });
    }

    private fireEvent(event: ScreenMouseEventType, args: IScreenMouseEvent): void {
        const handlers = this.mouseEventHandlers[event];
        if (handlers === undefined) {
            return;
        }

        for (const handler of handlers) {
            try {
                handler(args);
            } catch (err) {
                console.log(`Event handler for '${event}' failed: `, err);
            }
        }
    }

    private enableMouse() {
        this.canvas.addEventListener('contextmenu', this.onCanvasContextMenu);
        this.canvas.addEventListener('mousemove', this.onCanvasMouseMove);
        this.canvas.addEventListener('mousedown', this.onCanvasMouseDown);
        this.canvas.addEventListener('mouseup', this.onCanvasMouseUp);
        this.canvas.addEventListener('click', this.onCanvasMouseClick);
        this.canvas.addEventListener('dblclick', this.onCanvasMouseDblClick);

        this.originalCursor = this.canvas.style.cursor;
        this.canvas.style.cursor = 'none';
    }

    private disableMouse() {
        this.canvas.removeEventListener('contextmenu', this.onCanvasContextMenu);
        this.canvas.removeEventListener('mousemove', this.onCanvasMouseMove);
        this.canvas.removeEventListener('mousedown', this.onCanvasMouseDown);
        this.canvas.removeEventListener('mouseup', this.onCanvasMouseUp);
        this.canvas.removeEventListener('click', this.onCanvasMouseClick);
        this.canvas.removeEventListener('dblclick', this.onCanvasMouseDblClick);

        this.canvas.style.cursor = this.originalCursor;
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
