import { Rect } from '../../common';
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
            this.drawTextLeft(ctx);
        } else if (this.textPosition === 'right') {
            this.drawTextRight(ctx);
        } else if (this.textPosition === 'center') {
            this.drawTextCenter(ctx);
        } else if (this.textPosition === 'justify') {
            this.drawTextJustify(ctx);
        }
    }

    private drawTextLeft(ctx: ScreenContext) {
        if (this.bounds.width > this.text.length) {
            ctx.print(this.text);
            this.drawPadding(ctx, this.bounds.width - this.text.length);
        } else {
            ctx.print(this.text.substr(0, this.bounds.width));
        }
    }

    private drawTextRight(ctx: ScreenContext) {
        if (this.bounds.width > this.text.length) {
            this.drawPadding(ctx, this.bounds.width - this.text.length);
            ctx.print(this.text);
        } else {
            ctx.print(this.text.substr(Math.max(0, this.text.length - this.bounds.width)));
        }
    }

    private drawTextCenter(ctx: ScreenContext) {
        if (this.bounds.width > this.text.length) {
            const padLeft = Math.floor((this.bounds.width - this.text.length) / 2);
            const padRight = this.bounds.width - padLeft - this.text.length;

            this.drawPadding(ctx, padLeft);
            ctx.print(this.text);
            this.drawPadding(ctx, padRight);
        } else {
            const start = Math.floor((this.text.length - this.bounds.width) / 2);
            ctx.print(this.text.substr(start, this.bounds.width));
        }
    }

    private drawTextJustify(ctx: ScreenContext) {
        if (this.bounds.width > this.text.length) {
            const words = this.text.split(' ').filter((w) => w.length > 0);
            const charCount = words.map((w) => w.length).reduce((p, c) => p + c);
            const remainingSpace = this.bounds.width - charCount;
            const gaps = words.length - 1;
            const wordPad = Math.floor(remainingSpace / gaps);
            const midWord = Math.round(words.length / 2) - 1;
            const midWordPad = wordPad + (remainingSpace - (wordPad * gaps));

            for (let i = 0; i < words.length; i++) {
                ctx.print(words[i]);
                if (i === midWord) {
                    this.drawPadding(ctx, midWordPad);
                } else if (i !== words.length - 1) {
                    this.drawPadding(ctx, wordPad);
                }
            }
        } else {
            this.drawTextLeft(ctx);
        }
    }

    private drawPadding(ctx: ScreenContext, length: number) {
        for (let i = 0; i < length; i++) {
            ctx.print(' ');
        }
    }
}
