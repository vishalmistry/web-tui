import { Rect, View } from '.';
import { Screen } from '../screen';

export class ScreenContext {
    private bounds: Rect;
    private clip: Rect;

    constructor(private screen: Screen, viewOrRegion: View | Rect) {
        if (viewOrRegion instanceof View) {
            this.bounds = ScreenContext.calculateViewBounds(viewOrRegion);
        } else {
            this.bounds = viewOrRegion;
        }

        this.clip = this.bounds;
    }

    public get background(): number {
        return this.screen.background;
    }

    public set background(value: number) {
        this.screen.background = value;
    }

    public get foreground(): number {
        return this.screen.foreground;
    }

    public set foreground(value: number) {
        this.screen.foreground = value;
    }

    public get isCursorVisible() {
        return this.screen.isCursorVisible;
    }

    public set isCursorVisible(value: boolean) {
        this.screen.isCursorVisible = value;
    }

    public moveTo(position: [number, number]): void;
    public moveTo(x: number, y: number): void;
    moveTo(x: [number, number] | number, y?: number) {
        if (typeof x === 'object') {
            [x, y] = x;
        } else if (y === undefined) {
            throw new Error('Bad arguments');
        }

        this.screen.moveTo(x + this.bounds.x, y + this.bounds.y);
    }

    public setCharacter(char: string | number) {
        if (this.clip.contains(this.screen.cursorLocation.x, this.screen.cursorLocation.y)) {
            this.screen.setCharacter(char);
        }
    }

    public print(str: string) {
        const strRect = new Rect(
            this.screen.cursorLocation.x,
            this.screen.cursorLocation.y,
            str.length,
            1);
        const intersection = strRect.intersection(this.clip);
        if (intersection === undefined) {
            return;
        }

        this.screen.moveTo(intersection.x, intersection.y);
        this.screen.print(str.substr(intersection.x - this.screen.cursorLocation.x, intersection.width));
    }

    public setClip(region?: Rect) {
        if (region === undefined) {
            this.clip = this.bounds;
            return;
        }

        const absoluteRect = new Rect(
            this.bounds.x + region.x,
            this.bounds.y + region.y,
            region.width,
            region.height);

        const clip = absoluteRect.intersection(this.bounds);
        if (clip === undefined) {
            throw new Error('Clip region does not fall within bounds');
        }

        this.clip = clip;
    }

    public createForSubregion(rect: Rect): ScreenContext {
        const screenRegion = new Rect(
            rect.x + this.bounds.x,
            rect.y + this.bounds.y,
            rect.width,
            rect.height);

        return new ScreenContext(this.screen, screenRegion);
    }

    private static calculateViewBounds(view: View): Rect {
        let x = view.bounds.left;
        let y = view.bounds.top;
        let v = view.parent;
        while (v !== undefined) {
            x = x + v.bounds.x;
            y = y + v.bounds.y;
            v = v.parent;
        }

        return new Rect(x, y, view.bounds.width, view.bounds.height);
    }
}
