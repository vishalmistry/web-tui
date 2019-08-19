import { ScreenContext } from '..';
import { EventEmitter, Graph, Rect } from '../../common';
import { Application } from '../application';
import { ViewEvent } from '../interfaces';
import { Dimension, Position } from '../layout';
import { Theme } from '../theme';

export interface RegionInvalidatedEvent extends ViewEvent {
    region: Rect;
}

type LayoutMode = 'absolute' | 'computed';

export class View {
    public readonly invalidated = new EventEmitter<RegionInvalidatedEvent>();

    private _parent?: View;
    private _children: View[] = [];
    private _canFocus = false;
    private _hasFocus = false;
    private _focusedChild?: View = undefined;
    private _theme?: Theme;
    private _isEnabled?: boolean;
    private _bounds: Rect;

    // Layout
    private _layoutMode: LayoutMode;
    private _frame: Rect;
    private _x: Position | undefined;
    private _y: Position | undefined;
    private _width: Dimension | undefined;
    private _height: Dimension | undefined;

    public constructor(frame?: Rect) {
        if (frame === undefined) {
            this._layoutMode = 'computed';
            this._frame = Rect.EMPTY;
            this._bounds = Rect.EMPTY;
        } else {
            this._layoutMode = 'absolute';
            this._frame = frame;
            this._bounds = new Rect(0, 0, frame.width, frame.height);
        }
    }

    public get application(): Application {
        if (this.parent === undefined) {
            throw new Error('View is not part of an application');
        }
        return this.parent.application;
    }

    public get parent(): View | undefined {
        return this._parent;
    }

    public get children(): ReadonlyArray<View> {
        return this._children;
    }

    public get focusedView(): View | undefined {
        return this.hasFocus ? this : this._focusedChild;
    }

    public get theme(): Theme {
        if (this._theme !== undefined) {
            return this._theme;
        }

        if (this.parent === undefined) {
            throw new Error('No theme set!');
        }
        return this.parent.theme;
    }

    public set theme(value: Theme) {
        this._theme = value;
        this.invalidate();
    }

    public get layoutMode(): LayoutMode {
        return this._layoutMode;
    }

    public set layoutMode(value: LayoutMode) {
        if (this._layoutMode === value) {
            return;
        }

        this._layoutMode = value;
        this.invalidateLayout();
    }

    public get frame(): Rect {
        return this._frame;
    }

    public set frame(value: Rect) {
        if (value.equal(this._frame)) {
            return;
        }

        const previous = this._frame;
        this._frame = value;
        this._bounds = new Rect(0, 0, this._frame.width, this._frame.height);

        if (this.parent !== undefined) {
            this.parent.invalidate(previous);
        }

        this.invalidateLayout();
        if (!previous.sizeEqual(value)) {
            // Since this view's bounds changed, need to recalculate layout
            // of children
            this.layoutChildren();
        }
        this.invalidate();
    }

    public get x(): Position | number | string | undefined {
        return this._x;
    }

    public set x(value: Position | number | string | undefined) {
        value = value !== undefined ? Position.from(value) : undefined;
        if (Position.equal(this._x, value)) {
            return;
        }

        this._x = value;
        this.invalidateLayout();
    }

    public get y(): Position | number | string | undefined {
        return this._y;
    }

    public set y(value: Position | number | string | undefined) {
        value = value !== undefined ? Position.from(value) : undefined;
        if (Position.equal(this._y, value)) {
            return;
        }

        this._y = value;
        this.invalidateLayout();
    }

    public get width(): Dimension | number | string | undefined {
        return this._width;
    }

    public set width(value: Dimension | number | string | undefined) {
        value = value !== undefined ? Dimension.from(value) : undefined;
        if (Dimension.equal(this._width, value)) {
            return;
        }

        this._width = value;
        this.invalidateLayout();
    }

    public get height(): Dimension | number | string | undefined {
        return this._height;
    }

    public set height(value: Dimension | number | string | undefined) {
        value = value !== undefined ? Dimension.from(value) : undefined;
        if (Dimension.equal(this._height, value)) {
            return;
        }

        this._height = value;
        this.invalidateLayout();
    }

    public get bounds(): Rect {
        return this._bounds;
    }

    public get canFocus(): boolean {
        return this._canFocus;
    }

    public set canFocus(value: boolean) {
        this._canFocus = value;
    }

    public get hasFocus(): boolean {
        return this._hasFocus;
    }

    public set hasFocus(value: boolean) {
        if (this._hasFocus === value) {
            return;
        }

        let previousFocus: View | undefined;
        if (value) {
            previousFocus = this.clearCurrentFocus();
        }

        this._hasFocus = value;
        if (this.parent !== undefined) {
            this.parent.setFocusedChild(value ? this : undefined);
        }

        if (value) {
            this.onFocus(previousFocus);
        } else {
            this.onBlur();
        }
    }

    public get isEnabled(): boolean {
        if (this.parent !== undefined && !this.parent.isEnabled) {
            return false;
        }

        if (this._isEnabled !== undefined) {
            return this._isEnabled;
        }

        return true;
    }

    public set isEnabled(value: boolean) {
        if (this._isEnabled === value) {
            return;
        }

        this._isEnabled = value;
        this.invalidate();
    }

    public addChild(view: View) {
        this._children.push(view);
        view._parent = this;

        if (view.hasFocus) {
            const previousFocus = this.clearCurrentFocus();
            this.setFocusedChild(view);

            view.onFocus(previousFocus);
        }
        this.layoutChildren();
        this.invalidate(view.frame);
    }

    public removeChild(view: View) {
        const index = this._children.indexOf(view);
        if (index < 0) {
            return;
        }

        this._children.splice(index, 1);
        view._parent = undefined;

        if (view.hasFocus || view._focusedChild !== undefined) {
            this.setFocusedChild(undefined);
        }
        this.layoutChildren();
        this.invalidate(view.frame);
    }

    public draw(ctx: ScreenContext, region: Rect) {
        for (const child of this.children) {
            const intersection = region.intersection(child.frame);
            if (intersection !== undefined) {
                const childRedrawRegion = new Rect(
                    intersection.x - child.frame.x,
                    intersection.y - child.frame.y,
                    intersection.width,
                    intersection.height);

                const childCtx = ctx.createForSubregion(child.frame);
                childCtx.setClip(childRedrawRegion);

                child.draw(childCtx, childRedrawRegion);
            }
        }
    }

    public positionCursor(ctx: ScreenContext) {
        ctx.moveTo(0, 0);
    }

    protected invalidate(region?: Rect) {
        if (region === undefined) {
            region = this.bounds;
        } else {
            region = region.intersection(this.bounds);
            if (region === undefined) {
                return;
            }
        }

        if (this.parent === undefined) {
            this.invalidated.emit({ source: this, region });
            return;
        }

        const parentRegion = new Rect(
            region.x + this.frame.x,
            region.y + this.frame.y,
            region.width,
            region.height);
        this.parent.invalidate(parentRegion);
    }

    protected invalidateLayout() {
        if (this.parent !== undefined) {
            this.parent.layoutChildren();
        }
    }

    public recalculateFrame(hostRect: Rect) {
        if (this.layoutMode !== 'computed') {
            return;
        }

        let [x, y, width, height] = [0, 0, 0, 0];

        if (this._x !== undefined && this._x.needsSize &&
            this._width !== undefined && this._width.needsPosition) {
            x = this._x.absoluteValue(hostRect.width, hostRect.width);
            width = this._width.absoluteValue(hostRect.width, 0);
        } else if (this._x !== undefined && this._x.needsSize) {
            width = this._width === undefined ? hostRect.width : this._width.absoluteValue(hostRect.width);
            x = this._x.absoluteValue(hostRect.width, width);
        } else {
            x = this._x === undefined ? 0 : this._x.absoluteValue(hostRect.width);
            width = this._width === undefined ? hostRect.width : this._width.absoluteValue(hostRect.width, x);
        }

        if (this._y !== undefined && this._y.needsSize &&
            this._height !== undefined && this._height.needsPosition) {
            y = this._y.absoluteValue(hostRect.height, hostRect.height);
            height = this._height.absoluteValue(hostRect.height, 0);
        } else if (this._y !== undefined && this._y.needsSize) {
            height = this._height === undefined ? hostRect.height : this._height.absoluteValue(hostRect.height);
            y = this._y.absoluteValue(hostRect.height, height);
        } else {
            y = this._y === undefined ? 0 : this._y.absoluteValue(hostRect.height);
            height = this._height === undefined ? hostRect.height : this._height.absoluteValue(hostRect.height, y);
        }

        this.frame = new Rect(x, y, width, height);
    }

    private layoutChildren() {
        if (this.frame.isEmpty() || this.children.length === 0) {
            return;
        }

        const g = new Graph<View>();
        for (const view of this.children) {
            g.addNode(view);

            if (view._x !== undefined) {
                for (const v of view._x.dependencies) {
                    g.addEdge(v, view);
                }
            }
            if (view._y !== undefined) {
                for (const v of view._y.dependencies) {
                    g.addEdge(v, view);
                }
            }
            if (view._width !== undefined) {
                for (const v of view._width.dependencies) {
                    g.addEdge(v, view);
                }
            }
            if (view._height !== undefined) {
                for (const v of view._height.dependencies) {
                    g.addEdge(v, view);
                }
            }
        }

        const views = g.topologicalSort();
        for (const view of views) {
            if (this.children.indexOf(view) < 0) {
                throw new Error('View dependencies must be siblings');
            }

            if (view.layoutMode === 'computed') {
                view.recalculateFrame(this.bounds);
            }
        }
    }

    private setFocusedChild(value: View | undefined) {
        let v: View | undefined = this;
        while (v !== undefined) {
            v._focusedChild = value;
            v = v.parent;
        }
    }

    private clearCurrentFocus(): View | undefined {
        let v: View = this;
        while (v.parent !== undefined && v._focusedChild === undefined) {
            v = v.parent;
        }

        const focused = v._focusedChild || v;
        if (focused !== undefined) {
            focused.hasFocus = false;
            return focused;
        }
        return undefined;
    }

    public focusNext(fromChild?: View): boolean {
        let childIdx = -1;
        if (fromChild !== undefined) {
            childIdx = this.children.indexOf(fromChild);
            if (childIdx < 0) {
                throw new Error('Traverse error');
            }
        }

        for (let i = (childIdx + 1); i < this.children.length; i++) {
            const child = this.children[i];
            if (child.isEnabled && child.canFocus) {
                child.hasFocus = true;
                return true;
            }

            if (child.children.length > 0 && child.focusNext()) {
                return true;
            }
        }

        if (this.parent === undefined) {
            return false;
        }

        return this.parent.focusNext(this);
    }

    public focusPrevious(): boolean {
        let p = this.parent;
        let v: View = this;

        while (p !== undefined) {
            if (p.focusLast(v)) {
                return true;
            }

            v = p;
            p = p.parent;
        }

        return false;
    }

    public focusLast(fromChild?: View): boolean {
        let childIdx = this.children.length;
        if (fromChild !== undefined) {
            childIdx = this.children.indexOf(fromChild);
            if (childIdx < 0) {
                throw new Error('Traverse error');
            }
        }

        for (let i = (childIdx - 1); i >= 0; i--) {
            const child = this.children[i];
            if (child.focusLast()) {
                return true;
            }
        }

        if (this.isEnabled && this.canFocus) {
            this.hasFocus = true;
            return true;
        }

        return false;
    }

    protected onFocus(_previousFocus?: View) {
        this.invalidate();
    }

    protected onBlur() {
        this.invalidate();
    }
}
