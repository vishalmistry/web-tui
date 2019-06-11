import { ScreenContext } from '..';
import { EventEmitter, Graph, Rect } from '../../common';
import { Dimension, Position } from '../layout';

type LayoutMode = 'absolute' | 'computed';

export class View {
    public readonly invalidated = new EventEmitter<Rect>();

    private _parent?: View;
    private _children: View[] = [];
    private _canFocus = false;
    private _hasFocus = false;
    private _focusedChild?: View = undefined;
    private _bounds: Rect;

    // Layout
    private _layoutMode: LayoutMode;
    private _frame: Rect;
    private _x: Position | undefined;
    private _y: Position | undefined;
    private _width: Dimension | undefined;
    private _height: Dimension | undefined;

    constructor(frame?: Rect) {
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

    public get parent(): View | undefined {
        return this._parent;
    }

    public get children(): ReadonlyArray<View> {
        return this._children;
    }

    public get focusedView(): View | undefined {
        return this.hasFocus ? this : this._focusedChild;
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

    public get x(): Position | undefined {
        return this._x;
    }

    public set x(value: Position | undefined) {
        if (Position.equal(this._x, value)) {
            return;
        }

        this._x = value;
        this.invalidateLayout();
    }

    public get y(): Position | undefined {
        return this._y;
    }

    public set y(value: Position | undefined) {
        if (Position.equal(this._y, value)) {
            return;
        }

        this._y = value;
        this.invalidateLayout();
    }

    public get width(): Dimension | undefined {
        return this._width;
    }

    public set width(value: Dimension | undefined) {
        if (Dimension.equal(this._width, value)) {
            return;
        }

        this._width = value;
        this.invalidateLayout();
    }

    public get height(): Dimension | undefined {
        return this._height;
    }

    public set height(value: Dimension | undefined) {
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

        if (value) {
            this.clearCurrentFocus();
        }

        this._hasFocus = value;
        if (this.parent !== undefined) {
            this.parent.setFocusedChild(value ? this : undefined);
        }

        this.invalidate();
    }

    public addChild(view: View) {
        this._children.push(view);
        view._parent = this;

        if (view.hasFocus) {
            this.clearCurrentFocus();
            this.setFocusedChild(view);
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
            region = new Rect(0, 0, this.frame.width, this.frame.height);
        }

        if (this.parent === undefined) {
            if (this.invalidated.hasSubscribers) {
                const redrawRegion = region.intersection(this.frame);
                if (redrawRegion !== undefined) {
                    this.invalidated.emit(redrawRegion);
                }
            }
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

        if (this.x !== undefined && this.x.needsSize &&
            this.width !== undefined && this.width.needsPosition) {
            x = this.x.absoluteValue(hostRect.width, hostRect.width);
            width = this.width.absoluteValue(hostRect.width, 0);
        } else if (this.x !== undefined && this.x.needsSize) {
            width = this.width === undefined ? hostRect.width : this.width.absoluteValue(hostRect.width);
            x = this.x.absoluteValue(hostRect.width, width);
        } else {
            x = this.x === undefined ? 0 : this.x.absoluteValue(hostRect.width);
            width = this.width === undefined ? hostRect.width : this.width.absoluteValue(hostRect.width, x);
        }

        if (this.y !== undefined && this.y.needsSize &&
            this.height !== undefined && this.height.needsPosition) {
            y = this.y.absoluteValue(hostRect.height, hostRect.height);
            height = this.height.absoluteValue(hostRect.height, 0);
        } else if (this.y !== undefined && this.y.needsSize) {
            height = this.height === undefined ? hostRect.height : this.height.absoluteValue(hostRect.height);
            y = this.y.absoluteValue(hostRect.height, height);
        } else {
            y = this.y === undefined ? 0 : this.y.absoluteValue(hostRect.height);
            height = this.height === undefined ? hostRect.height : this.height.absoluteValue(hostRect.height, y);
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

            if (view.x !== undefined) {
                for (const v of view.x.dependencies) {
                    g.addEdge(v, view);
                }
            }
            if (view.y !== undefined) {
                for (const v of view.y.dependencies) {
                    g.addEdge(v, view);
                }
            }
            if (view.width !== undefined) {
                for (const v of view.width.dependencies) {
                    g.addEdge(v, view);
                }
            }
            if (view.height !== undefined) {
                for (const v of view.height.dependencies) {
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

    private clearCurrentFocus() {
        let v: View = this;
        while (v.parent !== undefined && v._focusedChild === undefined) {
            v = v.parent;
        }

        const focused = v._focusedChild || v;
        if (focused !== undefined) {
            focused.hasFocus = false;
        }
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
            if (child.canFocus) {
                child.hasFocus = true;
                return true;
            }

            if (child.focusNext()) {
                return true;
            }
        }

        if (this.parent === undefined) {
            return false;
        }

        return this.parent.focusNext(this);
    }

    public focusPrevious(fromChild?: View): boolean {
        let childIdx = this.children.length;
        if (fromChild !== undefined) {
            childIdx = this.children.indexOf(fromChild);
            if (childIdx < 0) {
                throw new Error('Traverse error');
            }
        }

        for (let i = (childIdx - 1); i >= 0; i--) {
            const child = this.children[i];
            if (child.focusPrevious()) {
                return true;
            }

            if (this.canFocus) {
                this.hasFocus = true;
                return true;
            }
        }

        if (this.parent === undefined) {
            return false;
        }

        return this.parent.focusPrevious(this);
    }
}
