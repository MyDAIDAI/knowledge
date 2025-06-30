# Event Emitter

实现一个观察者模式的`Event Emitter`函数，可以观察/订阅发布者发布的事件，然后在事件发生时执行代码

实现一个类似`Node.js`的`EventEmitter`类

```ts
const emitter = new EventEmitter();

function addTwoNumbers(a, b) {
  console.log(`The sum is ${a + b}`);
}
emitter.on('foo', addTwoNumbers);
emitter.emit('foo', 2, 5);
// > "The sum is 7"

emitter.on('foo', (a, b) => console.log(`The product is ${a * b}`));
emitter.emit('foo', 4, 5);
// > "The sum is 9"
// > "The product is 20"

emitter.off('foo', addTwoNumbers);
emitter.emit('foo', -3, 9);
// > "The product is -27"
```

实现下列接口：

- `new EventEmitter()`
  - `emitter.on(eventName, listener)`
  - `emitter.off(eventName, listener)`
  - `emitter.emit(eventName[, ...args])`

## Solution

```ts
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
```
