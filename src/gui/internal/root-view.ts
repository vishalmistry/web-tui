import { ScreenContext } from '..';
import { Rect } from '../../common';
import { View } from '../views';

export class RootView extends View {
    public draw(ctx: ScreenContext, region: Rect) {
        ctx.background = 0;
        ctx.foreground = 7;
        for (let y = region.top; y < region.bottom; y++) {
            for (let x = region.left; x < region.right; x++) {
                ctx.moveTo(x, y);
                ctx.setCharacter(0);
            }
        }
        super.draw(ctx, region);
    }
}