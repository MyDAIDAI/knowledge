# Deep Clone

实现一个深拷贝函数，只考虑实现使用`JSON.stringify`可以进行序列化的数据类型，如`null`, `boolean`, `number`, `string`, `Array`, `Object`，不用包含其他比如`Date`, `Regex`, `Map` or `Set`

```ts
const obj1 = { user: { role: 'admin' } };
const clonedObj1 = deepClone(obj1);

clonedObj1.user.role = 'guest'; // Change the cloned user's role to 'guest'.
clonedObj1.user.role; // 'guest'
obj1.user.role; // Should still be 'admin'.

const obj2 = { foo: [{ bar: 'baz' }] };
const clonedObj2 = deepClone(obj2);

obj2.foo[0].bar = 'bax'; // Modify the original object.
obj2.foo[0].bar; // 'bax'
clonedObj2.foo[0].bar; // Should still be 'baz'.
```

## Solution

这个解决办法比较简单，比较快的方式就是通过`JSON.stringify`，第二种方式就是对数据进行递归，每次遇到数组或者对象，则创建新对象，并且进行递归赋值

### `JSON.stringify`

使用`JSON`虽然比较快也比较方便，但是会有一些缺陷

- 递归数据结构：当您向 JSON.stringify() 提供递归数据结构时，它会抛出异常。在使用链表或树时，这种情况很容易发生。
- 内置类型：如果值包含其他 JS 内置类型（例如 Map、Set、Date、RegExp 或 ArrayBuffer），JSON.stringify() 将抛出异常。
- 函数：JSON.stringify() 会静默舍弃函数。

方法1：

```ts
export default function deepClone<T>(obj: T): T {
  if(!obj || typeof obj !== 'object') {
    return obj;
  }
  const result = Array.isArray(obj) ? [] as T : {} as T;
  if(Array.isArray(obj)) {
    for(let i = 0; i < obj.length; i++) {
      result[i as unknown as keyof T] = deepClone(obj[i]);
    }
  } else {
    for(let key in obj) {
      result[key] = deepClone(obj[key]);
    }
  }
  return result;
}
```

方法2：

```ts
export default function deepClone<T>(value: T): T {
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item)) as T;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, value]) => [key, deepClone(value)]),
  ) as T;
}

```

- `Object.fromEntries()` 静态方法将键值对列表转换为一个对象。

  ```ts
  const entries = new Map([
    ["foo", "bar"],
    ["baz", 42],

  ]);

  const obj = Object.fromEntries(entries);

  console.log(obj);
  // Expected output: Object { foo: "bar", baz: 42 }
  ```

## More

浏览器修改了 HTML 规范，以公开一个名为 structuredClone() 的函数，该函数会精确运行该算法，以便开发者轻松创建 JavaScript 值的深层副本。`const myDeepCopy = structuredClone(myOriginal);`

功能和限制结构化克隆解决了 `JSON.stringify()` 技术的许多（但不是全部）缺点。结构化克隆可以处理周期性数据结构，支持许多内置数据类型，通常更稳健且速度更快。

不过，它仍然存在一些可能会让您措手不及的限制：

- 原型：如果您将 structuredClone() 与类实例搭配使用，则会将普通对象作为返回值，因为结构化克隆会舍弃对象的原型链。
- 函数：如果您的对象包含函数，structuredClone() 将抛出 DataCloneError 异常。
- 不可克隆：某些值不是结构化可克隆的，最值得注意的是 Error 和 DOM 节点。这会导致 structuredClone() 抛出异常。

如果上述任何限制对您的用例来说都是致命的，Lodash 等库仍可提供其他深度克隆算法的自定义实现，这些实现可能或可能不适合您的用例。
