import { Glyph } from '.';
import { Palette } from './palette';

interface Point {
    readonly x: number;
    readonly y: number;
}
function isCoord(object: any): object is Point {
    return typeof object === 'object' && 'x' in object && 'y' in object;
}

export type EventHandler<TArg> = (event: TArg) => void;
export type ScreenKeyboardEventType = 'keyup' | 'keydown' | 'keypress';
export type ScreenMouseEventType = 'mousemove' | 'mousedown' | 'mouseup' | 'click' | 'dblclick';
export type ScreenInputEventTypes = ScreenKeyboardEventType | ScreenMouseEventType;

export interface ScreenInputEvent<T extends string> {
    readonly type: T;
    readonly shiftKey: boolean;
    readonly ctrlKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
}

export interface ScreenKeyboardEvent extends ScreenInputEvent<ScreenKeyboardEventType> {
    readonly code: string;
    readonly key: string;
}

export interface ScreenMouseEvent extends ScreenInputEvent<ScreenMouseEventType> {
    readonly position: Point;
    readonly buttons: number;
}

export class Screen {
    private static readonly CURSOR_BLINK_INTERVAL = 100;

    private _glyphWidth = Glyph.WIDTH;
    private _glyphHeight = Glyph.HEIGHT;

    private _context: CanvasRenderingContext2D;
    private _columns: number;
    private _rows: number;
    private _palette = Palette.default;
    private _state: Glyph[][];

    public foreground = this._palette.defaultForegroundCode;
    public background = this._palette.defaultBackgroundCode;

    private _isCursorVisible = false;
    private _cursorBlinkTimerHandle?: number;
    private _cursorLocation: Point = { x: 0, y: 0 };

    private _isKeyboardEnabled = false;
    private _originalCanvasTabIndex = -1;

    private _isMouseEnabled = false;
    private _originalCanvasCursor: string | null = null;
    private _mouseLocation: Point = { x: 0, y: 0 };

    private _eventHandlers: { [key in ScreenMouseEventType]?: Array<EventHandler<ScreenMouseEvent>>; } &
                            { [key in ScreenKeyboardEventType]?: Array<EventHandler<ScreenKeyboardEvent>>; } = {};

    constructor(private canvas: HTMLCanvasElement) {
        const context = canvas.getContext('2d');
        if (context === null) {
            throw new Error('Unable to get canvas 2D context');
        }

        this._context = context;
        this._columns = Math.floor(canvas.width / this._glyphWidth);
        this._rows = Math.floor(canvas.height / this._glyphHeight);
        this._state = Screen.createState(
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

    public get cursorLocation() {
        return this._cursorLocation;
    }

    private get mouseLocation() {
        return this._mouseLocation;
    }

    public get isCursorVisible() {
        return this._isCursorVisible;
    }

    public set isCursorVisible(isVisible: boolean) {
        if (this._isCursorVisible === isVisible) {
            return;
        }

        this._isCursorVisible = isVisible;
        if (this._isCursorVisible) {
            this.showCursor();
        } else {
            this.hideCursor();
        }
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

    public moveTo(position: Point): void;
    public moveTo(x: number, y: number): void;
    moveTo(a: Point | number, b?: number) {
        let newCursorLocation: Point;
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

        if (this.isCursorVisible) {
            this.rerenderGlyphAtCursor();
        }

        this._cursorLocation = newCursorLocation;
    }

    public setCharacter(char: string | number): void {
        const glyph = this._state[this.cursorLocation.y][this.cursorLocation.x];
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
            const glyph = this._state[y][x++];
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

        this.moveTo(x, y);
    }

    public render(x: number, y: number, w: number, h: number) {
        for (let j = y; j < (y + h); j++) {
            for (let i = x; i < (x + w); i++) {
                this.renderGlyph(this._state[j][i], i, j);
            }
        }
    }

    public addEventHandler(event: ScreenKeyboardEventType, handler: EventHandler<ScreenKeyboardEvent>): void;
    public addEventHandler(event: ScreenMouseEventType, handler: EventHandler<ScreenMouseEvent>): void;
    addEventHandler(event: ScreenInputEventTypes, handler: EventHandler<any>) {
        let eventHandlers = this._eventHandlers[event];
        if (eventHandlers === undefined) {
            eventHandlers = [];
            this._eventHandlers[event] = eventHandlers;
        }

        if (eventHandlers.indexOf(handler) < 0) {
            eventHandlers.push(handler);
        }
    }

    public removeEventHandler(event: ScreenKeyboardEventType, handler: EventHandler<ScreenKeyboardEvent>): void;
    public removeEventHandler(event: ScreenMouseEventType, handler: EventHandler<ScreenMouseEvent>): void;
    removeEventHandler(event:  ScreenInputEventTypes, handler: EventHandler<any>) {
        const eventHandlers = this._eventHandlers[event];
        if (eventHandlers === undefined) {
            return;
        }

        const index = eventHandlers.indexOf(handler);
        if (index >= 0) {
            eventHandlers.splice(index, 1);
        }
    }

    public destroy() {
        this.isCursorVisible = false;
        this.isKeyboardEnabled = false;
        this.isMouseEnabled = false;
    }

    private rerenderGlyphAtCursor(invert = false) {
        this.renderGlyph(
            this._state[this.cursorLocation.y][this.cursorLocation.x],
            this.cursorLocation.x,
            this.cursorLocation.y,
            invert);
    }

    private renderGlyph = (g: Glyph, x: number, y: number, invert = false) => {
        g.render(this._context, x * this._glyphWidth, y * this._glyphHeight, this._palette, invert);
    }

    private renderCursor(x: number, y: number, invert = false) {
        const absX = x * this._glyphWidth;
        const absY = y * this._glyphHeight;
        const color = invert
            ? this._palette.getInvertedColor(this._state[y][x].foreground)
            : this._palette.getColor(this._state[y][x].foreground);

        this._context.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
        this._context.fillRect(absX, absY + this._glyphHeight - 3, this._glyphWidth, 2);
    }

    private onMouseMove(event: MouseEvent, previous: Point, current: Point) {
        this.renderGlyph(this._state[previous.y][previous.x], previous.x, previous.y);
        this.renderGlyph(this._state[current.y][current.x], current.x, current.y, true);
        this.fireMouseEvent(event, 'mousemove');
    }

    private onCanvasKeyDown = (event: KeyboardEvent) => this.fireKeyboardEvent(event, 'keydown');
    private onCanvasKeyUp = (event: KeyboardEvent) => this.fireKeyboardEvent(event, 'keyup');
    private onCanvasKeyPress = (event: KeyboardEvent) => this.fireKeyboardEvent(event, 'keypress');
    private onCanvasContextMenu = (event: MouseEvent) => event.preventDefault();
    private onCanvasMouseMove = (event: MouseEvent) => {
        const posX = Math.floor(event.clientX / this._glyphWidth);
        const posY = Math.floor(event.clientY / this._glyphHeight);

        if (posX < this.columns && posY < this.rows) {
            if (this.mouseLocation.x !== posX || this.mouseLocation.y !== posY) {
                const oldLocation = this.mouseLocation;
                this._mouseLocation = { x: posX, y: posY };
                this.onMouseMove(event, oldLocation, this.mouseLocation);
            }
        }
    }
    private onCanvasMouseDown = (event: MouseEvent) => this.fireMouseEvent(event, 'mousedown');
    private onCanvasMouseUp = (event: MouseEvent) => this.fireMouseEvent(event, 'mouseup');
    private onCanvasMouseClick = (event: MouseEvent) => this.fireMouseEvent(event, 'click');
    private onCanvasMouseDblClick = (event: MouseEvent) => this.fireMouseEvent(event, 'dblclick');

    private showCursor() {
        let isCursorGlyphVisible = false;
        this._cursorBlinkTimerHandle = setInterval(() => {
            const isMouseAtCursor = this.cursorLocation.x === this.mouseLocation.x &&
                                    this.cursorLocation.y === this.mouseLocation.y;

            isCursorGlyphVisible = !isCursorGlyphVisible;
            if (isCursorGlyphVisible) {
                this.renderCursor(this.cursorLocation.x, this.cursorLocation.y, isMouseAtCursor);
            } else {
                this.rerenderGlyphAtCursor(isMouseAtCursor);
            }
        }, Screen.CURSOR_BLINK_INTERVAL);
    }

    private hideCursor() {
        clearInterval(this._cursorBlinkTimerHandle);
        this.rerenderGlyphAtCursor();
    }

    private enableKeyboard() {
        this.canvas.addEventListener('keydown', this.onCanvasKeyDown);
        this.canvas.addEventListener('keyup', this.onCanvasKeyUp);
        this.canvas.addEventListener('keypress', this.onCanvasKeyPress);

        this._originalCanvasTabIndex = this.canvas.tabIndex;
        if (this._originalCanvasTabIndex < 0) {
            this.canvas.tabIndex = 0;
        }
    }

    private disableKeyboard() {
        this.canvas.removeEventListener('keydown', this.onCanvasKeyDown);
        this.canvas.removeEventListener('keyup', this.onCanvasKeyUp);
        this.canvas.removeEventListener('keypress', this.onCanvasKeyPress);

        this.canvas.tabIndex = this._originalCanvasTabIndex;
    }

    private fireKeyboardEvent(event: KeyboardEvent, screenEventType: ScreenKeyboardEventType) {
        const handlers = this._eventHandlers[screenEventType];
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

        this._originalCanvasCursor = this.canvas.style.cursor;
        this.canvas.style.cursor = 'none';
    }

    private disableMouse() {
        this.canvas.removeEventListener('contextmenu', this.onCanvasContextMenu);
        this.canvas.removeEventListener('mousemove', this.onCanvasMouseMove);
        this.canvas.removeEventListener('mousedown', this.onCanvasMouseDown);
        this.canvas.removeEventListener('mouseup', this.onCanvasMouseUp);
        this.canvas.removeEventListener('click', this.onCanvasMouseClick);
        this.canvas.removeEventListener('dblclick', this.onCanvasMouseDblClick);

        this.renderGlyph(
            this._state[this.mouseLocation.y][this.mouseLocation.x],
            this.mouseLocation.x,
            this.mouseLocation.y);
        this.canvas.style.cursor = this._originalCanvasCursor;
        this._mouseLocation = { x: 0, y: 0 };
    }

    private fireMouseEvent(event: MouseEvent, screenEventType: ScreenMouseEventType) {
        const handlers = this._eventHandlers[screenEventType];
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
