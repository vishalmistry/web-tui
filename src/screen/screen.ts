import { Glyph } from '.';
import { Palette } from './palette';

interface ICoord {
    readonly x: number;
    readonly y: number;
}
function isCoord(object: any): object is ICoord {
    return typeof object === 'object' && 'x' in object && 'y' in object;
}

export type EventHandler<TArg> = (event: TArg) => void;
export type ScreenKeyboardEventType = 'keyup' | 'keydown' | 'keypress';
export type ScreenMouseEventType = 'mousemove' | 'mousedown' | 'mouseup' | 'click' | 'dblclick';
export type ScreenInputEventTypes = ScreenKeyboardEventType | ScreenMouseEventType;

export interface IScreenInputEvent<T extends string> {
    readonly type: T;
    readonly shiftKey: boolean;
    readonly ctrlKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
}

export interface IScreenKeyboardEvent extends IScreenInputEvent<ScreenKeyboardEventType> {
    readonly code: string;
    readonly key: string;
}

export interface IScreenMouseEvent extends IScreenInputEvent<ScreenMouseEventType> {
    readonly position: ICoord;
    readonly buttons: number;
}

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
    private cursorLocation: ICoord = { x: 0, y: 0 };

    private _isKeyboardEnabled = false;
    private originalCanvasTabIndex = -1;

    private _isMouseEnabled = false;
    private originalCanvasCursor: string | null = null;
    private mouseLocation: ICoord = { x: 0, y: 0 };

    private eventHandlers: { [key in ScreenMouseEventType]?: Array<EventHandler<IScreenMouseEvent>>; } &
                           { [key in ScreenKeyboardEventType]?: Array<EventHandler<IScreenKeyboardEvent>>; } = {};

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

    public get isKeyboardEnabled() {
        return this._isKeyboardEnabled;
    }

    public set isKeyboardEnabled(isEnabled: boolean) {
        if (this._isKeyboardEnabled === isEnabled) {
            return;
        }

        this._isKeyboardEnabled = isEnabled;
        if (this._isKeyboardEnabled) {
            this.enableKeyboard();
        } else {
            this.disableKeyboard();
        }
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

    public moveTo(position: ICoord): void;
    public moveTo(x: number, y: number): void;
    moveTo(a: ICoord | number, b?: number) {
        let newCursorLocation: ICoord;
        if (isCoord(a)) {
            newCursorLocation = a;
        } else if (typeof a === 'number' && typeof b === 'number') {
            newCursorLocation = { x: a, y: b };
        } else {
            throw new Error('Bad arguments');
        }

        if (newCursorLocation.x < 0 || newCursorLocation.y >= this.columns) {
            throw new Error('Invalid column');
        }
        if (newCursorLocation.y < 0 || newCursorLocation.y >= this.rows) {
            throw new Error('Invalid row');
        }

        this.cursorLocation = newCursorLocation;
    }

    public setCharacter(char: string | number): void {
        const glyph = this.state[this.cursorLocation.y][this.cursorLocation.x];
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

    public print(str: string): void {
        let x = this.cursorLocation.x;
        let y = this.cursorLocation.y;
        for (const c of str) {
            const glyph = this.state[y][x++];
            glyph.character = c;
            glyph.foreground = this.foreground;
            glyph.background = this.background;

            if (x >= this.columns) {
                y++;
                if (y >= this.rows) {
                    y--;
                    x--;
                } else {
                    x = 0;
                }
            }
        }
    }

    public render(x: number, y: number, w: number, h: number) {
        for (let j = y; j < (y + h); j++) {
            for (let i = x; i < (x + w); i++) {
                this.renderGlyph(this.state[j][i], i, j);
            }
        }
    }

    public addEventHandler(event: ScreenKeyboardEventType, handler: EventHandler<IScreenKeyboardEvent>): void;
    public addEventHandler(event: ScreenMouseEventType, handler: EventHandler<IScreenMouseEvent>): void;
    addEventHandler(event: ScreenInputEventTypes, handler: EventHandler<any>) {
        let eventHandlers = this.eventHandlers[event];
        if (eventHandlers === undefined) {
            eventHandlers = [];
            this.eventHandlers[event] = eventHandlers;
        }

        if (eventHandlers.indexOf(handler) < 0) {
            eventHandlers.push(handler);
        }
    }

    public removeEventHandler(event: ScreenKeyboardEventType, handler: EventHandler<IScreenKeyboardEvent>): void;
    public removeEventHandler(event: ScreenMouseEventType, handler: EventHandler<IScreenMouseEvent>): void;
    removeEventHandler(event:  ScreenInputEventTypes, handler: EventHandler<any>) {
        const eventHandlers = this.eventHandlers[event];
        if (eventHandlers === undefined) {
            return;
        }

        const index = eventHandlers.indexOf(handler);
        if (index >= 0) {
            eventHandlers.splice(index, 1);
        }
    }

    public destroy() {
        this.isKeyboardEnabled = false;
        this.isMouseEnabled = false;
    }

    private renderGlyph = (g: Glyph, x: number, y: number, invert = false) => {
        g.render(this.context, x * this.glyphWidth, y * this.glyphHeight, this.palette, invert);
    }

    private onMouseMove(event: MouseEvent, previous: ICoord, current: ICoord) {
        this.renderGlyph(this.state[previous.y][previous.x], previous.x, previous.y);
        this.renderGlyph(this.state[current.y][current.x], current.x, current.y, true);

        this.fireMouseEvent(event, 'mousemove');
    }

    private onCanvasKeyDown = (event: KeyboardEvent) => this.fireKeyboardEvent(event, 'keydown');
    private onCanvasKeyUp = (event: KeyboardEvent) => this.fireKeyboardEvent(event, 'keyup');
    private onCanvasKeyPress = (event: KeyboardEvent) => this.fireKeyboardEvent(event, 'keypress');
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

    private enableKeyboard() {
        this.canvas.addEventListener('keydown', this.onCanvasKeyDown);
        this.canvas.addEventListener('keyup', this.onCanvasKeyUp);
        this.canvas.addEventListener('keypress', this.onCanvasKeyPress);

        this.originalCanvasTabIndex = this.canvas.tabIndex;
        if (this.originalCanvasTabIndex < 0) {
            this.canvas.tabIndex = 0;
        }
    }

    private disableKeyboard() {
        this.canvas.removeEventListener('keydown', this.onCanvasKeyDown);
        this.canvas.removeEventListener('keyup', this.onCanvasKeyUp);
        this.canvas.removeEventListener('keypress', this.onCanvasKeyPress);

        this.canvas.tabIndex = this.originalCanvasTabIndex;
    }

    private fireKeyboardEvent(event: KeyboardEvent, screenEventType: ScreenKeyboardEventType) {
        const handlers = this.eventHandlers[screenEventType];
        Screen.fireHandlers(handlers, {
            type: screenEventType,
            key: event.key,
            code: event.code,
            shiftKey: event.shiftKey,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
        });
    }

    private enableMouse() {
        this.canvas.addEventListener('contextmenu', this.onCanvasContextMenu);
        this.canvas.addEventListener('mousemove', this.onCanvasMouseMove);
        this.canvas.addEventListener('mousedown', this.onCanvasMouseDown);
        this.canvas.addEventListener('mouseup', this.onCanvasMouseUp);
        this.canvas.addEventListener('click', this.onCanvasMouseClick);
        this.canvas.addEventListener('dblclick', this.onCanvasMouseDblClick);

        this.originalCanvasCursor = this.canvas.style.cursor;
        this.canvas.style.cursor = 'none';
    }

    private disableMouse() {
        this.canvas.removeEventListener('contextmenu', this.onCanvasContextMenu);
        this.canvas.removeEventListener('mousemove', this.onCanvasMouseMove);
        this.canvas.removeEventListener('mousedown', this.onCanvasMouseDown);
        this.canvas.removeEventListener('mouseup', this.onCanvasMouseUp);
        this.canvas.removeEventListener('click', this.onCanvasMouseClick);
        this.canvas.removeEventListener('dblclick', this.onCanvasMouseDblClick);

        this.canvas.style.cursor = this.originalCanvasCursor;
    }

    private fireMouseEvent(event: MouseEvent, screenEventType: ScreenMouseEventType) {
        const handlers = this.eventHandlers[screenEventType];
        Screen.fireHandlers(handlers, {
            type: screenEventType,
            position: this.mouseLocation,
            buttons: event.buttons,
            shiftKey: event.shiftKey,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
        });
    }

    private static fireHandlers<TArg>(handlers: Array<(e: TArg) => void> | undefined, arg: TArg) {
        if (handlers === undefined) {
            return;
        }

        for (const handler of handlers) {
            try {
                handler(arg);
            } catch (err) {
                console.log(`Event handler failed: `, err);
            }
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
