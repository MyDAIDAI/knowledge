# Promise.all

`Promise.all()` 静态方法接受一个 `Promise` 可迭代对象作为输入，并返回一个 `Promise`。当所有输入的 `Promise` 都被兑现时，返回的 `Promise` 也将被兑现（即使传入的是一个空的可迭代对象），并返回一个包含所有兑现值的数组。如果输入的任何 `Promise` 被拒绝，则返回的 `Promise` 将被拒绝，并带有第一个被拒绝的原因。

`Promise.all()`一般被用来处理多个并发的请求，会等待所有的请求都被完成才会执行后续方法

```ts
// Resolved example.
const p0 = Promise.resolve(3);
const p1 = 42;
const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('foo');
  }, 100);
});

await promiseAll([p0, p1, p2]); // [3, 42, 'foo']

// Rejection example.
const p0 = Promise.resolve(30);
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject('An error occurred!');
  }, 100);
});

try {
  await promiseAll([p0, p1]);
} catch (err) {
  console.log(err); // 'An error occurred!'
}
```

## Solution

主要需要解决以下几点：

- 外部会调用`then`或者`catch`等函数，所以需要返回一个`Promise`
- 当传入一个空数组时，直接返回一个`Promise.resolve`即可
- 返回的`Promise`需要包含传入数组的执行结果，并且顺序必须相同
- 如果有一个执行被`reject`了，那么`Promise.all`会立即执行`reject`函数，无需等待其他返回结果
- 需要处理输入的内容不为`promise`的情况

```ts
type ReturnValue<T> = { -readonly [P in keyof T]: Awaited<T[P]> }

export default function promiseAll<T extends readonly unknown[] | []>(
  iterable: T,
): Promise<{ -readonly [P in keyof T]: Awaited<T[P]> }> {
  return new Promise((resolve, reject) => {
    const results = new Array(iterable.length);
    let unresolved = iterable.length;

    if(unresolved === 0) {
      resolve(results as ReturnValue<T>);
    }

    iterable.forEach((item, index) => {
      Promise.resolve(item).then(data => {
        unresolved--;
        results[index] = data;
        if(unresolved === 0) {
          resolve(results as ReturnValue<T>);
        }
      }).catch((error) => {
        reject(error);
      })
    });
  });
}
```

## 类型签名解析

### TypeScript `promiseAll` 类型系统深度解析

这个函数签名实现了 TypeScript 的高级类型系统特性，提供了比原生 `Promise.all` 更精确的类型推断。让我们详细解析它的类型系统设计：

#### 函数签名分析

```typescript
function promiseAll<T extends readonly unknown[] | []>(
  iterable: T
): Promise<{ -readonly [P in keyof T]: Awaited<T[P]> }>
```

##### 1. 泛型约束 `T extends readonly unknown[] | []`

- **`readonly unknown[]`**：接受任何只读数组类型，包括：
  - 普通数组：`number[]`
  - 只读数组：`readonly number[]`
  - 元组：`[Promise<number>, string]`
  - 只读元组：`readonly [Promise<number>, string]`
- **`| []`**：专门处理空数组情况
- 使用 `readonly` 确保兼容 `as const` 断言创建的只读元组

##### 2. 返回类型 `Promise<{ -readonly [P in keyof T]: Awaited<T[P]> }>`

这是一个复杂但精妙的映射类型：

a. 映射类型 `[P in keyof T]`

- 遍历类型 `T` 的所有属性（数组索引）
- 对于元组 `[A, B]`，`P` 会是 `"0" | "1" | "length" | ...`
- **关键点**：TypeScript 会识别数字索引映射，自动创建对应的元组类型

b. `-readonly` 修饰符

- 移除只读属性
- 输入是只读元组时，输出变成可变元组：

  ```typescript
  const input = [Promise.resolve(1)] as const;  // readonly [Promise<number>]
  const result = await promiseAll(input);      // [number] (可变元组)
  ```

c. `Awaited<T[P]>` 类型

- TypeScript 4.5+ 引入的工具类型
- 递归解包 Promise 类型：

  ```typescript
  type Example1 = Awaited<Promise<string>>;      // string
  type Example2 = Awaited<Promise<Promise<number>>>; // number
  type Example3 = Awaited<number>;               // number (非Promise保持不变)
  ```

##### 3. 完整的类型转换过程

输入类型 `T` → 输出类型 `{ -readonly [P in keyof T]: Awaited<T[P]> }`

示例1：基本元组

```typescript
// 输入类型
T = [Promise<number>, Promise<string>]

// 输出类型
{
  "0": number,  // -readonly 移除了只读属性
  "1": string,
  length: 2      // 保持元组长度
}
// TypeScript 识别为: [number, string]
```

示例2：混合类型 + 只读元组

```typescript
// 输入类型
T = readonly [Promise<number>, string, Promise<Promise<boolean>>]

// 输出类型
{
  "0": number,
  "1": string,   // Awaited<string> = string
  "2": boolean,  // 递归解包
  length: 3
}
// 识别为: [number, string, boolean] (可变元组)
```

示例3：嵌套 Promise

```typescript
// 输入类型
T = [Promise<Promise<Promise<string>>>]

// 输出类型
{
  "0": string,  // 递归解包多层Promise
  length: 1
}
// 识别为: [string]
```

##### 4. 类型系统优势

1. **精确的元组类型保持**
   - 保持输入元组的长度和位置关系
   - 原生 `Promise.all` 返回 `Promise<any[]>` 会丢失类型信息

2. **自动解包嵌套 Promise**
   - 递归处理任意深度的 Promise 嵌套
   - 原生类型需要手动处理深层 Promise

3. **只读处理**
   - 正确处理 `as const` 创建的只读元组
   - 输出转换为可变元组，符合实际使用场景

4. **空数组特化**
   - 单独处理 `[]` 情况，确保返回 `Promise<[]>`

```typescript
iterable.forEach((item, index) => {
  Promise.resolve(item).then(data => {
    // 类型安全：
    // 1. `item` 是 T[number] 类型
    // 2. `data` 是 Awaited<T[number]> 类型
    results[index] = data;
  })
});

// 最终断言：
resolve(results as ReturnValue<T>);
```
