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
    RegionInvalidatedEvent,
    ScreenContext,
    TUIKeyboardEvent,
    TUIMouseEvent,
    View,
} from '.';
import { Rect } from '../common';
import { Screen, ScreenKeyboardEvent, ScreenMouseEvent } from '../screen';
import { FillView } from './internal/fill-view';
import { ModalView } from './views/modal-view';

export class Application {
    private static readonly REDRAW_FREQ = 60;

    private readonly _viewStack: View[] = [ new FillView() ];
    private readonly _focusStack = new Array<View | undefined>();
    private _invalidatedRegion?: Rect;
    private _redrawScheduled = false;
    private _hoverView?: View;
    private _mouseDownView?: View;
    private _isRunning = false;

    constructor(private screen: Screen) {
    }

    private get mainView() {
        return this._viewStack[this._viewStack.length - 1];
    }

    public start() {
        for (const view of this._viewStack) {
            if (view.layoutMode === 'computed') {
                view.recalculateFrame(new Rect(0, 0, this.screen.columns, this.screen.rows));
            }
            view.invalidated.subscribe(this.scheduleRedraw);
        }
        this.scheduleRedraw();

        this.screen.resized.subscribe(this.onResize);
        this.screen.keyDown.subscribe(this.onKeyDown);
        this.screen.keyUp.subscribe(this.onKeyUp);
        this.screen.keyPress.subscribe(this.onKeyPress);
        this.screen.mouseMove.subscribe(this.onMouseMove);
        this.screen.mouseDown.subscribe(this.onMouseDown);
        this.screen.mouseUp.subscribe(this.onMouseUp);
        this.screen.doubleClick.subscribe(this.onDoubleClick);

        this._isRunning = true;
    }

    public stop() {
        for (const view of this._viewStack) {
            view.invalidated.unsubscribe(this.scheduleRedraw);
        }

        this.screen.resized.unsubscribe(this.onResize);
        this.screen.keyDown.unsubscribe(this.onKeyDown);
        this.screen.keyUp.unsubscribe(this.onKeyUp);
        this.screen.keyPress.unsubscribe(this.onKeyPress);
        this.screen.mouseMove.unsubscribe(this.onMouseMove);
        this.screen.mouseDown.unsubscribe(this.onMouseDown);
        this.screen.mouseUp.unsubscribe(this.onMouseUp);
        this.screen.doubleClick.unsubscribe(this.onDoubleClick);

        this._isRunning = false;
    }

    public showModal(view: View) {
        if (view instanceof ModalView) {
            view.setApplication(this);
        }

        const focusedView = this.mainView.focusedView;
        this._focusStack.push(focusedView);
        if (focusedView !== undefined) {
            focusedView.hasFocus = false;
        }

        this._viewStack.push(view);
        if (this._isRunning) {
            if (view.layoutMode === 'computed') {
                view.recalculateFrame(new Rect(0, 0, this.screen.columns, this.screen.rows));
            }
            view.invalidated.subscribe(this.scheduleRedraw);
            this.scheduleRedraw({ source: view, region: view.bounds });
        }
    }

    public dismissModal() {
        if (this._viewStack.length === 1) {
            return;
        }

        const view = this._viewStack.pop() as View;
        if (view instanceof ModalView) {
            view.setApplication(undefined);
        }

        const lastFocusedView = this._focusStack.pop();
        if (lastFocusedView !== undefined) {
            lastFocusedView.hasFocus = true;
        }

        if (this._isRunning) {
            view.invalidated.unsubscribe(this.scheduleRedraw);
            this.scheduleRedraw({ source: view, region: view.bounds });
        }
    }

    private scheduleRedraw = (event?: RegionInvalidatedEvent) => {
        const region = event === undefined
            ? new Rect(0, 0, this.screen.columns, this.screen.rows)
            : new Rect(
                event.source.frame.x + event.region.x,
                event.source.frame.y + event.region.y,
                event.region.width,
                event.region.height);

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

        for (const view of this._viewStack) {
            const intersection = this._invalidatedRegion.intersection(view.frame);
            if (intersection !== undefined) {
                const viewRegion = new Rect(
                    intersection.x - view.frame.x,
                    intersection.y - view.frame.y,
                    intersection.width,
                    intersection.height);

                const viewCtx = new ScreenContext(this.screen, view);
                viewCtx.setClip(viewRegion);
                view.draw(viewCtx, viewRegion);
            }
        }

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
        for (const view of this._viewStack) {
            if (view.layoutMode === 'computed') {
                view.recalculateFrame(new Rect(0, 0, this.screen.columns, this.screen.rows));
            }
        }
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
            if (this._hoverView !== undefined &&
                this._hoverView.isEnabled &&
                hasMouseLeaveHandler(this._hoverView)) {
                this._hoverView.onMouseLeave();
            }
            if (target.view !== undefined &&
                target.view.isEnabled &&
                hasMouseEnterHandler(target.view)) {
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
