import { View } from '..';

// tslint:disable max-classes-per-file no-use-before-declare

export abstract class Dimension {
    private static NO_DEPENDENCIES = new Array<View>();
    private static NUMBER_REGEX = /^\d+(.\d+)?%?$/;

    public get dependencies(): ReadonlyArray<View> {
        return Dimension.NO_DEPENDENCIES;
    }

    public get needsPosition(): boolean {
        return false;
    }

    abstract absoluteValue(max: number, position?: number): number;

    abstract equal(other: Dimension): boolean;

    public add(pos: Dimension | number | string): Dimension {
        return new AddDimension(this, Dimension.from(pos));
    }

    public subtract(pos: Dimension | number | string): Dimension {
        return new SubtractDimension(this, Dimension.from(pos));
    }

    public static from(value: Dimension | string | number): Dimension {
        if (typeof value === 'string') {
            if (!Dimension.NUMBER_REGEX.test(value)) {
                throw new Error(`Unable to parse value '${value}'`);
            }

            const numberValue = parseFloat(value);
            if (value[value.length - 1] === '%') {
                return new PercentDimension(numberValue);
            }
            return new AbsoluteDimension(numberValue);
        } else if (typeof value === 'number') {
            return new AbsoluteDimension(value);
        }

        return value;
    }

    public static sized(size: number): Dimension {
        return new AbsoluteDimension(size);
    }

    public static percent(relativeSize: number): Dimension {
        return new PercentDimension(relativeSize);
    }

    public static fill(percent: number = 100): Dimension {
        return new FillDimension(percent);
    }

    public static widthOf(view: View): Dimension {
        return new ViewWidthDimension(view);
    }

    public static heightOf(view: View): Dimension {
        return new ViewHeightDimension(view);
    }

    public static equal(a: Dimension | undefined, b: Dimension | undefined): boolean {
        if (a === undefined && b === undefined) {
            return true;
        }
        if (a === undefined || b === undefined) {
            return false;
        }
        return a.equal(b);
    }
}

class AbsoluteDimension extends Dimension {
    constructor(private _value: number) {
        super();
    }

    absoluteValue(_max: number): number {
        return Math.round(this._value);
    }

    equal(other: Dimension): boolean {
        return other instanceof AbsoluteDimension && other._value === this._value;
    }
}

class PercentDimension extends Dimension {
    constructor(private _value: number) {
        super();
        if (_value < 0 || _value > 100) {
            throw new Error('Percentage must be between 0 and 100');
        }
    }

    absoluteValue(max: number): number {
        return Math.round((this._value / 100) * max);
    }

    equal(other: Dimension): boolean {
        return other instanceof PercentDimension && other._value === this._value;
    }
}

class FillDimension extends Dimension {
    constructor(private _percent: number) {
        super();
    }

    get needsPosition(): boolean {
        return true;
    }

    absoluteValue(max: number, position: number): number {
        return Math.round((max - position) * (this._percent / 100));
    }

    equal(other: Dimension): boolean {
        return other instanceof FillDimension;
    }
}

abstract class ViewRelativeDimension extends Dimension {
    constructor(protected _view: View) {
        super();
    }

    public get dependencies(): ReadonlyArray<View> {
        return [this._view];
    }

    equal(other: Dimension): boolean {
        return other instanceof ViewRelativeDimension && other._view === this._view;
    }
}

class ViewHeightDimension extends ViewRelativeDimension {
    constructor(_view: View) {
        super(_view);
    }

    absoluteValue(_max: number): number {
        return this._view.frame.height;
    }
}

class ViewWidthDimension extends ViewRelativeDimension {
    constructor(_view: View) {
        super(_view);
    }

    absoluteValue(_max: number): number {
        return this._view.frame.width;
    }
}

class AddDimension extends Dimension {
    constructor(private _left: Dimension, private _right: Dimension) {
        super();
    }

    public get dependencies(): ReadonlyArray<View> {
        return [...this._left.dependencies, ...this._right.dependencies];
    }

    get needsPosition(): boolean {
        return this._left.needsPosition || this._right.needsPosition;
    }

    absoluteValue(max: number, position?: number): number {
        return this._left.absoluteValue(max, position) + this._right.absoluteValue(max, position);
    }

    equal(other: Dimension): boolean {
        return other instanceof AddDimension &&
               ((other._left.equal(this._left) && other._right.equal(this._right)) ||
                (other._left.equal(this._right) && other._right.equal(this._left)));
    }
}

class SubtractDimension extends Dimension {
    constructor(private _left: Dimension, private _right: Dimension) {
        super();
    }

    get dependencies(): ReadonlyArray<View> {
        return [...this._left.dependencies, ...this._right.dependencies];
    }

    get needsPosition(): boolean {
        return this._left.needsPosition || this._right.needsPosition;
    }

    absoluteValue(max: number, position?: number): number {
        return this._left.absoluteValue(max, position) - this._right.absoluteValue(max, position);
    }

    equal(other: Dimension): boolean {
        return other instanceof SubtractDimension &&
               other._left.equal(this._left) &&
               other._right.equal(this._right);
    }
}
