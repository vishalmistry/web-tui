import { View } from '..';

// tslint:disable max-classes-per-file no-use-before-declare

export abstract class Position  {
    private static NUMBER_REGEX = /^\d+(.\d+)?%?$/;
    private static NO_DEPENDENCIES = new Array<View>();

    public get dependencies(): ReadonlyArray<View> {
        return Position.NO_DEPENDENCIES;
    }

    abstract absoluteValue(max: number): number;

    abstract equal(other: Position): boolean;

    public add(pos: Position | number | string): Position {
        return new AddPosition(this, Position.from(pos));
    }

    public subtract(pos: Position | number | string): Position {
        return new SubtractPosition(this, Position.from(pos));
    }

    public static from(value: Position | string | number): Position {
        if (typeof value === 'string') {
            if (!Position.NUMBER_REGEX.test(value)) {
                throw new Error(`Unable to parse value '${value}'`);
            }

            const numberValue = parseFloat(value);
            if (value[value.length - 1] === '%') {
                return new PercentPosition(numberValue);
            }
            return new AbsolutePosition(numberValue);
        } else if (typeof value === 'number') {
            return new AbsolutePosition(value);
        }

        return value;
    }

    public static at(position: number): Position {
        return new AbsolutePosition(position);
    }

    public static percent(relativePosition: number): Position {
        return new PercentPosition(relativePosition);
    }

    public static center(): Position {
        return new CenterPosition();
    }

    public static leftOf(view: View): Position {
        return new ViewLeftPosition(view);
    }

    public static topOf(view: View): Position {
        return new ViewTopPostion(view);
    }

    public static rightOf(view: View): Position {
        return new ViewRightPostion(view);
    }

    public static bottomOf(view: View): Position {
        return new ViewBottomPostion(view);
    }

    public static equal(a: Position | undefined, b: Position | undefined): boolean {
        if (a === undefined && b === undefined) {
            return true;
        }
        if (a === undefined || b === undefined) {
            return false;
        }
        return a.equal(b);
    }
}

class AbsolutePosition extends Position {
    constructor(private _value: number) {
        super();
    }

    absoluteValue(_max: number): number {
        return this._value;
    }

    equal(other: Position): boolean {
        return other instanceof AbsolutePosition && other._value === this._value;
    }
}

class PercentPosition extends Position {
    constructor(private _value: number) {
        super();
        if (_value < 0 || _value > 100) {
            throw new Error('Percentage must be between 0 and 100');
        }
    }

    absoluteValue(max: number): number {
        return Math.round((this._value / 100) * max);
    }

    equal(other: Position): boolean {
        return other instanceof PercentPosition && other._value === this._value;
    }
}

class CenterPosition extends Position {
    absoluteValue(max: number): number {
        return Math.round(max / 2);
    }

    equal(other: Position): boolean {
        return other instanceof CenterPosition;
    }
}

abstract class ViewRelativePosition extends Position {
    constructor(protected _view: View) {
        super();
    }

    public get dependencies(): ReadonlyArray<View> {
        return [this._view];
    }

    equal(other: Position): boolean {
        return other instanceof ViewRelativePosition && other._view === this._view;
    }
}

class ViewLeftPosition extends ViewRelativePosition {
    constructor(_view: View) {
        super(_view);
    }

    absoluteValue(_max: number): number {
        return this._view.frame.left;
    }
}

class ViewTopPostion extends ViewRelativePosition {
    constructor(_view: View) {
        super(_view);
    }

    absoluteValue(_max: number): number {
        return this._view.frame.top;
    }
}

class ViewRightPostion extends ViewRelativePosition {
    constructor(_view: View) {
        super(_view);
    }

    absoluteValue(_max: number): number {
        return this._view.frame.right;
    }
}

class ViewBottomPostion extends ViewRelativePosition {
    constructor(_view: View) {
        super(_view);
    }

    absoluteValue(_max: number): number {
        return this._view.frame.bottom;
    }
}

class AddPosition extends Position {
    constructor(private _left: Position, private _right: Position) {
        super();
    }

    public get dependencies(): ReadonlyArray<View> {
        return [...this._left.dependencies, ...this._right.dependencies];
    }

    absoluteValue(max: number): number {
        return this._left.absoluteValue(max) + this._right.absoluteValue(max);
    }

    equal(other: Position): boolean {
        return other instanceof AddPosition &&
               ((other._left.equal(this._left) && other._right.equal(this._right)) ||
                (other._left.equal(this._right) && other._right.equal(this._left)));
    }
}

class SubtractPosition extends Position {
    constructor(private _left: Position, private _right: Position) {
        super();
    }

    public get dependencies(): ReadonlyArray<View> {
        return [...this._left.dependencies, ...this._right.dependencies];
    }

    absoluteValue(max: number): number {
        return this._left.absoluteValue(max) - this._right.absoluteValue(max);
    }

    equal(other: Position): boolean {
        return other instanceof SubtractPosition &&
               other._left.equal(this._left) &&
               other._right.equal(this._right);
    }
}
