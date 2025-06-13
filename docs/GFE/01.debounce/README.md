# Debounce

```ts
export default function debounce(func: Function, wait: number): Function {
  let timerId: NodeJS.Timeout | null = null;
  return function () {
    if(timerId !== null) {
      return;
    }
    timerId = setTimeout(function () {
      clearTimeout(timerId!);
      timerId = null;
      func.apply(this, arguments);
    }, wait);
  }
}
```

最开始想的是如上的实现方式，但是仔细看下代码发现实现错误了，

- 第一次执行`debounce`创建了一个计时器，在`wait`后执行函数`func`
- 后面再次执行返回的函数，判断最开始的计时器存在，则不会重新开启计时器，那么这种实现就是在第一个调用后就开始计时，无论执行多少次函数，都会确保在`wait`后只执行一次
- 那么需要修改函数，在每次执行返回函数后，都清除掉前一次的计时器，只在最后一次调用函数后进行计时

```ts
export default function debounce(func: Function, wait: number): Function {
  let timerId: ReturnType<typeof setTimeout> | null = null;
  return function (...args: any[]) {
    clearTimeout(timerId ?? undefined);
    timerId = setTimeout(() => {
      timerId = null;
      func.apply(this, args);
    }, wait);
  }
}
```

- 可以使用`ReturnType`获取一个函数的返回类型，使用`typeof`将函数转换为类型
- `timerId ?? undefined`:
  - `??`: 空值运算符，`leftExpression ?? rightExpression`
    - 如果 `leftExpression` 是 `null` 或 `undefined`，返回 `rightExpression`
    - 否则，返回 `leftExpression`
  - 相当于:

  ```ts
  // 相当于：
    if (timerId === null || timerId === undefined) {
        return undefined;
    } else {
        return timerId;
    }
  ```

  - 与逻辑或运算符（`||`）的区别，逻辑或运算符会在左侧操作数为假值（如0、false、''、NaN、null、undefined）时返回右侧操作数。而空值合并运算符只会在左侧为`null`或`undefined`时返回右侧操作数
- `setTimeout`函数：
  - 在`setTimeout`里面传入普通函数，其`this`指向为`window`，传入箭头函数，则绑定为上级作用域的`this`值
