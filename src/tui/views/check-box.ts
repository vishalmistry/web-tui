import { ScreenContext, TUIMouseEvent } from '..';
import { EventEmitter, Rect } from '../../common';
import {
    OnClick,
    OnKeyPress,
    OnMouseDown,
    OnMouseEnter,
    OnMouseLeave,
    TUIKeyboardEvent,
    ValueChangedEvent,
} from '../interfaces';
import { Dimension } from '../layout';
import { View } from '../views';

export class CheckBox extends View implements OnMouseDown, OnClick, OnKeyPress, OnMouseEnter, OnMouseLeave {

    public checkChanged = new EventEmitter<ValueChangedEvent<boolean>>();

    private _isMouseOver = false;

    constructor(private _text: string, private _isChecked = false) {
        super();
        this.canFocus = true;

        const width = CheckBox.calculateWidth(_text);
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

        const width = CheckBox.calculateWidth(this._text);
        this.frame = this.frame.setSize(width, 1);
        this.width = Dimension.sized(width);
        this.invalidate(new Rect(4, 0, this.text.length, 1));
    }

    public get isChecked() {
        return this._isChecked;
    }

    public set isChecked(value: boolean) {
        if (this._isChecked === value) {
            return;
        }
        this._isChecked = value;
        this.invalidate(new Rect(1, 0, 1, 1));
    }

    public draw(ctx: ScreenContext, _region: Rect) {
        const colors = this.theme.checkBox;
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
        ctx.print(`[${this._isChecked ? 'x' : ' '}] ${this._text}`);
    }

    public positionCursor(ctx: ScreenContext) {
        ctx.moveTo(1, 0);
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

    onClick(_event: TUIMouseEvent): void {
        this.toggleChecked();
    }

    onKeyPress(event: TUIKeyboardEvent): void {
        if (event.key !== ' ') {
            return;
        }
        this.toggleChecked();
    }

    private toggleChecked() {
        this.isChecked = !this.isChecked;
        this.checkChanged.emit({ source: this, previousValue: !this.isChecked, newValue: this.isChecked });
    }

    private static calculateWidth(text: string) {
        return text.length + 4;
    }
}
