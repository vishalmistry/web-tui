export class Rect {
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
        return this.y + this.height - 1;
    }

    public get right() {
        return this.x + this.width - 1;
    }

    public contains(x: number, y: number): boolean {
        return x >= this.left && x <= this.right &&
               y >= this.top && y <= this.bottom;
    }

    public intersection(other: Rect): Rect | undefined {
        const it = Math.max(this.top, other.top);
        const il = Math.max(this.left, other.left);
        const ib = Math.min(this.bottom, other.bottom);
        const ir = Math.min(this.right, other.right);

        const iw = ir - il + 1;
        const ih = ib - it + 1;

        if (iw <= 0 || ih <= 0) {
            return undefined;
        }

        return new Rect(il, it, iw, ih);
    }

    public equal(other: Rect) {
        return this.x === other.x &&
               this.y === other.y &&
               this.width === other.width &&
               this.height === other.height;
    }
}
