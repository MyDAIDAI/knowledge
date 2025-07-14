# Map Async Limit

实现一个函数，传入一个参数数组，以及一个异步函数，返回一个`Promise`

执行该参数时，可以带入一个可选参数`size`，这是同时并发最大请求数。如果该参数没有被指定，那么并发数量无限制

## Example

```ts
async function fetchUpperCase(q: string) {
  // Fake API service that converts a string to uppercase.
  const res = await fetch('https://uppercase.com?q=' + encodeURIComponent(q));
  return await res.text();
}

// Only a maximum of 2 pending requests at any one time.
const results = await mapAsyncLimit(
  ['foo', 'bar', 'qux', 'quz'],
  fetchUpperCase,
  2,
);
console.log(results); // ['FOO', 'BAR', 'QUX', 'QUZ'];

```

## Solution

一般的想法是使用传入的`size`大小将输入数组进行切割为一个`chunk`，然后一次并发处理一个`chunk`。这个解决办法可以使用`Prmise.all`来进行处理

### 方法 1: 顺序请求(Bad!)

这个方法忽略了参数`size`，一个一个的处理每一个异步请求，必须前一次请求完毕才能进行下一次请求

```ts
export default function mapAsyncLimit<T, U>(
  iterable: Array<T>,
  callbackFn: (value: T) => Promise<U>,
  size: number,
): Promise<Array<U>> {
  return new Promise((resolve, reject) => {
    const results: Array<U> = [];

    function processItem(index: number) {
      if (index === iterable.length) {
        resolve(results);
      }

      return callbackFn(iterable[index])
        .then((result) => {
          results.push(result);
          processItem(index + 1);
        })
        .catch(reject);
    }

    return processItem(0);
  });
}
```

### 方法 2：按`chunks`循环执行

- 使用`Promise.all`对`chunks`进行并发处理
- 递归调用`mapAsyncLimit`函数处理剩余数据

```ts
export default function mapAsyncLimit<T, U>(
  iterable: Array<T>,
  callbackFn: (value: T) => Promise<U>,
  size: number,
): Promise<Array<U>> {
  if(iterable.length === 0) {
    return Promise.resolve([]);
  }

  const currentChunk = iterable.slice(0, size);
  const remainingItems = iterable.slice(size);

  return Promise.all(currentChunk.map(callbackFn)).then((results) => {
    return mapAsyncLimit(remainingItems, callbackFn, size).then((remainingResults) => {
      return [...results, ...remainingResults];
    });
  });
}
```

### 方法 2：使用`async/await`来执行`chunks`
