import { GUIKeyboardEvent, ScreenContext } from '..';
import { Rect } from '../../common';
import { DosTheme } from '../dos-theme';
import { OnKeyDown } from '../interfaces';
import { View } from '../views';

export class RootView extends View implements OnKeyDown {
    constructor() {
        super();

        this.theme = DosTheme.instance;
    }

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
        if (event.key === 'Tab') {
            if (event.shiftKey) {
                if (this.focusedView !== undefined) {
                    if (!this.focusedView.focusPrevious()) {
                        this.focusLast();
                    }
                } else {
                    this.focusLast();
                }
            } else {
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
}
