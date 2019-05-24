import { View } from '.';
import { Rect } from '../common';
import { Screen } from '../screen';

export class ScreenContext {
    private static readonly SINGLE_FRAME_CHARS = '─│┌┐└┘';
    private static readonly DOUBLE_FRAME_CHARS = '═║╔╗╚╝';

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

    public drawFrame(rect: Rect, style: 'single' | 'double') {
        const absoluteRect = new Rect(
            rect.x + this._bounds.x,
            rect.y + this._bounds.y,
            rect.width,
            rect.height);
        const intersection = absoluteRect.intersection(this._clip);
        if (intersection === undefined) {
            return;
        }
        const frameChars = style === 'single'
            ? ScreenContext.SINGLE_FRAME_CHARS
            : ScreenContext.DOUBLE_FRAME_CHARS;

        const hLines = [
            intersection.top === absoluteRect.top ? intersection.top : -1,
            intersection.bottom === absoluteRect.bottom ? intersection.bottom : -1,
        ];
        for (const y of hLines) {
            if (y < 0) {
                continue;
            }

            const left = intersection.left + (intersection.left === absoluteRect.left ? 1 : 0);
            const right = intersection.right - (intersection.right === absoluteRect.right ? 1 : 0);
            for (let x = left; x <= right; x++) {
                this._screen.moveTo(x, y);
                this._screen.setCharacter(frameChars[0]);
            }
        }

        const vLines = [
            intersection.left === absoluteRect.left ? intersection.left : -1,
            intersection.right === absoluteRect.right ? intersection.right : -1,
        ];
        for (const x of vLines) {
            if (x < 0) {
                continue;
            }
            const top = intersection.top + (intersection.top === absoluteRect.top ? 1 : 0);
            const bottom = intersection.bottom - (intersection.bottom === absoluteRect.bottom ? 1 : 0);

            for (let y = top; y <= bottom; y++) {
                this._screen.moveTo(x, y);
                this._screen.setCharacter(frameChars[1]);
            }
        }

        if (intersection.top === absoluteRect.top) {
            if (intersection.left === absoluteRect.left) {
                this._screen.moveTo(intersection.left, intersection.top);
                this._screen.setCharacter(frameChars[2]);
            }
            if (intersection.right === absoluteRect.right) {
                this._screen.moveTo(intersection.right, intersection.top);
                this._screen.setCharacter(frameChars[3]);
            }
        }
        if (intersection.bottom === absoluteRect.bottom) {
            if (intersection.left === absoluteRect.left) {
                this._screen.moveTo(intersection.left, intersection.bottom);
                this._screen.setCharacter(frameChars[4]);
            }
            if (intersection.right === absoluteRect.right) {
                this._screen.moveTo(intersection.right, intersection.bottom);
                this._screen.setCharacter(frameChars[5]);
            }
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
