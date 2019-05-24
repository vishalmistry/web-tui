import { View } from '.';
import { ScreenContext } from '..';
import { EventEmitter, Rect } from '../../common';
import { GUIKeyboardEvent, GUIMouseEvent, OnClick, OnKeyPress, OnMouseEnter, OnMouseLeave } from '../interfaces';

export class Button extends View implements OnClick, OnKeyPress, OnMouseEnter, OnMouseLeave {

    public clicked = new EventEmitter<void>();

    private _isMouseOver = false;

    constructor(x: number, y: number, private _text: string) {
        super(Button.calculateFrame(x, y, _text));
    }

    public get text() {
        return this._text;
    }

    public set text(value: string) {
        this._text = value;
        this.frame = Button.calculateFrame(this.frame.x, this.frame.y, value);
        this.invalidate();
    }

    public draw(ctx: ScreenContext, _region?: Rect) {
        ctx.foreground = 15;
        ctx.background = this._isMouseOver ? 3 : 1;
        ctx.moveTo(0, 0);
        ctx.print(`[ ${this._text} ]`);
    }

    public positionCursor(ctx: ScreenContext) {
        ctx.moveTo(2, 0);
    }

    onClick(_event: GUIMouseEvent): void {
        this.clicked.emit();
    }

    onKeyPress(event: GUIKeyboardEvent): void {
        if (event.key !== 'Enter') {
            return;
        }
        this.clicked.emit();
    }

    onMouseEnter(): void {
        this._isMouseOver = true;
        this.invalidate();
    }

    onMouseLeave(): void {
        this._isMouseOver = false;
        this.invalidate();
    }

    private static calculateFrame(x: number, y: number, text: string) {
        return new Rect(x, y, text.length + 4, 1);
    }
}
