import { View } from '..';

// tslint:disable max-classes-per-file no-use-before-declare

export abstract class Position  {
    private static NUMBER_REGEX = /^\d+(.\d+)?%?$/;

    abstract absoluteValue(max: number): number;

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
}

class AbsolutePosition extends Position {
    constructor(private _value: number) {
        super();
    }

    absoluteValue(_max: number): number {
        return this._value;
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
}

class CenterPosition extends Position {
    absoluteValue(max: number): number {
        return Math.round(max / 2);
    }
}

class ViewLeftPosition extends Position {
    constructor(private _view: View) {
        super();
    }

    absoluteValue(_max: number): number {
        return this._view.frame.left;
    }
}

class ViewTopPostion extends Position {
    constructor(private _view: View) {
        super();
    }

    absoluteValue(_max: number): number {
        return this._view.frame.top;
    }
}

class ViewRightPostion extends Position {
    constructor(private _view: View) {
        super();
    }

    absoluteValue(_max: number): number {
        return this._view.frame.right;
    }
}

class ViewBottomPostion extends Position {
    constructor(private _view: View) {
        super();
    }

    absoluteValue(_max: number): number {
        return this._view.frame.bottom;
    }
}

class AddPosition extends Position {
    constructor(private _left: Position, private _right: Position) {
        super();
    }

    absoluteValue(max: number): number {
        return this._left.absoluteValue(max) + this._right.absoluteValue(max);
    }
}

class SubtractPosition extends Position {
    constructor(private _left: Position, private _right: Position) {
        super();
    }

    absoluteValue(max: number): number {
        return this._left.absoluteValue(max) - this._right.absoluteValue(max);
    }
}
