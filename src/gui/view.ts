import { Rect } from '.';
import { Screen } from '../screen';

export class View {
    private _parent?: View;
    private _children: View[] = [];

    public redraw?: (region: Rect) => void;

    constructor(private _bounds: Rect) {
    }

    public get parent(): View | undefined {
        return this._parent;
    }

    public get children(): ReadonlyArray<View> {
        return this._children;
    }

    public get bounds(): Rect {
        return this._bounds;
    }

    public addChild(view: View) {
        this._children.push(view);
        view._parent = this;

        this.invalidate(view.bounds);
    }

    public remove(view: View) {
        const index = this._children.indexOf(view);
        if (index < 0) {
            return;
        }

        this._children.splice(index, 1);
        view._parent = undefined;

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
        if (this._parent === undefined) {
            return [this._bounds.x + x, this._bounds.y + y];
        }

        const [px, py] = this._parent.getAbsLocation(this._bounds.x, this._bounds.y);
        return [px + x,  py + y];
    }
}
