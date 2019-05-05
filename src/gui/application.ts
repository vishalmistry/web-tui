import {
    GUIMouseEvent,
    hasClickHandler,
    hasDoubleClickHandler,
    hasMouseDownHandler,
    hasMouseMoveHandler,
    hasMouseUpHandler,
    View,
} from '.';
import { Screen, ScreenMouseEvent } from '../screen';

export class Application {

    constructor(private screen: Screen, private mainView: View) {
    }

    public start() {
        this.mainView.draw();

        this.screen.addEventHandler('mousemove', this.onMouseMove);
        this.screen.addEventHandler('mousedown', this.onMouseDown);
        this.screen.addEventHandler('mouseup', this.onMouseUp);
        this.screen.addEventHandler('click', this.onMouseClick);
        this.screen.addEventHandler('dblclick', this.onMouseDoubleClick);
    }

    public stop() {
        this.screen.removeEventHandler('mousemove', this.onMouseMove);
        this.screen.removeEventHandler('mousedown', this.onMouseDown);
        this.screen.removeEventHandler('mouseup', this.onMouseUp);
        this.screen.removeEventHandler('click', this.onMouseClick);
        this.screen.removeEventHandler('dblclick', this.onMouseDoubleClick);
    }

    onMouseMove = (event: ScreenMouseEvent) => this.fireMouseEvent(event, hasMouseMoveHandler, (v, args) => v.mouseMove(args));
    onMouseDown = (event: ScreenMouseEvent) => this.fireMouseEvent(event, hasMouseDownHandler, (v, args) => v.mouseDown(args));
    onMouseUp = (event: ScreenMouseEvent) => this.fireMouseEvent(event, hasMouseUpHandler, (v, args) => v.mouseUp(args));
    onMouseClick = (event: ScreenMouseEvent) => this.fireMouseEvent(event, hasClickHandler, (v, args) => v.click(args));
    onMouseDoubleClick = (event: ScreenMouseEvent) => this.fireMouseEvent(event, hasDoubleClickHandler, (v, args) => v.doubleClick(args));

    private fireMouseEvent<T>(event: ScreenMouseEvent,
                              guard: (view: View) => view is View & T,
                              handler: (view: View & T, args: GUIMouseEvent) => void): void {
        const target = Application.findTarget(this.mainView, event.position.x, event.position.y);
        if (target.view === undefined) {
            return;
        }

        if (guard(target.view)) {
            handler(target.view, {...event, x: target.x, y: target.y });
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
