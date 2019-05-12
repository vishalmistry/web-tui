import {
    GUIKeyboardEvent,
    GUIMouseEvent,
    hasClickHandler,
    hasDoubleClickHandler,
    hasKeyDownHandler,
    hasKeyPressHandler,
    hasKeyUpHandler,
    hasMouseDownHandler,
    hasMouseMoveHandler,
    hasMouseUpHandler,
    Rect,
    ScreenContext,
    View,
} from '.';
import { Screen, ScreenKeyboardEvent, ScreenMouseEvent } from '../screen';

export class Application {

    constructor(private screen: Screen, private mainView: View) {
    }

    public start() {
        this.refresh();
        this.mainView.redraw = this.refresh;

        this.screen.addEventHandler('keydown', this.onKeyDown);
        this.screen.addEventHandler('keyup', this.onKeyUp);
        this.screen.addEventHandler('keypress', this.onKeyPress);
        this.screen.addEventHandler('mousemove', this.onMouseMove);
        this.screen.addEventHandler('mousedown', this.onMouseDown);
        this.screen.addEventHandler('mouseup', this.onMouseUp);
        this.screen.addEventHandler('click', this.onMouseClick);
        this.screen.addEventHandler('dblclick', this.onMouseDoubleClick);
    }

    public stop() {
        this.screen.removeEventHandler('keydown', this.onKeyDown);
        this.screen.removeEventHandler('keyup', this.onKeyUp);
        this.screen.removeEventHandler('keypress', this.onKeyPress);
        this.screen.removeEventHandler('mousemove', this.onMouseMove);
        this.screen.removeEventHandler('mousedown', this.onMouseDown);
        this.screen.removeEventHandler('mouseup', this.onMouseUp);
        this.screen.removeEventHandler('click', this.onMouseClick);
        this.screen.removeEventHandler('dblclick', this.onMouseDoubleClick);
    }

    private refresh = (region?: Rect) => {
        const refreshContext = new ScreenContext(this.screen, this.mainView);
        refreshContext.setClip(region);
        this.mainView.draw(refreshContext, region);

        if (this.mainView.focusedView !== undefined) {
            this.mainView.focusedView.positionCursor(
                new ScreenContext(this.screen, this.mainView.focusedView));
        }
    }

    onKeyDown = (event: ScreenKeyboardEvent) => this.fireKeyboardEvent(event, hasKeyDownHandler, (v, args) => v.keyDown(args));
    onKeyUp = (event: ScreenKeyboardEvent) => this.fireKeyboardEvent(event, hasKeyUpHandler, (v, args) => v.keyUp(args));
    onKeyPress = (event: ScreenKeyboardEvent) => this.fireKeyboardEvent(event, hasKeyPressHandler, (v, args) => v.keyPress(args));
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

    private fireKeyboardEvent<T>(event: ScreenKeyboardEvent,
                                 guard: (view: View) => view is View & T,
                                 handler: (view: View & T, args: GUIKeyboardEvent) => void): void {
        const target = this.mainView.focusedView;
        if (target === undefined) {
            return;
        }

        if (guard(target)) {
            handler(target, event);
        }
    }

    private static findTarget(view: View, px: number, py: number): { view: View | undefined, x: number, y: number } {
        if (!view.frame.contains(px, py)) {
            return { view: undefined, x: 0, y: 0 };
        }

        const relativeX = px - view.frame.x;
        const relativeY = py - view.frame.y;

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
