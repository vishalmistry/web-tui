import { EventEmitter } from '../../common';

export interface MenuItemEvent {
    source: MenuItem;
}

type MenuItemClickedHandler = (event: MenuItemEvent) => void;

export class MenuItem {
    public readonly clicked = new EventEmitter<MenuItemEvent>();

    private _title = '';
    private _children: ReadonlyArray<MenuItem>;
    private _isEnabled = true;
    private _displayText = '';
    private _hotKeyPosition = -1;

    public constructor(title: string, childrenOrClickHandler?: ReadonlyArray<MenuItem> | MenuItemClickedHandler) {
        this.setTitle(title);
        if (typeof childrenOrClickHandler === 'function') {
            this.clicked.subscribe(childrenOrClickHandler);
            this._children = [];
        } else {
            this._children = (childrenOrClickHandler === undefined) ? [] : [...childrenOrClickHandler];
        }
    }

    public get title() {
        return this._title;
    }

    public set title(value: string) {
        if (this._title === value) {
            return;
        }
        this.setTitle(value);
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

    public get displayText() {
        return this._displayText;
    }

    public get hotKey() {
        return this._hotKeyPosition < 0 ? undefined : this._displayText[this._hotKeyPosition];
    }

    public get hotKeyPosition() {
        return this._hotKeyPosition;
    }

    private setTitle(value: string) {
        let displayTitle = '';
        let hotKeyPosition = -1;

        let i = 0;
        while (i < value.length) {
            if (hotKeyPosition < 0 && (i + 2) < value.length &&
                value[i] === '~' && value[i + 2] === '~') {
                hotKeyPosition = hotKeyPosition < 0 ? displayTitle.length : hotKeyPosition;
                displayTitle = displayTitle + value[i + 1];
                i = i + 3;
            } else {
                displayTitle = displayTitle + value[i];
                i = i + 1;
            }
        }

        this._title = value;
        this._displayText = displayTitle;
        this._hotKeyPosition = hotKeyPosition;
    }
}
