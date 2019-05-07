import { GUIMouseEvent, OnClick, Rect, View } from '..';
import { Screen } from '../../screen';

export class Border extends View implements OnClick {
    public background = 0;

    public draw(screen: Screen, region: Rect) {
        screen.background = this.background;
        screen.foreground = 15;
        for (let y = region.top; y <= region.bottom; y++) {
            for (let x = region.left; x <= region.right; x++) {
                screen.moveTo(this.getAbsLocation(x, y));
                screen.setCharacter(' ');
            }
        }
    }

    public click(_event: GUIMouseEvent) {
        this.background = (this.background + 1) % 16;
        this.invalidate();
    }
}
