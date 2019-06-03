import { View } from '.';
import { ScreenContext } from '..';
import { EventEmitter, Rect } from '../../common';
import { GUIKeyboardEvent, GUIMouseEvent, OnClick, OnKeyPress, OnMouseEnter, OnMouseLeave } from '../interfaces';
import { Dimension } from '../layout';

export class Button extends View implements OnClick, OnKeyPress, OnMouseEnter, OnMouseLeave {

    public clicked = new EventEmitter<void>();

    private _isMouseOver = false;

    constructor(private _text: string) {
        super();
        const width = Button.calculateWidth(_text);

        this.frame = new Rect(0, 0, width, 1);
        this.width = Dimension.sized(width);
        this.height = Dimension.sized(1);
    }

    public get text() {
        return this._text;
    }

    public set text(value: string) {
        if (this._text === value) {
            return;
        }

        this._text = value;

        const width = Button.calculateWidth(this._text);
        this.frame = this.frame.setSize(width, 1);
        this.width = Dimension.sized(width);
        this.invalidate();
    }

    public draw(ctx: ScreenContext, _region: Rect) {
        ctx.foreground = 15;
        ctx.background = this._isMouseOver ? 3 : 1;
        ctx.moveTo(0, 0);
        ctx.print(`[ ${this._text} ]`);
    }

    public positionCursor(ctx: ScreenContext) {
        ctx.moveTo(2, 0);
    }

    onClick(event: GUIMouseEvent): void {
        this.clicked.emit();
        event.handled = true;
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

    private static calculateWidth(text: string) {
        return text.length + 4;
    }
}
