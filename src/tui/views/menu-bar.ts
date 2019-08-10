import { MenuItem, View } from '.';
import { ScreenContext } from '..';
import { Rect, repeatString } from '../../common';
import { OnClick, TUIMouseEvent } from '../interfaces';
import { Dimension } from '../layout';
import { Menu } from './menu';

export class MenuBar extends View implements OnClick {
    private _selectedIndex = -1;
    private _openMenu?: Menu;

    public constructor(private _items: ReadonlyArray<MenuItem>) {
        super();

        this.width = Dimension.fill();
        this.height = Dimension.sized(1);
    }

    public get items() {
        return this._items;
    }

    public set items(value: ReadonlyArray<MenuItem>) {
        this._items = value;
        this._selectedIndex = -1;
        this.invalidate();
    }

    public draw(ctx: ScreenContext, _region: Rect) {
        const colors = this.theme.menuBar;
        ctx.moveTo(0, 0);

        let xPos = 0;
        for (let i = 0; i < this._items.length; i++) {
            const item = this._items[i];
            if (!this.isEnabled || !item.isEnabled) {
                ctx.setColors(colors.disabled);
            } else if (i === this._selectedIndex) {
                ctx.setColors(colors.selected);
            } else {
                ctx.setColors(colors.normal);
            }

            ctx.print(` ${item.title} `);
            xPos = xPos + item.title.length + 2;
        }

        ctx.setColors(colors.normal);
        ctx.print(repeatString(' ', this.bounds.width - xPos));
    }

    public positionCursor(ctx: ScreenContext) {
        let currentEnd = 0;
        for (let i = 0; i < this._selectedIndex; i++) {
            currentEnd = currentEnd + this._items[i].title.length + 2;
        }

        ctx.moveTo(currentEnd + 1, 0);
    }

    onClick(event: TUIMouseEvent) {
        const newSelection = this.getItemIndexAtPosition(event.x);
        if (newSelection >= 0 && newSelection !== this._selectedIndex) {
            this.openMenu(newSelection);
        } else {
            this.closeMenu();
        }
    }

    public openNextMenu() {
        const newSelectedIndex = (this._selectedIndex + 1) % this._items.length;
        if (newSelectedIndex !== this._selectedIndex) {
            this.openMenu(newSelectedIndex);
        }
    }

    public openPreviousMenu() {
        let newSelectedIndex = this._selectedIndex - 1;
        if (newSelectedIndex < 0) {
            newSelectedIndex = this._items.length - 1;
        }

        if (newSelectedIndex !== this._selectedIndex) {
            this.openMenu(newSelectedIndex);
        }
    }

    public closeMenu() {
        if (this._openMenu === undefined) {
            return;
        }

        this._selectedIndex = -1;
        this.invalidate();

        this._openMenu.close();
        this._openMenu = undefined;
    }

    private openMenu(index: number) {
        if (this.parent === undefined || index < 0 || index >= this._items.length) {
            return;
        }

        this.closeMenu();

        this._selectedIndex = index;
        this.invalidate();

        const relativeX = this._items
            .slice(0, index)
            .map((i) => i.title.length + 2)
            .reduce((p, c) => p + c, 0);

        const menuItems = this._items[index].children;
        const newMenu = new Menu(this, menuItems);
        newMenu.x = this.frame.x + relativeX;
        newMenu.y = this.frame.y + 1;

        this._openMenu = newMenu;
        this.parent.addChild(this._openMenu);
    }

    private getItemIndexAtPosition(x: number): number {
        let currentEnd = 0;
        for (let i = 0; i < this._items.length; i++) {
            currentEnd = currentEnd + this._items[i].title.length + 2;
            if (x < currentEnd) {
                return i;
            }
        }

        return -1;
    }
}
