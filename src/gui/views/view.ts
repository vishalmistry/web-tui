import { ScreenContext } from '..';
import { EventEmitter, Rect } from '../../common';
import { Dimension, Position } from '../layout';

export class View {
    public readonly invalidated = new EventEmitter<Rect>();

    private _parent?: View;
    private _children: View[] = [];
    private _hasFocus = false;
    private _focusedChild?: View = undefined;
    private _bounds: Rect;

    // Relative Layout
    private _x: Position | undefined;
    private _y: Position | undefined;
    private _width: Dimension | undefined;
    private _height: Dimension | undefined;

    constructor(private _frame: Rect) {
        this._bounds = new Rect(0, 0, _frame.width, _frame.height);
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
        this.invalidate();
    }

    public get x(): Position | undefined {
        return this._x;
    }

    public set x(value: Position | undefined) {
        this._x = value;
        this.invalidateLayout();
    }

    public get y(): Position | undefined {
        return this._y;
    }

    public set y(value: Position | undefined) {
        this._y = value;
        this.invalidateLayout();
    }

    public get width(): Dimension | undefined {
        return this._width;
    }

    public set width(value: Dimension | undefined) {
        this._width = value;
        this.invalidateLayout();
    }

    public get height(): Dimension | undefined {
        return this._height;
    }

    public set height(value: Dimension | undefined) {
        this.height = value;
        this.invalidateLayout();
    }

    public get bounds(): Rect {
        return this._bounds;
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
        this.invalidate(view.frame);
    }

    public draw(ctx: ScreenContext, region?: Rect) {
        if (region === undefined) {
            region = this.bounds;
        }

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
    }

    protected calculateFrame(hostRect: Rect) {
        const x = this.x === undefined ? 0 : this.x.absoluteValue(hostRect.width);
        const width = this.width === undefined ? hostRect.width : this.width.absoluteValue(hostRect.width - x);
        const y = this.y === undefined ? 0 : this.y.absoluteValue(hostRect.height);
        const height = this.height === undefined ? hostRect.height : this.height.absoluteValue(hostRect.height - y);

        this.frame = new Rect(x, y, width, height);
    }

    protected updateLayout() {
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
}
