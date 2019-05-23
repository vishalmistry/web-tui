export type GUIKeyboardEventType = 'keyup' | 'keydown' | 'keypress';
export type GUIMouseEventType = 'mousemove' | 'mousedown' | 'mouseup' | 'click' | 'dblclick';

export interface GUIInputEvent<T extends string> {
    readonly type: T;
    readonly shiftKey: boolean;
    readonly ctrlKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
}

export interface GUIKeyboardEvent extends GUIInputEvent<GUIKeyboardEventType> {
    readonly code: string;
    readonly key: string;
}

export interface GUIMouseEvent extends GUIInputEvent<GUIMouseEventType> {
    readonly x: number;
    readonly y: number;
    readonly buttons: number;
}

export interface OnKeyDown {
    onKeyDown(event: GUIKeyboardEvent): void;
}
export function hasKeyDownHandler<T>(object: T): object is T & OnKeyDown {
    return typeof (object as any).onKeyDown === 'function';
}

export interface OnKeyUp {
    onKeyUp(event: GUIKeyboardEvent): void;
}
export function hasKeyUpHandler<T>(object: T): object is T & OnKeyUp {
    return typeof (object as any).onKeyUp === 'function';
}

export interface OnKeyPress {
    onKeyPress(event: GUIKeyboardEvent): void;
}
export function hasKeyPressHandler<T>(object: T): object is T & OnKeyPress {
    return typeof (object as any).onKeyPress === 'function';
}

export interface OnMouseMove {
    onMouseMove(event: GUIMouseEvent): void;
}
export function hasMouseMoveHandler<T>(object: T): object is T & OnMouseMove {
    return typeof (object as any).onMouseMove === 'function';
}

export interface OnMouseDown {
    onMouseDown(event: GUIMouseEvent): void;
}
export function hasMouseDownHandler<T>(object: T): object is T & OnMouseDown {
    return typeof (object as any).onMouseDown === 'function';
}

export interface OnMouseUp {
    onMouseUp(event: GUIMouseEvent): void;
}
export function hasMouseUpHandler<T>(object: T): object is T & OnMouseUp {
    return typeof (object as any).onMouseUp === 'function';
}

export interface OnClick {
    onClick(event: GUIMouseEvent): void;
}
export function hasClickHandler<T>(object: T): object is T & OnClick {
    return typeof (object as any).onClick === 'function';
}

export interface OnDoubleClick {
    onDoubleClick(event: GUIMouseEvent): void;
}
export function hasDoubleClickHandler<T>(object: T): object is T & OnDoubleClick {
    return typeof (object as any).onDoubleClick === 'function';
}
