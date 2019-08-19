import { ScreenContext } from '..';
import { Rect } from '../../common';
import { View } from '../views';

export class FillView extends View {
    public draw(ctx: ScreenContext, region: Rect) {
        ctx.background = ctx.palette.defaultBackgroundCode;
        ctx.foreground = ctx.palette.defaultForegroundCode;
        for (let y = region.top; y < region.bottom; y++) {
            for (let x = region.left; x < region.right; x++) {
                ctx.moveTo(x, y);
                ctx.setCharacter(' ');
            }
        }
    }

    protected onFocus() {
        // No-op
    }

    protected onBlur() {
        // No-op
    }
}
