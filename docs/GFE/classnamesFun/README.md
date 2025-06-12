# Classnames

`classnames`是一个很常用的工具函数在现代前端框架中，比如`react`等等，现在需要实现该函数，完成以下功能：

```ts
classNames('foo', 'bar'); // 'foo bar'
classNames('foo', { bar: true }); // 'foo bar'
classNames({ 'foo-bar': true }); // 'foo-bar'
classNames({ 'foo-bar': false }); // ''
classNames({ foo: true }, { bar: true }); // 'foo bar'
classNames({ foo: true, bar: true }); // 'foo bar'
classNames({ foo: true, bar: false, qux: true }); // 'foo qux'
```

同时需要支持多种规则以及扁平数组

```ts
classNames('a', ['b', { c: true, d: false }]); // 'a b c'
classNames(
  'foo',
  {
    bar: true,
    duck: false,
  },
  'baz',
  { quux: true },
); // 'foo bar baz quux'
```

错值需要被忽略

```ts
classNames(null, false, 'bar', undefined, { baz: null }, ''); // 'bar'
```

除此之外，返回值不能有多余的空格等符号

## `Clarifition`

需要与面试官确认复杂场景情况，比如多个重复的`key`是否需要处理，如`classNames('foo', { foo: false })`，现在不处理这种情况

## `Solution`

根据上面的调用方式，可以看出来，可以传入数组，数组内可以为对象数据类型，对象数据类型的仍然可以添加类型，可以得出，需要进行递归操作，可以将其进行功能拆分

- 处理数据类型
- 判断类型是否为数组，如果为数组，则进行递归

```ts
export type ClassValue =
  | ClassArray
  | ClassDictionary
  | string
  | number
  | null
  | boolean
  | undefined;
export type ClassDictionary = Record<string, any>;
export type ClassArray = Array<ClassValue>;



function traverseItem(item, classes) {
  if(!item) {
    return;
  }
  if(typeof item === 'string' || typeof item === 'number') {
    classes.push(item);
    return;
  }
  if(Array.isArray(item) && item.length > 0) {
    for(let i = 0; i < item.length; i++) {
      if(!item[i]) return;
      traverseItem(item[i], classes)
    }
  } else {
    const keys = Object.keys(item);
    for(let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if(!item[key] || !Object.prototype.hasOwnProperty.call(item, key)) return
      classes.push(key)
    }
  }
}



export default function classNames(...args: Array<ClassValue>): string {
  if(args.length === 0) {
    return ''
  }
  const classes: Array<string> = [];
  traverseItem(args, classes)
  return classes.join(' ')
}
```

理解了实现思路之后，就开始夸夸写代码，以为可以直接`bugfree`，执行测试用例，出现错误，很懵逼的开始进行调试，暴露了自己对代码执行理解的不深刻的问题

```ts
// Expected: "foo qux"
// Received: "foo"
expect(classNames({ foo: true, bar: false, qux: true })).toEqual('foo qux');
// Expected: "bar 1"
// Received: ""
expect(classNames(null, false, 'bar', undefined, 0, 1, { baz: null }, '')).toEqual('bar 1');
```

调试发现，代码在执行到`if(!item[i]) return;`时，判断`item[i]`的值为`false`，则直接进行了`return`，`for`后面的遍历没有继续进行，所以在只要前面有假值，则后面的数据都没有被正确执行

修改上面代码`return`为`continue`即可：

```ts
function traverseItem(item, classes) {
  if(!item) {
    return;
  }
  if(typeof item === 'string' || typeof item === 'number') {
    classes.push(item);
    return;
  }
  if(Array.isArray(item) && item.length > 0) {
    for(let i = 0; i < item.length; i++) {
      if(!item[i]) {
        continue;
      };
      traverseItem(item[i], classes)
    }
  } else {
    const keys = Object.keys(item);
    for(let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if(!item[key] || !Object.prototype.hasOwnProperty.call(item, key)) {
        continue;
      }
      classes.push(key)
    }
  }
}
```

## 特殊情况

当传入多个相同的类名时，是否需要进行去重处理，如果相同类名的值不同，应该怎么处理呢，这种可以根据情况去询问面试官是否需要进行特殊处理，如果不需要的话，在返回结果时直接进行去重即可

## 总结

- `typeof []` 为会返回`object`，需要对其`[]`以及`{}`进行分开判断处理，或者将对数组的处理放在对象之前
- 注意📢边界情况：
  - 栈溢出：在递归调用函数时，容易发生栈溢出，所以在写递归函数时，需要注意终止条件
  - 循环引用：数组或是对象类型的数据，可能会发生循环引用

## 开源实现方案

- [classnames](https://github.com/JedWatson/classnames/blob/main/index.js)
- [clsx](https://github.com/lukeed/clsx/blob/master/src/index.js)
