import { View } from '.';
import { TUIKeyboardEvent } from '..';
import { Application } from '../application';
import { DosTheme } from '../dos-theme';
import { OnKeyDown } from '../interfaces';

export class ModalView extends View implements OnKeyDown {
    private _application?: Application;

    public constructor() {
        super();
        this.theme = DosTheme.instance;
    }

    public get application() {
        if (this._application === undefined) {
            throw new Error('View is not part of an application');
        }
        return this._application;
    }

    protected onFocus() {
        // No-op
    }

    protected onBlur() {
        // No-op
    }

    onKeyDown(event: TUIKeyboardEvent): void {
        if (event.altKey || event.ctrlKey || event.metaKey || event.key !== 'Tab') {
            return;
        }

        if (event.shiftKey) {
            if (this.focusedView !== undefined) {
                if (!this.focusedView.focusPrevious()) {
                    this.focusLast();
                }
            } else {
                this.focusLast();
            }
        } else {
            if (this.focusedView !== undefined) {
                if (!this.focusedView.focusNext()) {
                    this.focusNext();
                }
            } else {
                this.focusNext();
            }
        }

        // Prevent browser responding
        event.preventDefault();

        // Prevent bubbling up
        event.handled = true;
    }

    setApplication(value?: Application) {
        if (value !== undefined &&
            this._application !== undefined &&
            this._application !== value) {
            throw new Error('View is already part of a different application');
        }
        this._application = value;
    }
}
