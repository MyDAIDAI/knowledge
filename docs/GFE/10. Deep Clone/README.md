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
