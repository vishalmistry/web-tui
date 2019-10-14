import { View } from './views';

export type TUIKeyboardEventType = 'keyup' | 'keydown' | 'keypress' | 'hotkey';
export type TUIMouseEventType = 'mousemove' | 'mousedown' | 'mouseup' | 'click' | 'dblclick';

export interface TUIInputEvent<T extends string> {
    readonly type: T;
    readonly shiftKey: boolean;
    readonly ctrlKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly source: View;
    handled: boolean;
    preventDefault: () => void;
}

export interface TUIKeyboardEvent extends TUIInputEvent<TUIKeyboardEventType> {
    readonly code: string;
    readonly key: string;
}

export interface TUIMouseEvent extends TUIInputEvent<TUIMouseEventType> {
    readonly x: number;
    readonly y: number;
    readonly buttons: number;
}

export interface OnHotKeyDown {
    onHotKeyDown(event: TUIKeyboardEvent): void;
}
export function hasHotKeyDownHandler<T>(object: T): object is T & OnHotKeyDown {
    return object !== undefined && typeof (object as any).onHotKeyDown === 'function';
}

export interface OnKeyDown {
    onKeyDown(event: TUIKeyboardEvent): void;
}
export function hasKeyDownHandler<T>(object: T): object is T & OnKeyDown {
    return object !== undefined && typeof (object as any).onKeyDown === 'function';
}

export interface OnKeyUp {
    onKeyUp(event: TUIKeyboardEvent): void;
}
export function hasKeyUpHandler<T>(object: T): object is T & OnKeyUp {
    return object !== undefined && typeof (object as any).onKeyUp === 'function';
}

export interface OnKeyPress {
    onKeyPress(event: TUIKeyboardEvent): void;
}
export function hasKeyPressHandler<T>(object: T): object is T & OnKeyPress {
    return object !== undefined && typeof (object as any).onKeyPress === 'function';
}

export interface OnMouseEnter {
    onMouseEnter(): void;
}
export function hasMouseEnterHandler<T>(object: T): object is T & OnMouseEnter {
    return object !== undefined && typeof (object as any).onMouseEnter === 'function';
}

export interface OnMouseLeave {
    onMouseLeave(): void;
}
export function hasMouseLeaveHandler<T>(object: T): object is T & OnMouseLeave {
    return object !== undefined && typeof (object as any).onMouseLeave === 'function';
}

export interface OnMouseMove {
    onMouseMove(event: TUIMouseEvent): void;
}
export function hasMouseMoveHandler<T>(object: T): object is T & OnMouseMove {
    return object !== undefined && typeof (object as any).onMouseMove === 'function';
}

export interface OnMouseDown {
    onMouseDown(event: TUIMouseEvent): void;
}
export function hasMouseDownHandler<T>(object: T): object is T & OnMouseDown {
    return object !== undefined && typeof (object as any).onMouseDown === 'function';
}

export interface OnMouseUp {
    onMouseUp(event: TUIMouseEvent): void;
}
export function hasMouseUpHandler<T>(object: T): object is T & OnMouseUp {
    return object !== undefined && typeof (object as any).onMouseUp === 'function';
}

export interface OnClick {
    onClick(event: TUIMouseEvent): void;
}
export function hasClickHandler<T>(object: T): object is T & OnClick {
    return object !== undefined && typeof (object as any).onClick === 'function';
}

export interface OnDoubleClick {
    onDoubleClick(event: TUIMouseEvent): void;
}
export function hasDoubleClickHandler<T>(object: T): object is T & OnDoubleClick {
    return object !== undefined && typeof (object as any).onDoubleClick === 'function';
}

export interface ViewEvent {
    source: View;
}

export interface ValueChangedEvent<T> extends ViewEvent {
    previousValue: T;
    newValue: T;
}
