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
    ScreenContext,
    View,
} from '.';
import { Rect } from '../common';
import { Screen, ScreenKeyboardEvent, ScreenMouseEvent } from '../screen';

export class Application {

    constructor(private screen: Screen, private mainView: View) {
    }

    public start() {
        this.redrawInvalidatedRegion();
        this.mainView.invalidated.subscribe(this.redrawInvalidatedRegion);

        this.screen.keyDown.subscribe(this.onKeyDown);
        this.screen.keyUp.subscribe(this.onKeyUp);
        this.screen.keyPress.subscribe(this.onKeyPress);
        this.screen.mouseMove.subscribe(this.onMouseMove);
        this.screen.mouseDown.subscribe(this.onMouseDown);
        this.screen.mouseUp.subscribe(this.onMouseUp);
        this.screen.click.subscribe(this.onClick);
        this.screen.doubleClick.subscribe(this.onDoubleClick);
    }

    public stop() {
        this.mainView.invalidated.unsubscribe(this.redrawInvalidatedRegion);

        this.screen.keyDown.unsubscribe(this.onKeyDown);
        this.screen.keyUp.unsubscribe(this.onKeyUp);
        this.screen.keyPress.unsubscribe(this.onKeyPress);
        this.screen.mouseMove.unsubscribe(this.onMouseMove);
        this.screen.mouseDown.unsubscribe(this.onMouseDown);
        this.screen.mouseUp.unsubscribe(this.onMouseUp);
        this.screen.click.unsubscribe(this.onClick);
        this.screen.doubleClick.unsubscribe(this.onDoubleClick);
    }

    private redrawInvalidatedRegion = (region?: Rect) => {
        const refreshContext = new ScreenContext(this.screen, this.mainView);
        refreshContext.setClip(region);
        this.mainView.draw(refreshContext, region);

        if (this.mainView.focusedView !== undefined) {
            this.mainView.focusedView.positionCursor(
                new ScreenContext(this.screen, this.mainView.focusedView));
        }
    }

    private onKeyDown = (event: ScreenKeyboardEvent) =>
        this.fireKeyboardEvent(event, hasKeyDownHandler, (v, args) => v.onKeyDown(args))

    private onKeyUp = (event: ScreenKeyboardEvent) =>
        this.fireKeyboardEvent(event, hasKeyUpHandler, (v, args) => v.onKeyUp(args))

    private onKeyPress = (event: ScreenKeyboardEvent) =>
        this.fireKeyboardEvent(event, hasKeyPressHandler, (v, args) => v.onKeyPress(args))

    private onMouseMove = (event: ScreenMouseEvent) =>
        this.fireMouseEvent(event, hasMouseMoveHandler, (v, args) => v.onMouseMove(args))

    private onMouseDown = (event: ScreenMouseEvent) =>
        this.fireMouseEvent(event, hasMouseDownHandler, (v, args) => v.onMouseDown(args))

    private onMouseUp = (event: ScreenMouseEvent) =>
        this.fireMouseEvent(event, hasMouseUpHandler, (v, args) => v.onMouseUp(args))

    private onClick = (event: ScreenMouseEvent) =>
        this.fireMouseEvent(event, hasClickHandler, (v, args) => v.onClick(args))

    private onDoubleClick = (event: ScreenMouseEvent) =>
        this.fireMouseEvent(event, hasDoubleClickHandler, (v, args) => v.onDoubleClick(args))

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
