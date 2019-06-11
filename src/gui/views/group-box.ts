import { View } from '.';
import { Rect } from '../../common';
import { Dimension, Position } from '../layout';
import { ScreenContext } from '../screen-context';

export class GroupBox extends View {
    private _contentView: View;

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

        const oldHeaderRect = new Rect(1, 0, Math.min(this.bounds.width - 6, this._header.length + 2), 1);

        this._header = value;
        this.invalidate(oldHeaderRect);
        this.invalidate(new Rect(1, 0, Math.min(this.bounds.width - 6, this._header.length + 2) , 1));
    }

    public addChild(view: View) {
        this._contentView.addChild(view);
    }

    public removeChild(view: View) {
        this._contentView.removeChild(view);
    }

    public draw(ctx: ScreenContext, region: Rect) {
        ctx.drawFrame(this.bounds, 'single');

        const header = this._header.substr(0, Math.max(0, this.bounds.width - 6));
        if (header.length > 0) {
            ctx.moveTo(1, 0);
            ctx.print(` ${header} `);
        }

        super.draw(ctx, region);
    }
}
