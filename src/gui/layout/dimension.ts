import { View } from '..';

// tslint:disable max-classes-per-file no-use-before-declare

export abstract class Dimension {
    private static NUMBER_REGEX = /^\d+(.\d+)?%?$/;

    abstract absoluteValue(max: number): number;

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

    public static sized(position: number): Dimension {
        return new AbsoluteDimension(position);
    }

    public static percent(relativePosition: number): Dimension {
        return new PercentDimension(relativePosition);
    }

    public static widthOf(view: View): Dimension {
        return new ViewWidthDimension(view);
    }

    public static heightOf(view: View): Dimension {
        return new ViewHeightDimension(view);
    }
}

class AbsoluteDimension extends Dimension {
    constructor(private _value: number) {
        super();
    }

    absoluteValue(_max: number): number {
        return this._value;
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
}

class ViewHeightDimension extends Dimension {
    constructor(private _view: View) {
        super();
    }

    absoluteValue(_max: number): number {
        return this._view.frame.height;
    }
}

class ViewWidthDimension extends Dimension {
    constructor(private _view: View) {
        super();
    }

    absoluteValue(_max: number): number {
        return this._view.frame.width;
    }
}

class AddDimension extends Dimension {
    constructor(private _left: Dimension, private _right: Dimension) {
        super();
    }

    absoluteValue(max: number): number {
        return this._left.absoluteValue(max) + this._right.absoluteValue(max);
    }
}

class SubtractDimension extends Dimension {
    constructor(private _left: Dimension, private _right: Dimension) {
        super();
    }

    absoluteValue(max: number): number {
        return this._left.absoluteValue(max) - this._right.absoluteValue(max);
    }
}
