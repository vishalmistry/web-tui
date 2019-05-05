import { Rect } from '.';
import { Screen } from '../screen';

export class View {
    private static index = 0;
    protected _parent?: View;
    private _children: View[] = [];

    public background = 7;
    public index = View.index++;

    constructor(private _screen: Screen, private _bounds: Rect) {
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
    }

    public draw(region?: Rect) {
        if (region === undefined) {
            region = new Rect(0, 0, this.bounds.width, this.bounds.height);
        }

        console.log(`DRAW ${this.index} [${region.left}, ${region.top}, ${region.right}, ${region.bottom}]`);

        this._screen.background = this.background;
        this._screen.foreground = 15;
        for (let y = region.top; y <= region.bottom; y++) {
            for (let x = region.left; x <= region.right; x++) {
                this.moveTo(x, y);
                this.setCharacter(' ');
            }
        }
        if (region.contains(0, 0)) {
            this.moveTo(0, 0);
            this.setCharacter(`${this.index}`);
        }

        for (const child of this.children) {
            const intersection = region.intersection(child.bounds);
            if (intersection !== undefined) {
                child.draw(new Rect(
                    intersection.x - child.bounds.x,
                    intersection.y - child.bounds.y,
                    intersection.width,
                    intersection.height));
            }
        }
    }

    public invalidate(region?: Rect) {
        if (region === undefined) {
            region = new Rect(0, 0, this.bounds.width, this.bounds.height);
        }

        if (this.parent === undefined) {
            this.draw(region);
            return;
        }

        const parentRegion = new Rect(
            region.x + this.bounds.x,
            region.y + this.bounds.y,
            region.width,
            region.height);
        this.parent.invalidate(parentRegion);
    }

    public click() {
        this.background = (this.background + 1) % 16;
        this.invalidate();
    }

    protected moveTo(x: number, y: number) {
        this._screen.moveTo(this.viewToScreen(x, y));
    }

    protected print(str: string) {
        this._screen.print(str);
    }

    protected setCharacter(char: string | number) {
        this._screen.setCharacter(char);
    }

    protected viewToScreen(x: number, y: number): [number, number] {
        if (this._parent === undefined) {
            return [this._bounds.x + x, this._bounds.y + y];
        }

        const [px, py] = this._parent.viewToScreen(this._bounds.x, this._bounds.y);
        return [px + x,  py + y];
    }
}
