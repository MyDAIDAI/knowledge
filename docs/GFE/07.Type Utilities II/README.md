# Type Utilities II

实现一个工具函数，检测下面几种数据类型

- `isArray(value)`: 值为数组，返回`true`，否则返回`false`
- `isFunction(value)`: 值为`Function`，返回`true`，否则返回`false`
- `isObject(value)`: 当值为`Object (e.g. arrays, functions, objects, etc, but not including null and undefined)`时 , 返回`true`，否则返回`false`
- `isPlainObject(value)`: 当值是一个普通对象时，返回`true`，否则返回`false`
  - 普通对象定义：使用字面量法创建`const a = {}`，或者使用`Object.create(null)`创建的，不继承任何其他对象

## Solution

```ts
export function isArray(value: unknown): boolean {
  return Array.isArray(value);
}

// Alternative to isArray.
export function isArrayAlt(value: unknown): boolean {
  // For null and undefined.
  if (value == null) {
    return false;
  }

  return value.constructor === Array;
}

export function isFunction(value: unknown): boolean {
  return typeof value === 'function';
}

export function isObject(value: unknown): boolean {
  // For null and undefined.
  if (value == null) {
    return false;
  }

  const type = typeof value;
  return type === 'object' || type === 'function';
}

export function isPlainObject(value: unknown): boolean {
  // For null and undefined.
  if (value == null) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}

// Alternative to isPlainObject, Lodash's implementation.
export function isPlainObjectAlternative(value: unknown): boolean {
  if (!isObject(value)) {
    return false;
  }

  // For objects created via Object.create(null);
  if (Object.getPrototypeOf(value) === null) {
    return true;
  }

  let proto = value;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(value) === proto;
}

```
