import { ModalView, View } from '.';
import { Position } from '../layout';
import { Frame } from './frame';

export class Window extends ModalView {
    private _contentView: Frame;

    public constructor(title: string = '', width?: number, height?: number) {
        super();

        this.x = Position.center();
        this.y = Position.center();
        this.width = width;
        this.height = height;

        this._contentView = new Frame(title);
        this._contentView.headerPosition = 'center';
        this._contentView.frameStyle = 'double';
        this._contentView.fill = true;
        super.addChild(this._contentView);
    }

    public get title() {
        return this._contentView.header;
    }

    public set title(value: string) {
        this._contentView.header = value;
    }

    public addChild(view: View) {
        this._contentView.addChild(view);
    }

    public removeChild(view: View) {
        this._contentView.removeChild(view);
    }
}
