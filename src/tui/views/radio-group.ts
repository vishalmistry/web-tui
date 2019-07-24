import { ScreenContext, TUIMouseEvent } from '..';
import { EventEmitter, Rect } from '../../common';
import {
    OnKeyDown,
    OnKeyPress,
    OnMouseDown,
    OnMouseLeave,
    OnMouseMove,
    OnMouseUp,
    TUIKeyboardEvent,
    ValueChangedEvent,
} from '../interfaces';
import { Dimension } from '../layout';
import { View } from '../views';

export class RadioGroup extends View implements OnMouseDown, OnMouseUp, OnKeyPress, OnKeyDown, OnMouseLeave, OnMouseMove {
    public selectionChanged = new EventEmitter<ValueChangedEvent<number>>();

    private _mouseOverIndex = -1;
    private _mouseDownIndex = -1;
    private _focusedIndex = 0;

    public constructor(private _items: string[], private _selectedIndex = -1) {
        super();
        this.canFocus = true;
        this.resizeToItems();
    }

    public get items() {
        return this._items;
    }

    public set items(value: string[]) {
        this._items = value;
        this._selectedIndex = -1;
        this._focusedIndex = 0;
        this.invalidate();
        this.resizeToItems();
    }

    public get selectedIndex() {
        return this._selectedIndex;
    }

    public set selectedIndex(value: number) {
        if (this._selectedIndex === value) {
            return;
        }
        this._selectedIndex = value;
        this.invalidate();
    }

    public draw(ctx: ScreenContext, _region: Rect) {
        const colors = this.theme.radioGroup;
        const highlightIndex = this._focusedIndex >= 0
            ? this._focusedIndex
            : this._selectedIndex;

        for (let i = 0; i < this._items.length; i++) {
            if (!this.isEnabled) {
                ctx.setColors(colors.disabled);
            } else if (this.hasFocus && highlightIndex === i) {
                ctx.setColors(colors.focused);
            } else if (this._mouseOverIndex === i) {
                ctx.setColors(colors.hover);
            } else {
                ctx.setColors(colors.normal);
            }

            ctx.moveTo(0, i);
            ctx.print(`(${this._selectedIndex === i ? '*' : ' '}) ${this._items[i]}`);
        }
    }

    public positionCursor(ctx: ScreenContext) {
        const index = this._focusedIndex >= 0
            ? this._focusedIndex
            : this._selectedIndex;

        ctx.moveTo(1, Math.max(0, index));
    }

    onMouseMove(event: TUIMouseEvent): void {
        const newOverIndex = this.getItemIndexAtPosition(event.x, event.y);
        if (newOverIndex !== this._mouseOverIndex) {
            this._mouseOverIndex = newOverIndex;
            this.invalidate();
        }
    }

    onMouseLeave(): void  {
        if (this._mouseOverIndex !== -1) {
            this._mouseOverIndex = -1;
            this.invalidate();
        }
    }

    onMouseDown(event: TUIMouseEvent): void {
        const targetItemIndex = this.getItemIndexAtPosition(event.x, event.y);
        if (targetItemIndex < 0) {
            return;
        }

        if (targetItemIndex !== this._focusedIndex) {
            this._focusedIndex = targetItemIndex;
            this.invalidate();
        }
        this._mouseDownIndex = targetItemIndex;
        this.hasFocus = true;
    }

    onMouseUp(event: TUIMouseEvent): void {
        const targetItemIndex = this.getItemIndexAtPosition(event.x, event.y);
        if (targetItemIndex === this._mouseDownIndex) {
            this.setSelectedIndex(targetItemIndex);
        }
    }

    onKeyPress(event: TUIKeyboardEvent): void {
        let newFocusedIndex = this._focusedIndex;
        switch (event.key) {
            case ' ':
                this.setSelectedIndex(this._focusedIndex);
                break;
            case 'ArrowUp':
                newFocusedIndex = Math.max(0, this._focusedIndex - 1);
                break;
            case 'ArrowDown':
                newFocusedIndex = Math.min(this._focusedIndex + 1, this.items.length - 1);
                break;
        }

        if (newFocusedIndex !== this._focusedIndex) {
            this._focusedIndex = newFocusedIndex;
            this.invalidate();
        }
    }

    onKeyDown(event: TUIKeyboardEvent): void {
        this.onKeyPress(event);
    }

    private setSelectedIndex(index: number) {
        if (index === this.selectedIndex) {
            return;
        }
        const previousSelected = this.selectedIndex;
        this.selectedIndex = index;
        this.selectionChanged.emit({ source: this, previousValue: previousSelected, newValue: this.selectedIndex });
    }

    private resizeToItems() {
        const width = RadioGroup.calculateWidth(this._items);
        this.frame = this.frame.setSize(width, this._items.length);
        this.width = Dimension.sized(width);
        this.height = Dimension.sized(this._items.length);
    }

    private getItemIndexAtPosition(x: number, y: number) {
        if (y >= this._items.length) {
            return -1;
        }
        const item = this._items[y];
        return x < (item.length + 4) ? y : -1;
    }

    private static calculateWidth(items: string[]) {
        let maxLen = 0;
        for (const item of items) {
            maxLen = Math.max(maxLen, item.length);
        }
        return maxLen + 4;
    }
}
