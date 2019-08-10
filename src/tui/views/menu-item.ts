import { EventEmitter } from '../../common';

export interface MenuItemEvent {
    source: MenuItem;
}

export class MenuItem {
    public readonly clicked = new EventEmitter<MenuItemEvent>();

    private _children: ReadonlyArray<MenuItem>;
    private _isEnabled = true;

    public constructor(private _title: string, children?: MenuItem[]) {
        this._children = (children === undefined) ? [] : [...children];
    }

    public get title() {
        return this._title;
    }

    public set title(value: string) {
        if (this._title === value) {
            return;
        }
        this._title = value;
    }

    public get children(): ReadonlyArray<MenuItem> {
        return this._children;
    }

    public set children(value: ReadonlyArray<MenuItem>) {
        this._children = value;
    }

    public get isEnabled() {
        return this._isEnabled;
    }

    public set isEnabled(value: boolean) {
        if (this._isEnabled === value) {
            return;
        }
        this._isEnabled = value;
    }

    public get isSeparator() {
        return this._title === '-';
    }
}
