import { Point, Rect } from '.';
import { Screen } from '../screen';

export class View {
    protected parent?: View;
    private children: View[] = [];

    public background = 7;

    constructor(private screen: Screen, private bounds: Rect) {
    }

    public addChild(view: View) {
        this.children.push(view);
        view.parent = this;
    }

    public redraw() {
        this.screen.background = this.background;
        this.screen.foreground = 15;
        for (let y = 0; y < this.bounds.height; y++) {
            for (let x = 0; x < this.bounds.width; x++) {
                this.moveTo(x, y);
                this.setCharacter(176);
            }
        }

        this.moveTo(0, 0);

        for (const child of this.children) {
            child.redraw();
        }
    }

    protected clear() {
        for (let y = 0; y < this.bounds.height; y++) {
            for (let x = 0; x < this.bounds.width; x++) {
                this.moveTo(x, y);
                this.screen.setCharacter(' ');
            }
        }

        this.moveTo(0, 0);
    }

    protected moveTo(x: number, y: number) {
        const [ax, ay] = this.viewToScreen(x, y);
        this.screen.moveTo(ax, ay);
    }

    protected print(str: string) {
        this.screen.print(str);
    }

    protected setCharacter(char: string | number) {
        this.screen.setCharacter(char);
    }

    protected viewToScreen(x: number, y: number): Point {
        if (this.parent === undefined) {
            return [this.bounds.x + x, this.bounds.y + y];
        }

        const [px, py] = this.parent.viewToScreen(this.bounds.x, this.bounds.y);
        return [px + x,  py + y];
    }
}
