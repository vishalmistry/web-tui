import { View } from '.';
import { ScreenContext } from '..';
import { EventEmitter, leftAlignString, Rect, repeatString } from '../../common';
import {
    OnKeyDown,
    OnKeyPress,
    OnMouseDown,
    OnMouseEnter,
    OnMouseLeave,
    TUIKeyboardEvent,
    TUIMouseEvent,
    ValueChangedEvent,
} from '../interfaces';
import { Dimension } from '../layout';

export class TextBox extends View implements OnMouseDown, OnKeyPress, OnKeyDown, OnMouseEnter, OnMouseLeave {
    public textChanged = new EventEmitter<ValueChangedEvent<string>>();

    private _isMouseOver = false;
    private _viewStart = 0;
    private _cursorPosition = 0;

    constructor(private _text: string = '', private _isSecret = false) {
        super();
        this.canFocus = true;
        this.height = Dimension.sized(1);
        this.width = Dimension.fill();
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

        if (this.cursorPosition > value.length) {
            this.cursorPosition = value.length;
        }
    }

    public get isSecret() {
        return this._isSecret;
    }

    public set isSecret(value: boolean) {
        if (this._isSecret === value) {
            return;
        }
        this.isSecret = value;
        this.invalidate();
    }

    public get cursorPosition() {
        return this._cursorPosition;
    }

    public set cursorPosition(value: number) {
        if (this._cursorPosition === value) {
            return;
        }
        this._cursorPosition = value;

        if (value < this._viewStart) {
            this._viewStart = value;
        } else if ((value - this._viewStart) >= this.bounds.width) {
            this._viewStart = (value - this.bounds.width) + 1;
        }
        this.invalidate();
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

        const text = this._isSecret ? repeatString('*', this.text.length) : this.text;
        const visibleText = text.substr(this._viewStart);
        ctx.print(leftAlignString(visibleText, this.bounds.width));
    }

    public positionCursor(ctx: ScreenContext) {
        ctx.moveTo(this._cursorPosition - this._viewStart, 0);
    }

    onMouseEnter(): void {
        this._isMouseOver = true;
        this.invalidate();
    }

    onMouseLeave(): void {
        this._isMouseOver = false;
        this.invalidate();
    }

    onMouseDown(event: TUIMouseEvent): void {
        this.cursorPosition = Math.min(this.text.length, this._viewStart + event.x);
        this.hasFocus = true;
    }

    onKeyDown(event: TUIKeyboardEvent): void {
        switch (event.code) {
            case 'Backspace':
                const atLastChar = (this.cursorPosition === this.text.length);
                this.setText(this.text.substr(0, this.cursorPosition - 1) + this.text.substr(this.cursorPosition));
                if (!atLastChar) {
                    this.cursorPosition = Math.max(0, this.cursorPosition - 1);
                }
                return;
            case 'Delete':
                this.setText(this.text.substr(0, this.cursorPosition) + this.text.substr(this.cursorPosition + 1));
                return;
            case 'ArrowLeft':
                this.cursorPosition = Math.max(0, this.cursorPosition - 1);
                return;
            case 'ArrowRight':
                this.cursorPosition = Math.min(this.text.length, this.cursorPosition + 1);
                return;
            case 'KeyA':
                if (event.ctrlKey) {
                    this.cursorPosition = 0;
                }
                return;
            case 'KeyE':
                if (event.ctrlKey) {
                    this.cursorPosition = this.text.length;
                }
                return;
        }
    }

    onKeyPress(event: TUIKeyboardEvent): void {
        if (event.altKey || event.ctrlKey || event.metaKey) {
            return;
        }

        if (event.key.length === 1) {
            this.setText(this.text.substr(0, this.cursorPosition) + event.key + this.text.substr(this.cursorPosition));
            this.cursorPosition = this.cursorPosition + 1;
        }
    }

    private setText(newText: string) {
        if (this.text === newText) {
            return;
        }
        const previousText = this.text;
        this.text = newText;
        this.textChanged.emit({ source: this, previousValue: previousText, newValue: this.text });
    }
}
