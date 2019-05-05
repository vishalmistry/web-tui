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

    public redraw() {
        this._screen.background = this.background;
        this._screen.foreground = 15;
        for (let y = 0; y < this._bounds.height; y++) {
            for (let x = 0; x < this._bounds.width; x++) {
                this.moveTo(x, y);
                this.setCharacter(176);
            }
        }

        this.moveTo(0, 0);
        this.setCharacter(`${this.index}`);

        for (const child of this.children) {
            child.redraw();
        }
    }

    protected clear() {
        for (let y = 0; y < this._bounds.height; y++) {
            for (let x = 0; x < this._bounds.width; x++) {
                this.moveTo(x, y);
                this._screen.setCharacter(' ');
            }
        }

        this.moveTo(0, 0);
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
