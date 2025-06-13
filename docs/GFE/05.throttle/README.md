# throttle

实现一个节流函数，`throttle`是一个技术，来控制一段时间内函数的执行次数。当一个`JavaScript`函数被传入一个节流函数中，它在一段时间内只会被执行一次。

这个函数会被立刻调用，然后在剩余时间内不会再被调用

## Examples

```ts
let i = 0;
function increment() {
  i++;
}
const throttledIncrement = throttle(increment, 300);

// t = 0时: 调用throttledIncrement函数，第一次进入执行，i 为 1
throttledIncrement(); // i = 1

// t = 50: 调用throttledIncrement函数，没有到setTimeout执行时间，i 仍为 1
throttledIncrement(); // i = 1

// t = 350: 超过wait时间，会被调用一次，i++，i 为 2
throttledIncrement(); // i = 2
```

## Solution

可以看出`throttle`有两个状态：

- 空闲`idle`状态：当超过`wait`时间，或者第一次进入时，为该状态
- 激活`active`状态：当执行过该函数，并且还在`wait`时间内的状态
  
使用`setTimeout`来开始进行计时，到时间，则将其状态置为`idle`，每次调用时，判断当前状态，只有在`idle`状态时，才能执行函数以及开启定时器，在这里，使用`timerID`来表示

```ts
type ThrottleFunction<T extends any[]> = (...args: T) => any;
type TimeIDType = ReturnType<typeof setTimeout>

export default function throttle<T extends any[]>(func: ThrottleFunction<T>, wait: number): ThrottleFunction<T> {
  let timerId: TimeIDType | null = null;

  return function(...args) {
    if(timerId) {
      return;
    }
    func.apply(this, args);
    timerId = setTimeout(function () {
      clearTimeout(timerId as TimeIDType);
      timerId = null
    }, wait);
  }
}
```

### `TypeScript`类型解析

1. 泛型类型参数

```ts
<T extends any[]>
```

- T 是泛型类型参数，约束为任意类型的数组 any[]
- 用于捕获被节流函数的参数类型（元组类型）

2. 类型别名

```ts
type ThrottleFunction<T extends any[]> = (...args: T) => any;
type TimeIDType = ReturnType<typeof setTimeout>
```

- 使用剩余参数语法`...args: T`表示参数类型为元组`T`
- 返回类型为`any`

3. 泛型函数

```ts
function throttle<T extends any[]>(...): ThrottleFunction<T>
```

- 泛型函数声明，`T`自动被推断为节流函数的参数类型
- 返回函数类型`ThrottleFunction<T>`保持参数一致

4. `ReturnType`工具类型

```ts
let timerID: ReturnType<typeof setTimeout> | null;
```

- `ReturnType<typeof setTimeout>`获取`setTimeout`的返回值类型
- 兼容不同环境（浏览器返回`number`，`Node.js`返回`NodeJS.Timeout`）

## Apply

滚动事件，窗口缩放等高频触发场景的性能优化

## More

可以添加`leading`或者`trailing`参数，详见[Lodash's throttle](https://lodash.com/docs/4.17.15#throttle)
