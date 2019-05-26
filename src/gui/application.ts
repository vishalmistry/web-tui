import {
    GUIKeyboardEvent,
    hasClickHandler,
    hasDoubleClickHandler,
    hasKeyDownHandler,
    hasKeyPressHandler,
    hasKeyUpHandler,
    hasMouseDownHandler,
    hasMouseEnterHandler,
    hasMouseLeaveHandler,
    hasMouseMoveHandler,
    hasMouseUpHandler,
    ScreenContext,
    View,
} from '.';
import { Rect } from '../common';
import { Screen, ScreenKeyboardEvent, ScreenMouseEvent } from '../screen';

export class Application {
    private _hoverView?: View;
    private _mouseDownView?: View;

    constructor(private screen: Screen, private mainView: View) {
    }

    public start() {
        this.redrawInvalidatedRegion();
        this.mainView.invalidated.subscribe(this.redrawInvalidatedRegion);

        this.screen.resized.subscribe(this.onResize);
        this.screen.keyDown.subscribe(this.onKeyDown);
        this.screen.keyUp.subscribe(this.onKeyUp);
        this.screen.keyPress.subscribe(this.onKeyPress);
        this.screen.mouseMove.subscribe(this.onMouseMove);
        this.screen.mouseDown.subscribe(this.onMouseDown);
        this.screen.mouseUp.subscribe(this.onMouseUp);
        this.screen.doubleClick.subscribe(this.onDoubleClick);
    }

    public stop() {
        this.mainView.invalidated.unsubscribe(this.redrawInvalidatedRegion);

        this.screen.resized.unsubscribe(this.onResize);
        this.screen.keyDown.unsubscribe(this.onKeyDown);
        this.screen.keyUp.unsubscribe(this.onKeyUp);
        this.screen.keyPress.unsubscribe(this.onKeyPress);
        this.screen.mouseMove.unsubscribe(this.onMouseMove);
        this.screen.mouseDown.unsubscribe(this.onMouseDown);
        this.screen.mouseUp.unsubscribe(this.onMouseUp);
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

    private onResize = () => this.redrawInvalidatedRegion();

    private onKeyDown = (event: ScreenKeyboardEvent) =>
        this.fireKeyboardEvent(event, hasKeyDownHandler, (v, args) => v.onKeyDown(args))

    private onKeyUp = (event: ScreenKeyboardEvent) =>
        this.fireKeyboardEvent(event, hasKeyUpHandler, (v, args) => v.onKeyUp(args))

    private onKeyPress = (event: ScreenKeyboardEvent) =>
        this.fireKeyboardEvent(event, hasKeyPressHandler, (v, args) => v.onKeyPress(args))

    private onMouseMove = (event: ScreenMouseEvent) => {
        const target = Application.findTarget(this.mainView, event.position.x, event.position.y);

        if (target.view !== this._hoverView) {
            if (this._hoverView !== undefined && hasMouseLeaveHandler(this._hoverView)) {
                this._hoverView.onMouseLeave();
            }
            if (target.view !== undefined && hasMouseEnterHandler(target.view)) {
                target.view.onMouseEnter();
            }

            this._hoverView = target.view;
        }

        if (hasMouseMoveHandler(target.view)) {
            target.view.onMouseMove({...event, x: target.x, y: target.y });
        }
    }

    private onMouseDown = (event: ScreenMouseEvent) => {
        const target = Application.findTarget(this.mainView, event.position.x, event.position.y);
        this._mouseDownView = target.view;

        if (hasMouseDownHandler(target.view)) {
            target.view.onMouseDown({...event, x: target.x, y: target.y});
        }
    }

    private onMouseUp = (event: ScreenMouseEvent) => {
        const target = Application.findTarget(this.mainView, event.position.x, event.position.y);

        if (hasMouseUpHandler(target.view)) {
            target.view.onMouseUp({...event, x: target.x, y: target.y});
        }

        if (target.view === this._mouseDownView && hasClickHandler(target.view)) {
            target.view.onClick({...event, x: target.x, y: target.y});
        }
    }

    private onDoubleClick = (event: ScreenMouseEvent) => {
        const target = Application.findTarget(this.mainView, event.position.x, event.position.y);

        if (hasDoubleClickHandler(target.view)) {
            target.view.onDoubleClick({...event, x: target.x, y: target.y});
        }
    }

    private fireKeyboardEvent<T>(event: ScreenKeyboardEvent,
                                 guard: (view: View | undefined) => view is View & T,
                                 handler: (view: View & T, args: GUIKeyboardEvent) => void): void {
        const target = this.mainView.focusedView;
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
