import { MenuItem, View } from '.';
import { ScreenContext } from '..';
import { leftAlignString, Rect } from '../../common';
import {
    OnKeyDown,
    OnMouseDown,
    OnMouseMove,
    OnMouseUp,
    TUIKeyboardEvent,
    TUIMouseEvent,
} from '../interfaces';
import { Dimension } from '../layout';
import { MenuBar } from './menu-bar';

export class Menu extends View implements OnMouseMove, OnMouseDown, OnMouseUp, OnKeyDown {
    private _focusedIndex: number;
    private _openSubMenu?: Menu;

    constructor(private _host: MenuBar, private _items: ReadonlyArray<MenuItem>, private _parentMenu?: Menu) {
        super();
        this.hasFocus = true;
        this._focusedIndex = _items.findIndex((item) => item.isEnabled && !item.isSeparator);
        this.resizeToItems();
    }

    public draw(ctx: ScreenContext, _region: Rect) {
        const colors = this._host.theme.menu;
        ctx.setColors(colors.frame);
        ctx.drawFrame(this.bounds, 'single');

        for (let i = 0; i < this._items.length; i++) {
            const item = this._items[i];

            if (item.isSeparator) {
                ctx.setColors(colors.normal);

                ctx.moveTo(0, i + 1);
                ctx.setCharacter(195);

                ctx.moveTo(1, i + 1);
                ctx.horizontalRepeat(196, this.bounds.width - 2);

                ctx.moveTo(this.bounds.width - 1, i + 1);
                ctx.setCharacter(180);
                continue;
            }

            if (!item.isEnabled) {
                ctx.setColors(colors.disabled);
            } else if (i === this._focusedIndex) {
                ctx.setColors(colors.focused);
            } else {
                ctx.setColors(colors.normal);
            }

            ctx.moveTo(1, i + 1);
            ctx.print(leftAlignString(` ${item.title} `, this.bounds.width - 2));

            if (item.children.length > 0) {
                ctx.moveTo(this.bounds.width - 3, i + 1);
                ctx.setCharacter(16);
            }
        }
    }

    public close() {
        this.closeSubMenu();

        if (this._host.parent !== undefined) {
            this._host.parent.removeChild(this);
        }
    }

    public positionCursor(ctx: ScreenContext) {
        if (this._focusedIndex < 0) {
            ctx.moveTo(0, 0);
        } else {
            ctx.moveTo(2, this._focusedIndex + 1);
        }
    }

    onMouseMove(event: TUIMouseEvent) {
        if (this._openSubMenu !== undefined) {
            return;
        }
        this.focusItemAtPostion(event.x, event.y);
    }

    onMouseDown(event: TUIMouseEvent) {
        this.closeSubMenu();
        this.focusItemAtPostion(event.x, event.y);
    }

    onMouseUp(event: TUIMouseEvent) {
        const focusedIndex = this.getItemIndexAtPosition(event.x, event.y);
        if (focusedIndex >= 0) {
            this.fireItemAction(focusedIndex);
        }
    }

    onKeyDown(event: TUIKeyboardEvent) {
        let newFocusedIndex = this._focusedIndex;
        do {
            switch (event.key) {
                case 'Return':
                case 'Enter':
                    this.fireItemAction(this._focusedIndex);
                    break;
                case 'Escape':
                    this._host.closeMenu();
                    break;
                case 'ArrowUp':
                    newFocusedIndex = Math.max(0, newFocusedIndex - 1);
                    break;
                case 'ArrowDown':
                    newFocusedIndex = Math.min(newFocusedIndex + 1, this._items.length - 1);
                    break;
                case 'ArrowLeft':
                    if (this._parentMenu !== undefined) {
                        this._parentMenu.closeSubMenu();
                    } else {
                        this._host.openPreviousMenu();
                    }
                    break;
                case 'ArrowRight':
                    if (this._items[this._focusedIndex].children.length > 0) {
                        this.openSubMenu(this._focusedIndex);
                    } else {
                        this._host.openNextMenu();
                    }
                    break;
                case 'Tab':
                    if (event.metaKey || event.ctrlKey || event.altKey) {
                        break;
                    }
                    if (event.shiftKey) {
                        this._host.openPreviousMenu();
                    } else {
                        this._host.openNextMenu();
                    }
                    break;
            }
        } while (this._items[newFocusedIndex].isSeparator &&
                 newFocusedIndex !== 0 &&
                 newFocusedIndex !== this._items.length - 1);

        if (newFocusedIndex !== this._focusedIndex && !this._items[newFocusedIndex].isSeparator) {
            this._focusedIndex = newFocusedIndex;
            this.invalidate();
        }

        event.handled = true;
    }

    private closeSubMenu() {
        if (this._openSubMenu !== undefined) {
            this._openSubMenu.close();
            this._openSubMenu = undefined;
        }

        this.hasFocus = true;
    }

    private openSubMenu(index: number) {
        if (this._host.parent === undefined) {
            return;
        }

        this.closeSubMenu();

        const menuItems = this._items[index].children;
        const newMenu = new Menu(this._host, menuItems, this);
        newMenu.x = this.frame.right - 1;
        newMenu.y = this.frame.y + index;

        this._openSubMenu = newMenu;
        this._host.parent.addChild(this._openSubMenu);
    }

    private fireItemAction(index: number) {
        const selectedItem = this._items[index];
        if (selectedItem.children.length > 0) {
            this.openSubMenu(index);
        } else {
            this._host.closeMenu();
        }
        selectedItem.clicked.emit({ source: selectedItem });
    }

    private focusItemAtPostion(x: number, y: number) {
        const newFocusedIndex = this.getItemIndexAtPosition(x, y);
        if (newFocusedIndex !== this._focusedIndex) {
            this._focusedIndex = newFocusedIndex;
            this.invalidate();
        }
    }

    private getItemIndexAtPosition(x: number, y: number) {
        if (x === 0 || x === this.bounds.width - 1 ||
            y === 0 || y === this.bounds.height - 1) {
            return -1;
        }

        const itemIndex = y - 1;
        const item = this._items[itemIndex];
        return item.isEnabled && !item.isSeparator ? itemIndex : -1;
    }

    private resizeToItems() {
        const width = this._items
            .map((item) => item.title.length + (item.children.length > 0 ? 2 : 0))
            .reduce((acc, curr) => Math.max(acc, curr), 0);
        const height = this._items.length;

        this.width = Dimension.sized(width + 4);
        this.height = Dimension.sized(height + 2);
    }
}
