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
    keyDown(event: GUIKeyboardEvent): void;
}
export function hasKeyDownHandler<T>(object: T): object is T & OnKeyDown {
    return typeof (object as any).keyDown === 'function';
}

export interface OnKeyUp {
    keyUp(event: GUIKeyboardEvent): void;
}
export function hasKeyUpHandler<T>(object: T): object is T & OnKeyUp {
    return typeof (object as any).keyUp === 'function';
}

export interface OnKeyPress {
    keyPress(event: GUIKeyboardEvent): void;
}
export function hasKeyPressHandler<T>(object: T): object is T & OnKeyPress {
    return typeof (object as any).keyPress === 'function';
}

export interface OnMouseMove {
    mouseMove(event: GUIMouseEvent): void;
}
export function hasMouseMoveHandler<T>(object: T): object is T & OnMouseMove {
    return typeof (object as any).mouseMove === 'function';
}

export interface OnMouseDown {
    mouseDown(event: GUIMouseEvent): void;
}
export function hasMouseDownHandler<T>(object: T): object is T & OnMouseDown {
    return typeof (object as any).mouseDown === 'function';
}

export interface OnMouseUp {
    mouseUp(event: GUIMouseEvent): void;
}
export function hasMouseUpHandler<T>(object: T): object is T & OnMouseUp {
    return typeof (object as any).mouseUp === 'function';
}

export interface OnClick {
    click(event: GUIMouseEvent): void;
}
export function hasClickHandler<T>(object: T): object is T & OnClick {
    return typeof (object as any).click === 'function';
}

export interface OnDoubleClick {
    doubleClick(event: GUIMouseEvent): void;
}
export function hasDoubleClickHandler<T>(object: T): object is T & OnDoubleClick {
    return typeof (object as any).doubleClick === 'function';
}
