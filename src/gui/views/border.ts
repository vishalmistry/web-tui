import { GUIMouseEvent, OnClick, OnKeyPress, Rect, View } from '..';
import { Screen } from '../../screen';
import { GUIKeyboardEvent } from '../interfaces';

export class Border extends View implements OnClick, OnKeyPress {
    public lastKey?: string; 
    public background = 0;

    public draw(screen: Screen, region: Rect) {
        screen.background = this.background;
        screen.foreground = 15;
        for (let y = region.top; y <= region.bottom; y++) {
            for (let x = region.left; x <= region.right; x++) {
                screen.moveTo(this.getAbsLocation(x, y));
                screen.setCharacter(this.hasFocus ? ':' : ' ');
            }
        }

        if (this.lastKey !== undefined) {
            screen.moveTo(this.getAbsLocation(0, 0));
            screen.setCharacter(this.lastKey);
        }

        super.draw(screen, region);
    }

    public click(_event: GUIMouseEvent) {
        this.hasFocus = true;
    }

    public keyPress(event: GUIKeyboardEvent) {
        this.lastKey = event.key;
        this.invalidate(new Rect(0, 0, 1, 1));
    }
}
