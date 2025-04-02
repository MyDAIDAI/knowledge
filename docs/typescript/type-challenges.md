# 类型体操

## 关键字含义

### `keyof`索引查询

对任何类型`T`，`keyof T`的结果为该类型上所有**公有属性**`key`的联合

```ts
interface Eg1 {
  name: string;
  key: string;
}
// "name" | "key"
type e = keyof Eg1;

class Eg2 {
  private name: string;
  public readonly age: number;
  protected home: string;
}
// T2实则被约束为 age，必须为公有属性
// 而name和home不是公有属性，所以不能被keyof获取到
type T2 = keyof Eg2;
```

### `T[K]`索引访问

使用`T[K]`可以像对象访问属性那样，获取到对应的类型，如果使用的是`T[keyof T]`的方式，可以获取到`T`的所有`key`的类型组成的联合类型

注意：如果[]中的 key 有不存在 T 中的，则是 any；因为 ts 也不知道该 key 最终是什么类型，所以是 any；且也会报错；

```ts
interface Eg1 {
  name: string;
  readonly age: number;
}

// string
type v1 = Eg1["name"];

// number
type v2 = Eg1["age"];

//  string | number
type v3 = Eg1[keyof Eg1];

// any，name1不存在于Eg1中，所以返回结果为 any
type v4 = Eg1["name" | "name1"];
```

### `&`交叉类型

交叉类型的取多个类型的交集，但是如果`key`相同，但是类型不同，则该`key`为`never`

```ts
interface Eg1 {
  name: string;
  age: number;
}

interface Eg2 {
  color: string;
  age: string;
}

type T = Eg1 & Eg2;

const val: T = {
  name: "",
  color: "",
  age: (function a() {
    throw Error();
  })(),
};
```

### `extends`关键词

- 用于接口，表示继承

```ts
interface T1 {
  name: string;
}

interface T2 {
  sex: number;
}

// {name: string, sex: number, age: number}
interface T3 extends T1, T2 {
  age: number;
}
```

注意 📢：接口支持多重继承，语法为逗号隔开，如果是`type`实现，则可以使用交叉类型来实现继承 `type A = B & C & D`

- 用于条件判断，表示条件类型

表示条件判断，如果前面的条件满足，则返回问号后的第一个参数，否则，返回第二个

```ts
/**
 * @example
 * type A1 = 1
 */
type A1 = "x" extends "x" ? 1 : 2;

/**
 * @example
 * type A2 = 2
 */
type A2 = "x" | "y" extends "x" ? 1 : 2;

/**
 * @example
 * type A3 = 1 | 2
 */
type P<T> = T extends "x" ? 1 : 2;
type A3 = P<"x" | "y">;
```

注意 📢：上面的 A2 的值与 A3 的值不一样，是为什么呢？

- 简单的使用联合类型来进行判断，则直接判断前面的类型是否可分配给后面的类型
- 如果`extends`前面的类型为泛型`T`，且泛型传入的是一个联合类型，则会依次判断该联合类型的所有子类型是否可分配给`extends`后面的类型，是一个建立分发的过程
- 如果不想被分发，则可以使用元组类型进行包裹 `type P<T> = [T] extends ['x'] ? 1 : 2`

### `infer`关键词

`infer`关键词主要是用于`extends`的条件类型中，让`ts`进行类型推导

## 内置类型工具原理解析

### `Partial`原理

`Partial<T>`将`T`的所有属性变为可选的

```ts
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};
```

- `[P in keyof T]`: 通过`in`映射类型，遍历`T`上的所有属性
- `?`：将属性设置为可选
- `T[P]`：获取`T[P]`的类型，将其设置为原来的类型

### `PartialOptional`原理

将指定的`key`转换为可选类型

```ts
type MyPartialOptional<T, K extends keyof T> = {
  [P in K]?: T[P];
};
```

- 使用`K extends keyof T`来约束`T`必须为`keyof T`的子类型

### `Readonly`原理解析

将所有的`key`转换为只读属性

```ts
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

### `ReadonlyOptional`原理解析

将指定的`key`转换为只读属性

```ts
type MyReadonlyOptional<T, K extends keyof T> = {
  readonly [P in K]: T[P];
};

interface Eg1 {
  name: string;
  age: number;
}

// { readonly name: string; }
type eg1 = MyReadonlyOptional<Eg1, "name">;
```

### `Pick`

`Pick`挑选一组 属性并组成一个新的属性

```ts
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};
// { age: number; }
type eg2 = MyPick<Eg1, "age">;
```

### `Record`

`Record`的`key`为联合类型的每个子类型，其类型值为第二个参数

```ts
// type Eg3 = { a: { key1: string; }; b: { key1: string; }; }
type Eg3 = Record<"a" | "b", { key1: string }>;
```

实现如下：

```ts
type MyRecord<K extends keyof any, T> = {
  [P in K]: T;
};

//  { a: { key1: string; }; b: { key1: string; }; }
type Eg4 = MyRecord<"a" | "b", { key1: string }>;

// string | number | symbol
type eg5 = keyof any;
```

注意 📢：对`any`使用`keyof any`，可以得到`string | number | symbol`，因为在`js`中，对象的键可以是字符串、数字或者是符号`symbol`，`keyof any`表达的是，任意类型的键

### `Exclude`原理解析

`Exclude<T, U>`提取出存在于`T`，但是不存在于`U`的类型组成的联合类型

```ts
type MyExclude<T, U> = T extends U ? never : T;
// type Eg6 = "key2"
type Eg6 = MyExclude<"key1" | "key2", "key1">;
```

- 使用`extends`关键词来对传入泛型`T`的进行类型约束，如果约束于`U`，则返回`never`
- `never`表示一个不存在的类型，`never`与其他类型联合后，没有`never`类型

### `Extract`

`Extract<T, U>`提取联合类型`T`和联合类型`U`的所有交集

```ts
type MyExtract<T, U> = T extends U ? T : never;
```

### `Omit`

`Omit<T, K>`从类型`T`中去除`K`中的所有属性

```ts
type MyOmit<T, K> = Pick<T, MyExclude<keyof T, K>>;
```

### `Parameters`

`Parameters`获取函数的参数类型，将每个参数类型放在一个元组中

```ts
type MyParameters<T extends Function> = T extends (...args: infer P) => void
  ? P
  : never;

type eg6 = MyParameters<(name: string, age: number) => void>;
```

- 首先约束`T`必须是一个`Function`类型
- 使用`infer`关键字让`ts`实现推导，如果被`extends`约束，则返回推导类型`P`，否则返回`never`
- `infer`关键字只能在`extends`条件上使用

扩展: 使用`infer`实现一个推导数组中所有元素的类型

```ts
type FlattenArray<T extends Array<any>> = T extends Array<infer P> ? P : never;
```

### `ReturnType`

`ReturnType`获取函数的返回值类型

```ts
type MyReturnType<T extends Function> = T extends (...args: any) => infer R
  ? R
  : never;
// string
type eg7 = MyReturnType<() => string>;
```

## 第三部分 自定义高级类型工具

参考：

- [Ts 高手篇：22 个示例深入讲解 Ts 最晦涩难懂的高级类型工具](https://juejin.cn/post/6994102811218673700?utm_source=gold_browser_extension#heading-14)
