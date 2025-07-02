# Function.prototype.call

实现一个函数原型上的`call`的方法

## Example

```ts
function multiplyAge(multiplier = 1) {
  return this.age * multiplier;
}

const mary = {
  age: 21,
};

const john = {
  age: 42,
};

multiplyAge.myCall(mary); // 21
multiplyAge.myCall(john, 2); // 84

```

## Solution

```ts
interface Function {
  myCall(this: Function, thisArg: any, ...argArray: any[]): any;
}

Function.prototype.myCall = function (thisArg, ...argArray) {
  const fn = this;
  let result = fn.call(thisArg, ...argArray);
  return result;
};
```
