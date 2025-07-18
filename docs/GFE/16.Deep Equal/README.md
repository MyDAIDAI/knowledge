# Deep Equal

实现一个函数，可以深度比较两个参数的值是否相等。如果相等返回`true`，不相等

- 参数只是可以使用`JSON`序列化的值（`numbers`，`strings`，`boolean`，`null`，`objects`， `arrays`）
- 对象中不包含循环对象

## Examples

```ts
deepEqual('foo', 'foo'); // true
deepEqual({ id: 1 }, { id: 1 }); // true
deepEqual([1, 2, 3], [1, 2, 3]); // true
deepEqual([{ id: '1' }], [{ id: '2' }]); // false
```

## Solution

```ts
function shouldDeepEqual(type: string) {
  return type === '[object Object]' || type === '[object Array]';
}


function getType(value: unknown): string {
  return Object.prototype.toString.call(value);
}

export default function deepEqual(valueA: unknown, valueB: unknown): boolean {

  const typeA = getType(valueA);
  const typeB = getType(valueB);
  
  if(typeA !== typeB) {
    return false;
  }

  if(shouldDeepEqual(typeA) && shouldDeepEqual(typeB)) {
    const entriesA = Object.entries(valueA);
    const entriesB = Object.entries(valueB);

    if(entriesA.length !== entriesB.length) {
      return false;
    }

    return entriesA.every(([key, value]) => Object.hasOwn(valueB, key) && deepEqual(value, valueB[key]));
  }

  return Object.is(valueA, valueB);
}
```
