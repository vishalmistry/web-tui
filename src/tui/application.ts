import {
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
    TUIKeyboardEvent,
    TUIMouseEvent,
    View,
} from '.';
import { Rect } from '../common';
import { Screen, ScreenKeyboardEvent, ScreenMouseEvent } from '../screen';
import { RootView } from './internal/root-view';

export class Application {
    private static readonly REDRAW_FREQ = 60;

    public readonly mainView: View = new RootView(this);

    private _invalidatedRegion: Rect | undefined;
    private _redrawScheduled = false;
    private _hoverView?: View;
    private _mouseDownView?: View;

    constructor(private screen: Screen) {
    }

    public start() {
        if (this.mainView.layoutMode === 'computed') {
            this.mainView.recalculateFrame(new Rect(0, 0, this.screen.columns, this.screen.rows));
        }
        this.scheduleRedraw();
        this.mainView.invalidated.subscribe(this.scheduleRedraw);

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
        this.mainView.invalidated.unsubscribe(this.scheduleRedraw);

        this.screen.resized.unsubscribe(this.onResize);
        this.screen.keyDown.unsubscribe(this.onKeyDown);
        this.screen.keyUp.unsubscribe(this.onKeyUp);
        this.screen.keyPress.unsubscribe(this.onKeyPress);
        this.screen.mouseMove.unsubscribe(this.onMouseMove);
        this.screen.mouseDown.unsubscribe(this.onMouseDown);
        this.screen.mouseUp.unsubscribe(this.onMouseUp);
        this.screen.doubleClick.unsubscribe(this.onDoubleClick);
    }

    private scheduleRedraw = (region?: Rect) => {
        region = region === undefined ? this.mainView.bounds : region;
        if (this._invalidatedRegion === undefined) {
            this._invalidatedRegion = region;
        } else {
            this._invalidatedRegion = this._invalidatedRegion.union(region);
        }

        if (!this._redrawScheduled) {
            this._redrawScheduled = true;
            setTimeout(this.redrawInvalidatedRegion, Math.floor(1000 / Application.REDRAW_FREQ));
        }
    }

    private redrawInvalidatedRegion = () => {
        if (this._invalidatedRegion === undefined) {
            return;
        }

        const refreshContext = new ScreenContext(this.screen, this.mainView);
        refreshContext.setClip(this._invalidatedRegion);
        this.mainView.draw(refreshContext, this._invalidatedRegion);

        if (this.mainView.focusedView !== undefined) {
            this.mainView.focusedView.positionCursor(
                new ScreenContext(this.screen, this.mainView.focusedView));
        } else {
            this.screen.moveTo(0, 0);
        }

        this._invalidatedRegion = undefined;
        this._redrawScheduled = false;
    }

    private onResize = () => {
        if (this.mainView.layoutMode === 'computed') {
            this.mainView.recalculateFrame(new Rect(0, 0, this.screen.columns, this.screen.rows));
        }
        this.redrawInvalidatedRegion();
    }

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

        this.fireMouseEvent(event, target, hasMouseMoveHandler, (v, arg) => v.onMouseMove(arg));
    }

    private onMouseDown = (event: ScreenMouseEvent) => {
        const target = Application.findTarget(this.mainView, event.position.x, event.position.y);
        this._mouseDownView = target.view;

        this.fireMouseEvent(event, target, hasMouseDownHandler, (v, arg) => v.onMouseDown(arg));
    }

    private onMouseUp = (event: ScreenMouseEvent) => {
        const target = Application.findTarget(this.mainView, event.position.x, event.position.y);

        this.fireMouseEvent(event, target, hasMouseUpHandler, (v, arg) => v.onMouseUp(arg));

        if (target.view === this._mouseDownView) {
            this.fireMouseEvent(event, target, hasClickHandler, (v, arg) => v.onClick(arg));
        }
    }

    private onDoubleClick = (event: ScreenMouseEvent) => {
        const target = Application.findTarget(this.mainView, event.position.x, event.position.y);

        this.fireMouseEvent(event, target, hasDoubleClickHandler, (v, arg) => v.onDoubleClick(arg));
    }

    private fireKeyboardEvent<T>(event: ScreenKeyboardEvent,
                                 guard: (view: View | undefined) => view is View & T,
                                 handler: (view: View & T, args: TUIKeyboardEvent) => void): void {
        let view = this.mainView.focusedView;
        if (view === undefined) {
            view = this.mainView;
        }

        while (view !== undefined) {
            if (view.isEnabled && guard(view)) {
                const arg = {...event, source: this.mainView.focusedView as View, handled: false };
                handler(view, arg);
                if (arg.handled) {
                    break;
                }
            }
            view = view.parent;
        }
    }

    private fireMouseEvent<T>(event: ScreenMouseEvent,
                              target: { view: View | undefined, x: number, y: number },
                              guard: (view: View | undefined) => view is View & T,
                              handler: (view: View & T, args: TUIMouseEvent) => void): void {
        let view = target.view;
        let viewX = target.x;
        let viewY = target.y;
        while (view !== undefined) {
            if (view.isEnabled && guard(view)) {
                const arg = {
                    ...event,
                    source: target.view as View,
                    x: viewX,
                    y: viewY,
                    handled: false,
                };
                handler(view, arg);
                if (arg.handled) {
                    break;
                }
            }
            viewX = viewX + view.frame.x;
            viewY = viewY + view.frame.y;
            view = view.parent;
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
