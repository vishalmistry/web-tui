import { Rect, View } from '.';
import { Screen } from '../screen';

export class ScreenContext {
    private _bounds: Rect;
    private _clip!: Rect;
    private _cursorLocation: { x: number, y: number };

    constructor(private _screen: Screen, viewOrRegion: View | Rect) {
        if (viewOrRegion instanceof View) {
            this._bounds = ScreenContext.calculateViewBounds(viewOrRegion);
        } else {
            this._bounds = viewOrRegion;
        }

        // Put cursor initially off screen so nothing happens unless
        // moveTo() is called first. This stops the need to check location
        // elsewhere
        this._cursorLocation = {
            x: this._screen.columns,
            y: this._screen.rows,
        };
        this.setClip();
    }

    public get background(): number {
        return this._screen.background;
    }

    public set background(value: number) {
        this._screen.background = value;
    }

    public get foreground(): number {
        return this._screen.foreground;
    }

    public set foreground(value: number) {
        this._screen.foreground = value;
    }

    public get isCursorVisible() {
        return this._screen.isCursorVisible;
    }

    public set isCursorVisible(value: boolean) {
        this._screen.isCursorVisible = value;
    }

    public moveTo(position: [number, number]): void;
    public moveTo(x: number, y: number): void;
    moveTo(x: [number, number] | number, y?: number) {
        if (typeof x === 'object') {
            [x, y] = x;
        } else if (y === undefined) {
            throw new Error('Bad arguments');
        }

        if (x > this._bounds.right || y > this._bounds.bottom) {
            throw new Error('Position out of bounds');
        }

        this._cursorLocation = {
            x: x + this._bounds.x,
            y: y + this._bounds.y,
        };

        if (this.isCursorOnScreen()) {
            this._screen.moveTo(this._cursorLocation);
        }
    }

    public setCharacter(char: string | number) {
        if (this.isCursorOnScreen() && this._clip.contains(this._cursorLocation.x, this._cursorLocation.y)) {
            this._screen.setCharacter(char);
        }
    }

    public print(str: string) {
        const strRect = new Rect(
            this._cursorLocation.x,
            this._cursorLocation.y,
            str.length,
            1);
        const intersection = strRect.intersection(this._clip);
        if (intersection === undefined) {
            return;
        }

        this._screen.moveTo(intersection.x, intersection.y);
        this._screen.print(str.substr(intersection.x - this._cursorLocation.x, intersection.width));

        this._cursorLocation = this._screen.cursorLocation;
    }

    public horizontalRepeat(str: string | number, length: number) {
        const drawRect = new Rect(
            this._cursorLocation.x,
            this._cursorLocation.y,
            length,
            1);
        const intersection = drawRect.intersection(this._clip);
        if (intersection === undefined) {
            return;
        }

        for (let x = intersection.left; x <= intersection.right; x++) {
            this._screen.moveTo(x, this._screen.cursorLocation.y);
            this._screen.setCharacter(str);
        }
    }

    public verticalRepeat(str: string | number, length: number) {
        const drawRect = new Rect(
            this._cursorLocation.x,
            this._cursorLocation.y,
            1,
            length);
        const intersection = drawRect.intersection(this._clip);
        if (intersection === undefined) {
            return;
        }

        for (let y = intersection.top; y <= intersection.bottom; y++) {
            this._screen.moveTo(this._screen.cursorLocation.x, y);
            this._screen.setCharacter(str);
        }
    }

    public setClip(region?: Rect) {
        if (region === undefined) {
            this._clip = this._bounds;
            return;
        }

        const absoluteRect = new Rect(
            this._bounds.x + region.x,
            this._bounds.y + region.y,
            region.width,
            region.height);

        const clip = absoluteRect.intersection(this._bounds);
        if (clip === undefined) {
            throw new Error('Clip region does not fall within bounds');
        }

        this._clip = clip;
    }

    public createForSubregion(rect: Rect): ScreenContext {
        const screenRegion = new Rect(
            rect.x + this._bounds.x,
            rect.y + this._bounds.y,
            rect.width,
            rect.height);

        return new ScreenContext(this._screen, screenRegion);
    }

    private isCursorOnScreen() {
        return this._cursorLocation.x < this._screen.columns &&
               this._cursorLocation.y < this._screen.rows;
    }

    private static calculateViewBounds(view: View): Rect {
        let x = view.frame.left;
        let y = view.frame.top;
        let v = view.parent;
        while (v !== undefined) {
            x = x + v.frame.x;
            y = y + v.frame.y;
            v = v.parent;
        }

        return new Rect(x, y, view.frame.width, view.frame.height);
    }
}
