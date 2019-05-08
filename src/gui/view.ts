import { Rect } from '.';
import { Screen } from '../screen';

export class View {
    private _parent?: View;
    private _children: View[] = [];
    private _hasFocus = false;
    private _focusedChild?: View = undefined;

    public redraw?: (region: Rect) => void;

    constructor(private _bounds: Rect) {
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
        this.invalidate();

        if (this.parent !== undefined) {
            this.parent.setFocusedChild(value ? this : undefined);
        }
    }

    public addChild(view: View) {
        this._children.push(view);
        view._parent = this;

        if (view.hasFocus) {
            this.clearCurrentFocus();
            this.setFocusedChild(view);
        }

        this.invalidate(view.bounds);
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
        this.invalidate(view.bounds);
    }

    public draw(screen: Screen, region?: Rect) {
        if (region === undefined) {
            region = new Rect(0, 0, this.bounds.width, this.bounds.height);
        }

        for (const child of this.children) {
            const intersection = region.intersection(child.bounds);
            if (intersection !== undefined) {
                child.draw(screen, new Rect(
                    intersection.x - child.bounds.x,
                    intersection.y - child.bounds.y,
                    intersection.width,
                    intersection.height));
            }
        }
    }

    protected invalidate(region?: Rect) {
        if (region === undefined) {
            region = new Rect(0, 0, this.bounds.width, this.bounds.height);
        }

        if (this.parent === undefined) {
            if (this.redraw !== undefined) {
                this.redraw(region);
            }
            return;
        }

        const parentRegion = new Rect(
            region.x + this.bounds.x,
            region.y + this.bounds.y,
            region.width,
            region.height);
        this.parent.invalidate(parentRegion);
    }

    protected getAbsLocation(x: number, y: number): [number, number] {
        if (this.parent === undefined) {
            return [this._bounds.x + x, this._bounds.y + y];
        }

        const [px, py] = this.parent.getAbsLocation(this._bounds.x, this._bounds.y);
        return [px + x,  py + y];
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
