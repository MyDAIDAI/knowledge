interface IEventEmitter {
  on(eventName: string, listener: Function): IEventEmitter;
  off(eventName: string, listener: Function): IEventEmitter;
  emit(eventName: string, ...args: Array<any>): boolean;
}

// You are free to use alternative approaches of
// instantiating the EventEmitter as long as the
// default export has the same interface.
export default class EventEmitter implements IEventEmitter {
  _events: Record<string, Array<Function>>;

  constructor() {
    this._events = Object.create(null);
  }

  on(eventName: string, listener: Function): IEventEmitter {
    if(!Object.hasOwn(this._events, eventName)) {
      this._events[eventName] = []
    }
    this._events[eventName].push(listener)
    return this;
  }

  off(eventName: string, listener: Function): IEventEmitter {
    if(!Object.hasOwn(this._events, eventName)) {
      return this;
    }
    const listeners = this._events[eventName];

    const index = listeners.findIndex((item) => item === listener);
    if(index < 0) {
      return this;
    }

    this._events[eventName].splice(index, 1);
    return this;
  }

  emit(eventName: string, ...args: Array<any>): boolean {
    if(!Object.hasOwn(this._events, eventName) || this._events[eventName].length === 0) {
      return false;
    }
    const listeners = this._events[eventName].slice();
    listeners.forEach((listener) => {
      listener.apply(null, args)
    });
    return true
  }
}