type EventHandler<TArg> = (arg: TArg) => void;

export class EventEmitter<TArg> {
    private _handlers = new Array<EventHandler<TArg>>();

    public get hasSubscribers() {
        return this._handlers.length > 0;
    }

    public subscribe(handler: EventHandler<TArg>) {
        if (this._handlers.indexOf(handler) < 0) {
            this._handlers.push(handler);
        }
    }

    public unsubscribe(handler: EventHandler<TArg>) {
        const index = this._handlers.indexOf(handler);
        if (index >= 0) {
            this._handlers.splice(index, 1);
        }
    }

    public emit(arg: TArg) {
        for (const handler of this._handlers) {
            try {
                handler(arg);
            } catch (err) {
                console.error('Event handler failed: ', err);
            }
        }
    }
}
