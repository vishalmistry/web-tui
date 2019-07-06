import { Rect } from '../../common';
import { Dimension, Position } from '../layout';
import { ScreenContext } from '../screen-context';
import { View } from '../views';

type HeaderPosition = 'left' | 'center' | 'right';
type FrameStyle = 'single' | 'double';

export class Frame extends View {
    private _contentView: View;
    private _headerPosition: HeaderPosition = 'left';
    private _frameStyle: FrameStyle = 'single';

    constructor(private _header: string, frame?: Rect) {
        super(frame);

        this._contentView = new View();
        this._contentView.x = Position.at(1);
        this._contentView.y = Position.at(1);
        this._contentView.width = Dimension.fill().subtract(1);
        this._contentView.height = Dimension.fill().subtract(1);
        super.addChild(this._contentView);
    }

    public get header() {
        return this._header;
    }

    public set header(value: string) {
        if (this._header === value) {
            return;
        }

        this._header = value;
        this.invalidate(new Rect(2, 0, this.bounds.width - 4, 1));
    }

    public get headerPosition() {
        return this._headerPosition;
    }

    public set headerPosition(value: HeaderPosition) {
        if (this._headerPosition === value) {
            return;
        }
        this._headerPosition = value;
        this.invalidate(new Rect(2, 0, this.bounds.width - 4, 1));
    }

    public get frameStyle() {
        return this._frameStyle;
    }

    public set frameStyle(value: FrameStyle) {
        if (this._frameStyle === value) {
            return;
        }
        this._frameStyle = value;
        this.invalidate();
    }

    public addChild(view: View) {
        this._contentView.addChild(view);
    }

    public removeChild(view: View) {
        this._contentView.removeChild(view);
    }

    public draw(ctx: ScreenContext, region: Rect) {
        const colors = this.theme.default;
        ctx.setColors(this.isEnabled ? colors.normal : colors.disabled);

        for (let y = region.top; y < region.bottom; y++) {
            for (let x = region.left; x < region.right; x++) {
                ctx.moveTo(x, y);
                ctx.setCharacter(' ');
            }
        }

        ctx.drawFrame(this.bounds, this._frameStyle);

        const availableSpace = Math.max(0, this.bounds.width - 4);
        if (this.header.length > 0 && availableSpace > 0) {
            if (this.headerPosition === 'left') {
                const header  = this.header.substr(0, availableSpace);
                ctx.moveTo(1, 0);
                ctx.print(` ${header} `);
            } else if (this.headerPosition === 'right') {
                const header  = this.header.substr(Math.max(0, this.header.length - availableSpace));
                ctx.moveTo((this.bounds.width - 3) - header.length, 0);
                ctx.print(` ${header} `);
            } else if (this.headerPosition === 'center') {
                let x = 0;
                let header = this.header;
                if (header.length > availableSpace) {
                    const start = Math.floor((header.length - availableSpace) / 2);
                    header = header.substr(start, availableSpace);
                } else {
                    x = Math.round((availableSpace - header.length) / 2);
                }

                ctx.moveTo(x + 1, 0);
                ctx.print(` ${header} `);
            }
        }

        super.draw(ctx, region);
    }
}
