import { centerString, justifyString, leftAlignString, Rect, rightAlignString } from '../../common';
import { Dimension } from '../layout';
import { ScreenContext } from '../screen-context';
import { View } from '../views';

type TextPosition = 'left' | 'center' | 'right' | 'justify';

export class Label extends View {

    constructor(private _text: string, private _textPosition: TextPosition = 'left', private _autoSize = true) {
        super();
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

        if (this.autoSize) {
            this.resizeToText();
        }
    }

    public get textPosition() {
        return this._textPosition;
    }

    public set textPosition(value: TextPosition) {
        if (this._textPosition === value) {
            return;
        }
        this._textPosition = value;
        this.invalidate();
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
            this.invalidate();
        }
    }

    public draw(ctx: ScreenContext, _region: Rect) {
        const colors = this.theme.default;
        ctx.setColors(this.isEnabled ? colors.normal : colors.disabled);
        ctx.moveTo(0, 0);

        let alignString = leftAlignString;
        if (this.textPosition === 'right') {
            alignString = rightAlignString;
        } else if (this.textPosition === 'center') {
            alignString = centerString;
        } else if (this.textPosition === 'justify') {
            alignString = justifyString;
        }

        const lines = this.text.split('\n');
        if (lines.length < this.bounds.height) {
            for (let i = lines.length; i < this.bounds.height; i++) {
                lines.push('');
            }
        }

        for (let i = 0; i < lines.length; i++) {
            ctx.moveTo(0, i);
            ctx.print(alignString(lines[i], this.bounds.width));
        }
    }

    public resizeToText() {
        const size = Label.measureText(this._text);
        this.frame = this.frame.setSize(size.width, size.height);
        this.width = Dimension.sized(size.width);
        this.height = Dimension.sized(size.height);
    }

    private static measureText(text: string): { width: number, height: number } {
        let width = 0;
        let height = 1;

        let lineWidth = 0;
        for (const c of text) {
            if (c === '\n') {
                width = Math.max(width, lineWidth);
                height = height + 1;
                lineWidth = 0;
            } else {
                lineWidth++;
            }
        }
        width = Math.max(width, lineWidth);

        return { width, height };
    }
}
