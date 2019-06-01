export class Rect {
    public static readonly EMPTY = new Rect(0, 0, 0, 0);

    public readonly x: number;
    public readonly y: number;
    public readonly width: number;
    public readonly height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public get top() {
        return this.y;
    }

    public get left() {
        return this.x;
    }

    public get bottom() {
        return this.y + this.height;
    }

    public get right() {
        return this.x + this.width;
    }

    public moveTo(x: number, y: number): Rect {
        return new Rect(x, y, this.width, this.height);
    }

    public moveBy(deltaX: number, deltaY: number): Rect {
        return new Rect(this.x + deltaX, this.y + deltaY, this.width, this.height);
    }

    public setSize(width: number, height: number) {
        return new Rect (this.x, this.y, width, height);
    }

    public isEmpty() {
        return this.width === 0 || this.height === 0;
    }

    public contains(x: number, y: number): boolean {
        return x >= this.left && x < this.right &&
               y >= this.top && y < this.bottom;
    }

    public intersection(other: Rect): Rect | undefined {
        const it = Math.max(this.top, other.top);
        const il = Math.max(this.left, other.left);
        const ib = Math.min(this.bottom, other.bottom);
        const ir = Math.min(this.right, other.right);

        const iw = ir - il;
        const ih = ib - it;

        if (iw <= 0 || ih <= 0) {
            return undefined;
        }

        return new Rect(il, it, iw, ih);
    }

    public union(other: Rect): Rect {
        const ut = Math.min(this.top, other.top);
        const ul = Math.min(this.left, other.left);
        const ub = Math.max(this.bottom, other.bottom);
        const ur = Math.max(this.right, other.right);

        const uw = ur - ul;
        const uh = ub - ut;

        return new Rect(ul, ut, uw, uh);
    }

    public equal(other: Rect) {
        return this.x === other.x &&
               this.y === other.y &&
               this.width === other.width &&
               this.height === other.height;
    }

    public sizeEqual(other: Rect) {
        return this.width === other.width &&
               this.height === other.height;
    }
}
