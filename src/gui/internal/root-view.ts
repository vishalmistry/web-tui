import { GUIKeyboardEvent, ScreenContext } from '..';
import { Rect } from '../../common';
import { OnKeyDown } from '../interfaces';
import { View } from '../views';

export class RootView extends View implements OnKeyDown {
    public draw(ctx: ScreenContext, region: Rect) {
        ctx.background = 0;
        ctx.foreground = 7;
        for (let y = region.top; y < region.bottom; y++) {
            for (let x = region.left; x < region.right; x++) {
                ctx.moveTo(x, y);
                ctx.setCharacter(' ');
            }
        }
        super.draw(ctx, region);
    }

    onKeyDown(event: GUIKeyboardEvent): void {
        if (event.key === '~') {
            if (this.focusedView !== undefined) {
                if (!this.focusedView.focusPrevious()) {
                    this.focusPrevious();
                }
            } else {
                this.focusPrevious();
            }
            return;
        }
        if (event.key === '`') {
            if (this.focusedView !== undefined) {
                if (!this.focusedView.focusNext()) {
                    this.focusNext();
                }
            } else {
                this.focusNext();
            }
        }
    }
}
