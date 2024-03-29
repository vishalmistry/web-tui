import { View } from '.';
import { ScreenContext } from '..';
import { centerString, EventEmitter, Rect } from '../../common';
import {
    OnClick,
    OnKeyPress,
    OnMouseDown,
    OnMouseEnter,
    OnMouseLeave,
    TUIKeyboardEvent,
    ViewEvent,
} from '../interfaces';
import { Dimension } from '../layout';

export class Button extends View implements OnMouseDown, OnClick, OnKeyPress, OnMouseEnter, OnMouseLeave {
    public clicked = new EventEmitter<ViewEvent>();

    private _isMouseOver = false;

    public constructor(private _text: string, private _autoSize = true) {
        super();
        this.canFocus = true;
        this.resizeToText();
    }

    public get text() {
        return this._text;
    }

    public set text(value: string) {
        if (this._text === value) {
            return;
        }

        this._text = value;
        this.invalidate();

        if (this._autoSize) {
            this.resizeToText();
        }
    }

    public get autoSize() {
        return this._autoSize;
    }

    public set autoSize(value: boolean) {
        if (this._autoSize === value) {
            return;
        }

        this._autoSize = value;
        if (this._autoSize) {
            this.resizeToText();
        }
    }

    public draw(ctx: ScreenContext, _region: Rect) {
        const colors = this.theme.button;
        if (!this.isEnabled) {
            ctx.setColors(colors.disabled);
        } else if (this.hasFocus) {
            ctx.setColors(colors.focused);
        } else if (this._isMouseOver) {
            ctx.setColors(colors.hover);
        } else {
            ctx.setColors(colors.normal);
        }

        ctx.moveTo(0, 0);
        ctx.print(`[${centerString(this._text, this.bounds.width - 2)}]`);
    }

    public positionCursor(ctx: ScreenContext) {
        ctx.moveTo(2, 0);
    }

    public resizeToText() {
        const width = Button.calculateWidth(this._text);
        this.frame = this.frame.setSize(width, 1);
        this.width = Dimension.sized(width);
        this.height = Dimension.sized(1);
    }

    onMouseEnter(): void {
        this._isMouseOver = true;
        this.invalidate();
    }

    onMouseLeave(): void {
        this._isMouseOver = false;
        this.invalidate();
    }

    onMouseDown(): void {
        this.hasFocus = true;
    }

    onClick(): void {
        this.fireClickedEvent();
    }

    onKeyPress(event: TUIKeyboardEvent): void {
        if (event.key !== 'Enter') {
            return;
        }
        this.fireClickedEvent();
    }

    private fireClickedEvent() {
        this.clicked.emit({ source: this });
    }

    private static calculateWidth(text: string) {
        return text.length + 4;
    }
}
