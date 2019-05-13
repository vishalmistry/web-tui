import { GUIMouseEvent, OnClick, OnKeyPress, Rect, View } from '..';
import { GUIKeyboardEvent, OnDoubleClick } from '../interfaces';
import { ScreenContext } from '../screen-context';

export class Border extends View implements OnClick, OnKeyPress, OnDoubleClick {
    private createdView?: Border;
    public lastKey?: string;
    public background = 0;

    constructor(frame: Rect, private _mainView?: View) {
        super(frame);
    }

    public draw(ctx: ScreenContext, region?: Rect) {
        if (region === undefined) {
            region = this.bounds;
        }

        ctx.background = this.background;
        ctx.foreground = 15;
        for (let y = region.top; y <= region.bottom; y++) {
            for (let x = region.left; x <= region.right; x++) {
                ctx.moveTo(x, y);
                ctx.setCharacter(this.hasFocus ? ':' : ' ');
            }
        }

        ctx.moveTo(1, 0);
        ctx.horizontalRepeat(196, this.bounds.width - 2);
        ctx.moveTo(1, this.bounds.bottom);
        ctx.horizontalRepeat(196, this.bounds.width - 2);
        ctx.moveTo(0, 1);
        ctx.verticalRepeat(179, this.bounds.height - 2);
        ctx.moveTo(this.bounds.right, 1);
        ctx.verticalRepeat(179, this.bounds.height - 2);

        let message = 'HELLO WORLD';
        const y = Math.floor(this.bounds.height / 2);
        let x = 0;
        if (message.length > this.bounds.width) {
            const start = Math.floor(message.length / 2) - Math.floor(this.bounds.width / 2);
            message = message.substr(start, this.bounds.width);
        } else {
            x = Math.round(this.bounds.width / 2) - Math.round(message.length / 2);
        }

        ctx.moveTo(x, y);
        ctx.print(message);

        if (this.lastKey !== undefined) {
            ctx.moveTo(0, 0);
            ctx.setCharacter(this.lastKey);
        }

        super.draw(ctx, region);
    }

    public click(event: GUIMouseEvent) {
        if (event.shiftKey) {
            this.hasFocus = true;
        } else {
            this.background = (this.background + 1) % 16;
            this.invalidate();
        }
    }

    public doubleClick(_event: GUIMouseEvent) {
        if (this._mainView === undefined) {
            return;
        }

        if (this.createdView !== undefined) {
            this._mainView.removeChild(this.createdView);
            this.createdView = undefined;
            return;
        }

        this.createdView = new Border(new Rect(16, 2, 4, 1));
        this.createdView.background = 3;
        this.createdView.hasFocus = false;
        this._mainView.addChild(this.createdView);
    }

    public keyPress(event: GUIKeyboardEvent) {
        this.lastKey = event.key;
        this.invalidate(new Rect(0, 0, 1, 1));
    }
}
