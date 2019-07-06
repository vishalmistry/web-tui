import { centerString, justifyString, leftAlignString, Rect, rightAlignString } from '../../common';
import { Dimension } from '../layout';
import { ScreenContext } from '../screen-context';
import { View } from '../views';

type TextPosition = 'left' | 'center' | 'right' | 'justify';

export class Label extends View {
    private _textPosition: TextPosition = 'left';

    constructor(private _text: string) {
        super();
        this.frame = new Rect(0, 0, _text.length, 1);
        this.width = Dimension.sized(_text.length);
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
        this.invalidate();
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

    public draw(ctx: ScreenContext, _region: Rect) {
        const colors = this.theme.default;
        ctx.setColors(this.isEnabled ? colors.normal : colors.disabled);
        ctx.moveTo(0, 0);

        if (this.textPosition === 'left') {
            ctx.print(leftAlignString(this.text, this.bounds.width));
        } else if (this.textPosition === 'right') {
            ctx.print(rightAlignString(this.text, this.bounds.width));
        } else if (this.textPosition === 'center') {
            ctx.print(centerString(this.text, this.bounds.width));
        } else if (this.textPosition === 'justify') {
            ctx.print(justifyString(this.text, this.bounds.width));
        }
    }
}
