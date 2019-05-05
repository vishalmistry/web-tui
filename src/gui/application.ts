import { View } from '.';
import { Screen, ScreenMouseEvent } from '../screen';

export class Application {

    constructor(private screen: Screen, private mainView: View) {
    }

    public start() {
        this.mainView.redraw();

        this.screen.addEventHandler('click', this.onMouseClick);
    }

    onMouseClick = (event: ScreenMouseEvent) => {
        const target = Application.findTarget(this.mainView, event.position.x, event.position.y);
        if (target.view !== undefined) {
            console.log(`${target.view.index} @ (${target.x}, ${target.y})`);
        }
    }

    private static findTarget(view: View, px: number, py: number): { view: View | undefined, x: number, y: number } {
        if (!view.bounds.contains(px, py)) {
            return { view: undefined, x: 0, y: 0 };
        }

        const relativeX = px - view.bounds.x;
        const relativeY = py - view.bounds.y;

        if (view.children.length > 0) {
            for (let i = view.children.length - 1; i >= 0; i--) {
                const target = Application.findTarget(view.children[i], relativeX, relativeY);
                if (target.view !== undefined) {
                    return target;
                }
            }
        }

        return { view, x: relativeX, y: relativeY };
    }
}
