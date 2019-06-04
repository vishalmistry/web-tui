import { Glyph } from '.';
import { EventEmitter } from '../common';
import { Palette } from './palette';

interface Point {
    readonly x: number;
    readonly y: number;
}
function isPoint(object: any): object is Point {
    return typeof object.x === 'number' && typeof object.y === 'number';
}

interface Size {
    readonly width: number;
    readonly height: number;
}

type ScreenKeyboardEventType = 'keyup' | 'keydown' | 'keypress';
type ScreenMouseEventType = 'mousemove' | 'mousedown' | 'mouseup' | 'click' | 'dblclick';

interface ScreenInputEvent<T extends string> {
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

    public readonly resized = new EventEmitter<void>();

    public readonly keyDown = new EventEmitter<ScreenKeyboardEvent>();
    public readonly keyUp = new EventEmitter<ScreenKeyboardEvent>();
    public readonly keyPress = new EventEmitter<ScreenKeyboardEvent>();

    public readonly mouseMove = new EventEmitter<ScreenMouseEvent>();
    public readonly mouseDown = new EventEmitter<ScreenMouseEvent>();
    public readonly mouseUp = new EventEmitter<ScreenMouseEvent>();
    public readonly click = new EventEmitter<ScreenMouseEvent>();
    public readonly doubleClick = new EventEmitter<ScreenMouseEvent>();

    private _glyphWidth = Glyph.WIDTH;
    private _glyphHeight = Glyph.HEIGHT;

    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;
    private _columns = 0;
    private _rows = 0;
    private _state: Glyph[][] = [];

    private _palette: Palette;
    public foreground: number;
    public background: number;

    private _isResizable = false;

    private _isCursorVisible = false;
    private _cursorBlinkTimerHandle?: number;
    private _cursorLocation: Point = { x: 0, y: 0 };

    private _isKeyboardEnabled = false;
    private _originalCanvasTabIndex = -1;

    private _isMouseEnabled = false;
    private _originalCanvasCursor: string | null = null;
    private _mouseLocation: Point = { x: 0, y: 0 };

    constructor(private _container: HTMLElement, dimensions?: Size, palette?: Palette) {
        const canvas = this.createCanvas(_container, dimensions);
        const context = canvas.getContext('2d');
        if (context === null) {
            throw new Error('Unable to get canvas 2D context');
        }

        this._canvas = canvas;
        this._context = context;

        this._palette = palette === undefined ? Palette.dos : palette;
        this.foreground = this._palette.defaultForegroundCode;
        this.background = this._palette.defaultBackgroundCode;

        this.refresh();
    }

    public get columns() {
        return this._columns;
    }

    public get rows() {
        return this._rows;
    }

    public get palette() {
        return this._palette;
    }

    public set palette(value: Palette) {
        if (this._palette === value) {
            return;
        }

        this._palette = value;
        this.render(0, 0, this.columns, this.rows);
    }

    public get cursorLocation() {
        return this._cursorLocation;
    }

    private get mouseLocation() {
        return this._mouseLocation;
    }

    public get isResizable() {
        return this._isResizable;
    }

    public set isResizable(value: boolean) {
        if (this._isResizable === value) {
            return;
        }

        this._isResizable = value;
        if (this._isResizable) {
            window.addEventListener('resize', this.onWindowResize);
        } else {
            window.removeEventListener('resize', this.onWindowResize);
        }
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

    public moveTo(position: Point | [number, number]): void;
    public moveTo(x: number, y: number): void;
    moveTo(a: Point | [number, number] | number, b?: number) {
        let newCursorLocation: Point;
        if (isPoint(a)) {
            newCursorLocation = a;
        } else if (typeof a === 'object') {
            newCursorLocation = { x: a[0], y: a[1] };
        } else if (typeof a === 'number' && typeof b === 'number') {
            newCursorLocation = { x: a, y: b };
        } else {
            throw new Error('Bad arguments');
        }

        if (newCursorLocation.x < 0 || newCursorLocation.x >= this.columns) {
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

    public destroy() {
        this.isResizable = false;
        this.isCursorVisible = false;
        this.isKeyboardEnabled = false;
        this.isMouseEnabled = false;
    }

    private rerenderGlyphAtCursor() {
        const isMouseAtCursor = this.cursorLocation.x === this.mouseLocation.x &&
                                this.cursorLocation.y === this.mouseLocation.y;

        this.renderGlyph(
            this._state[this.cursorLocation.y][this.cursorLocation.x],
            this.cursorLocation.x,
            this.cursorLocation.y,
            isMouseAtCursor);
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
        this.fireMouseEvent(event, 'mousemove', this.mouseMove);
    }

    private onWindowResize = (_event: UIEvent) => {
        const containerRect = this._container.getBoundingClientRect();
        if (containerRect.width === this._canvas.width &&
            containerRect.height === this._canvas.height) {
            return;
        }

        this._canvas.width = containerRect.width;
        this._canvas.height = containerRect.height;
        this.refresh();
    }

    private onCanvasKeyDown = (event: KeyboardEvent) => this.fireKeyboardEvent(event, 'keydown', this.keyDown);
    private onCanvasKeyUp = (event: KeyboardEvent) => this.fireKeyboardEvent(event, 'keyup', this.keyUp);
    private onCanvasKeyPress = (event: KeyboardEvent) => this.fireKeyboardEvent(event, 'keypress', this.keyPress);
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
    private onCanvasMouseDown = (event: MouseEvent) => this.fireMouseEvent(event, 'mousedown', this.mouseDown);
    private onCanvasMouseUp = (event: MouseEvent) => this.fireMouseEvent(event, 'mouseup', this.mouseUp);
    private onCanvasMouseClick = (event: MouseEvent) => this.fireMouseEvent(event, 'click', this.click);
    private onCanvasMouseDblClick = (event: MouseEvent) => this.fireMouseEvent(event, 'dblclick', this.doubleClick);

    private showCursor() {
        let isCursorGlyphVisible = false;
        this._cursorBlinkTimerHandle = setInterval(() => {

            isCursorGlyphVisible = !isCursorGlyphVisible;
            if (isCursorGlyphVisible) {
                const isMouseAtCursor = this.cursorLocation.x === this.mouseLocation.x &&
                                        this.cursorLocation.y === this.mouseLocation.y;
                this.renderCursor(this.cursorLocation.x, this.cursorLocation.y, isMouseAtCursor);
            } else {
                this.rerenderGlyphAtCursor();
            }
        }, Screen.CURSOR_BLINK_INTERVAL);
    }

    private hideCursor() {
        clearInterval(this._cursorBlinkTimerHandle);
        this.rerenderGlyphAtCursor();
    }

    private enableKeyboard() {
        this._canvas.addEventListener('keydown', this.onCanvasKeyDown);
        this._canvas.addEventListener('keyup', this.onCanvasKeyUp);
        this._canvas.addEventListener('keypress', this.onCanvasKeyPress);

        this._originalCanvasTabIndex = this._canvas.tabIndex;
        if (this._originalCanvasTabIndex < 0) {
            this._canvas.tabIndex = 0;
        }
    }

    private disableKeyboard() {
        this._canvas.removeEventListener('keydown', this.onCanvasKeyDown);
        this._canvas.removeEventListener('keyup', this.onCanvasKeyUp);
        this._canvas.removeEventListener('keypress', this.onCanvasKeyPress);

        this._canvas.tabIndex = this._originalCanvasTabIndex;
    }

    private fireKeyboardEvent(event: KeyboardEvent, screenEventType: ScreenKeyboardEventType, emitter: EventEmitter<ScreenKeyboardEvent>) {
        emitter.emit({
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
        this._canvas.addEventListener('contextmenu', this.onCanvasContextMenu);
        this._canvas.addEventListener('mousemove', this.onCanvasMouseMove);
        this._canvas.addEventListener('mousedown', this.onCanvasMouseDown);
        this._canvas.addEventListener('mouseup', this.onCanvasMouseUp);
        this._canvas.addEventListener('click', this.onCanvasMouseClick);
        this._canvas.addEventListener('dblclick', this.onCanvasMouseDblClick);

        this._originalCanvasCursor = this._canvas.style.cursor;
        this._canvas.style.cursor = 'none';
    }

    private disableMouse() {
        this._canvas.removeEventListener('contextmenu', this.onCanvasContextMenu);
        this._canvas.removeEventListener('mousemove', this.onCanvasMouseMove);
        this._canvas.removeEventListener('mousedown', this.onCanvasMouseDown);
        this._canvas.removeEventListener('mouseup', this.onCanvasMouseUp);
        this._canvas.removeEventListener('click', this.onCanvasMouseClick);
        this._canvas.removeEventListener('dblclick', this.onCanvasMouseDblClick);

        this.renderGlyph(
            this._state[this.mouseLocation.y][this.mouseLocation.x],
            this.mouseLocation.x,
            this.mouseLocation.y);
        this._canvas.style.cursor = this._originalCanvasCursor;
        this._mouseLocation = { x: 0, y: 0 };
    }

    private fireMouseEvent(event: MouseEvent, screenEventType: ScreenMouseEventType, emitter: EventEmitter<ScreenMouseEvent>) {
        emitter.emit({
            type: screenEventType,
            position: this.mouseLocation,
            buttons: event.buttons,
            shiftKey: event.shiftKey,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
        });
    }

    private refresh() {
        const canvas = this._context.canvas;
        const newColumns = Math.max(Math.floor(canvas.width / this._glyphWidth), 1);
        const newRows = Math.max(Math.floor(canvas.height / this._glyphHeight), 1);

        if (this._columns === newColumns && this._rows === newRows) {
            this.render(0, 0, this._columns, this._rows);
            return;
        }

        const createGlyph = (x: number, y: number) => {
            const glyph = new Glyph();
            glyph.foreground = this._palette.defaultForegroundCode;
            glyph.background = this._palette.defaultBackgroundCode;
            glyph.changed.subscribe(() => {
                const isMouseOver = x === this.mouseLocation.x &&
                                    y === this.mouseLocation.y;
                this.renderGlyph(glyph, x, y, isMouseOver);
            });
            return glyph;
        };

        if (newRows < this._rows) {
            const removedRows = this._rows - newRows;
            this._state.splice(this._rows - removedRows - 1, removedRows);
        } else if (newRows > this._rows) {
            for (let y = this._rows; y < newRows; y++) {
                const row: Glyph[] = [];
                for (let x = 0; x < this._columns; x++) {
                    row.push(createGlyph(x, y));
                }
                this._state.push(row);
            }
        }
        this._rows = newRows;

        if (newColumns < this.columns) {
            const removedColumns = this.columns - newColumns;
            for (const row of this._state) {
                row.splice(this._columns - removedColumns - 1, removedColumns);
            }
        } else if (newColumns > this._columns) {
            for (let y = 0; y < this._rows; y++) {
                const row = this._state[y];
                for (let x = this._columns; x < newColumns; x++) {
                    row.push(createGlyph(x, y));
                }
            }
        }
        this._columns = newColumns;

        this._mouseLocation = {
            x: Math.min(this.columns - 1, this.mouseLocation.x),
            y: Math.min(this.rows - 1, this.mouseLocation.y),
        };
        this._cursorLocation = {
            x: Math.min(this.columns - 1, this.cursorLocation.x),
            y: Math.min(this.rows - 1, this.cursorLocation.y),
        };

        this.render(0, 0, this._columns, this._rows);
        this.resized.emit();
    }

    private createCanvas(container: HTMLElement, dimensions?: Size) {
        const canvas = document.createElement('canvas');

        if (dimensions !== undefined) {
            canvas.width = dimensions.width * this._glyphWidth;
            canvas.height = dimensions.height * this._glyphHeight;
        } else {
            const containerRect = container.getBoundingClientRect();
            canvas.width = containerRect.width;
            canvas.height = containerRect.height;
        }

        container.appendChild(canvas);
        return canvas;
    }
}
