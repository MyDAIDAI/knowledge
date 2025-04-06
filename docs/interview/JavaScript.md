# `JavaScript`面试题

## `this`指向问题

### Prototypal Inheritance in JavaScript

**Prototypal inheritance** is a mechanism in JavaScript where objects inherit properties and methods from other objects via a **prototype chain**. Unlike classical inheritance (used in languages like Java), JavaScript uses a **prototype-based model** for object-oriented programming. Here's how it works:

---

### **1. Prototype Chain Basics**

- Every JavaScript object has a hidden `[[Prototype]]` property that points to another object (its **prototype**).
- When accessing a property/method (e.g., `obj.property`), JavaScript:
  1. Checks if the property exists on the object itself.
  2. If not found, looks up the prototype chain via `[[Prototype]]`.
  3. Continues until it finds the property or reaches `null` (end of the chain).

---

### **2. Constructors and Prototypes**

- **Constructor Functions**: Functions used to create objects (e.g., `new Array()`).

  - They have a `prototype` property, which becomes the `[[Prototype]]` of instances they create.

  ```javascript
  function Animal(name) {
    this.name = name;
  }
  Animal.prototype.eat = function () {
    console.log(`${this.name} eats.`);
  };

  const cat = new Animal("Fluffy");
  cat.eat(); // "Fluffy eats." (method inherited from prototype)
  ```

---

### **3. Inheritance Between Constructors**

To create a subclass (e.g., `Dog` inheriting from `Animal`):

1. **Link Prototypes**: Set the child constructor's prototype to an instance of the parent.
2. **Fix Constructor Reference**: Ensure the child prototype's `constructor` points to itself.

   ```javascript
   function Dog(name, breed) {
     Animal.call(this, name); // Inherit instance properties
     this.breed = breed;
   }

   // Link prototypes
   Dog.prototype = Object.create(Animal.prototype);
   Dog.prototype.constructor = Dog; // Fix constructor reference

   Dog.prototype.bark = function () {
     console.log(`${this.name} barks!`);
   };

   const dog = new Dog("Buddy", "Golden");
   dog.eat(); // "Buddy eats." (inherited from Animal)
   dog.bark(); // "Buddy barks!" (own method)
   ```

---

### **4. ES6 Classes (Syntactic Sugar)**

ES6 `class` simplifies prototypal inheritance:

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  eat() {
    console.log(`${this.name} eats.`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // Calls Animal's constructor
    this.breed = breed;
  }
  bark() {
    console.log(`${this.name} barks!`);
  }
}

const dog = new Dog("Buddy", "Golden");
dog.eat(); // "Buddy eats."
dog.bark(); // "Buddy barks!"
```

---

### **5. Object Creation and Prototypes**

- **Object Literals**: Inherit from `Object.prototype`.

  ```javascript
  const obj = {};
  console.log(obj.toString()); // "[object Object]" (inherited from Object.prototype)
  ```

- **Object.create()**: Create objects with a specific prototype.

  ```javascript
  const proto = {
    greet() {
      console.log("Hello!");
    },
  };
  const obj = Object.create(proto);
  obj.greet(); // "Hello!" (inherited from proto)
  ```

---

### **6. Key Methods and Properties**

- **`Object.getPrototypeOf(obj)`**: Returns the prototype of `obj`.
- **`obj.hasOwnProperty("prop")`**: Checks if `prop` is defined on `obj` itself (not the prototype).
- **`in` Operator**: Checks if `prop` exists anywhere in the prototype chain.

  ```javascript
  console.log(dog.hasOwnProperty("name")); // true
  console.log("eat" in dog); // true (inherited)
  ```

---

### **7. Considerations**

- **Performance**: Long prototype chains can slow down property lookups.
- **Mutability**: Changing a prototype affects all instances (use caution).
- **Composition over Inheritance**: Favor object composition (e.g., mixins) for complex hierarchies.

---

### **Summary**

- **Prototypal inheritance** uses a chain of objects (`[[Prototype]]`) to share properties/methods.
- **Constructors** and `class` syntax streamline inheritance.
- Use `Object.create()`, `Object.getPrototypeOf`, and `hasOwnProperty` to manage prototypes.

## the difference between undefined and null?

在 JavaScript 中，`null`、`undefined` 和 **未声明变量（undeclared）** 分别表示不同的概念，以下是它们的区别和示例：

---

### **1. `undefined`（未定义）**

- **定义**：变量已声明，但未被赋值。
- **常见场景**：
  - 变量声明后未初始化。
  - 函数未明确返回值。
  - 访问对象不存在的属性。
- **示例**：

  ```javascript
  let a; // 声明但未赋值
  console.log(a); // undefined

  function foo() {}
  console.log(foo()); // undefined

  const obj = {};
  console.log(obj.prop); // undefined
  ```

---

### **2. `null`（空值）**

- **定义**：**显式赋值**表示“无”或“空对象引用”。
- **常见场景**：
  - 开发者主动将变量标记为空。
  - 显式清空对象引用。
- **示例**：

  ```javascript
  let b = null; // 显式赋值为 null
  console.log(b); // null

  // 清空对象引用
  const data = fetchData();
  data = null; // 释放内存
  ```

---

### **3. 未声明变量（Undeclared）**

- **定义**：变量**未被声明**（未用 `var`、`let`、`const` 定义）。
- **行为**：
  - 在非严格模式下，赋值会隐式创建全局变量（不推荐）。
  - 直接访问未声明变量会抛出 `ReferenceError`。
- **示例**：

  ```javascript
  // 非严格模式下
  c = 10; // 隐式全局变量（不推荐！）
  console.log(c); // 10

  // 严格模式（'use strict'）下会报错
  ("use strict");
  d = 20; // ReferenceError: d is not defined
  ```

---

### **对比表格**

| 特性             | `undefined`                 | `null`                   | 未声明变量（Undeclared）       |
| ---------------- | --------------------------- | ------------------------ | ------------------------------ |
| **变量是否声明** | 已声明                      | 已声明                   | **未声明**                     |
| **值类型**       | `typeof` 返回 `"undefined"` | `typeof` 返回 `"object"` | 访问会抛出 `ReferenceError`    |
| **赋值行为**     | 默认值                      | 显式赋值                 | 隐式创建全局变量（非严格模式） |
| **用途**         | 表示“未初始化”              | 表示“空”或“无对象引用”   | 代码错误或未规范使用           |

---

### **如何检测？**

1. **检查 `undefined`**：

   ```javascript
   if (variable === undefined) { ... }
   ```

2. **检查 `null`**：

   ```javascript
   if (variable === null) { ... }
   ```

3. **检查变量是否未声明**：

   ```javascript
   if (typeof variable === "undefined") {
     // 变量未声明或值为 undefined
   }
   ```

---

### **总结**

- **`undefined`**：变量存在但未赋值（系统默认值）。
- **`null`**：开发者主动赋值的空值（语义化标记）。
- **未声明变量**：变量未声明，属于代码错误或不良实践。
- **安全实践**：始终用 `let`/`const` 声明变量，避免未声明变量；用 `null` 显式清空，用 `undefined` 表示默认未初始化状态。

## `Closure`闭包

**闭包（Closure）** 是 JavaScript 中的一个核心概念，指**函数能够访问并记住其词法作用域（Lexical Scope）**，即使该函数在其词法作用域之外执行。闭包允许函数“记住”并继续访问其定义时的上下文，从而实现数据封装、状态保持等功能。

---

### **闭包的核心机制**

1. **词法作用域（Lexical Scope）**  
   函数在定义时确定作用域链，而非运行时。内部函数（Inner Function）可以访问外部函数（Outer Function）的变量。

2. **持久化引用**  
   即使外部函数已执行完毕，只要内部函数仍被引用（如被返回、作为回调等），外部函数的作用域不会被销毁，形成闭包。

---

### **示例：闭包的基本结构**

```javascript
function outer() {
  let count = 0; // 外部函数的变量
  function inner() {
    count++; // 内部函数访问外部变量
    return count;
  }
  return inner; // 返回内部函数，形成闭包
}

const counter = outer();
console.log(counter()); // 1
console.log(counter()); // 2
```

- `inner` 函数在 `outer` 执行后仍能访问 `count`，因为闭包保留了 `count` 的引用。

---

### **闭包的核心用途**

#### 1. **数据封装与私有变量**

通过闭包模拟私有属性，避免全局污染：

```javascript
function createUser(name) {
  let privateName = name; // 私有变量，外部无法直接访问
  return {
    getName: () => privateName,
    setName: (newName) => {
      privateName = newName;
    },
  };
}

const user = createUser("Alice");
console.log(user.getName()); // "Alice"
user.setName("Bob");
console.log(user.getName()); // "Bob"
```

#### 2. **状态保持（State Preservation）**

在异步操作（如事件处理、定时器）中保留上下文：

```javascript
function delayMessage(message, delay) {
  setTimeout(() => {
    console.log(message); // 闭包捕获 message
  }, delay);
}

delayMessage("Hello after 2s", 2000);
```

#### 3. **模块化开发（Module Pattern）**

隔离作用域，暴露公共接口：

```javascript
const calculator = (function () {
  let result = 0; // 私有状态
  return {
    add: (x) => {
      result += x;
    },
    getResult: () => result,
  };
})();

calculator.add(5);
console.log(calculator.getResult()); // 5
```

#### 4. **函数工厂（Function Factory）**

动态生成功能相似的函数：

```javascript
function multiplier(factor) {
  return (x) => x * factor; // 闭包捕获 factor
}

const double = multiplier(2);
console.log(double(5)); // 10
```

---

### **闭包的注意事项**

1. **内存泄漏**  
   闭包可能导致外部函数的作用域无法释放，需在不再需要时解除引用：

   ```javascript
   let heavyObject = largeData;
   function process() {
     // 使用 heavyObject...
   }
   // 使用完毕后解除引用
   heavyObject = null;
   ```

2. **`this` 指向问题**  
   闭包中的 `this` 默认指向全局对象（非严格模式）或 `undefined`（严格模式），需通过闭包保存 `this` 或使用箭头函数：

   ```javascript
   const obj = {
     value: 10,
     getValue: function () {
       const self = this; // 保存 this
       return function () {
         console.log(self.value); // 10
       };
     },
   };
   ```

---

### **总结**

- **闭包**是函数与其词法作用域的结合，允许跨作用域访问数据。
- **适用场景**：封装私有变量、模块化开发、异步状态保持。
- **注意点**：内存管理、`this` 绑定、避免过度使用导致性能问题。

通过合理使用闭包，可以编写出更安全、模块化且高效的 JavaScript 代码。

## `object`和`array`怎么进行元素遍历？

在 JavaScript 中，遍历对象属性和数组项有多种方法，以下是常用的语法和场景：

---

### **数组遍历**

#### 1. **`for` 循环**

- 最基础的遍历方式，通过索引访问元素。
- **适用场景**：需要精确控制索引（如中断循环、跳过元素）。

  ```javascript
  const arr = [10, 20, 30];
  for (let i = 0; i < arr.length; i++) {
    console.log(arr[i]); // 10, 20, 30
  }
  ```

#### 2. **`for...of` 循环**

- ES6 语法，直接遍历数组元素。
- **适用场景**：无需索引的简单遍历。

  ```javascript
  for (const num of arr) {
    console.log(num); // 10, 20, 30
  }
  ```

#### 3. **`Array.prototype.forEach`**

- 高阶函数，为每个元素执行回调。
- **注意**：无法使用 `break` 或 `return` 中断循环。

  ```javascript
  arr.forEach((num, index) => {
    console.log(index, num); // 0 10, 1 20, 2 30
  });
  ```

#### 4. **`map` / `filter` / `reduce` 等高阶函数**

- 用于转换、筛选或聚合数组。

  ```javascript
  const doubled = arr.map((num) => num * 2); // [20, 40, 60]
  const evens = arr.filter((num) => num % 2 === 0); // [10, 20, 30]
  ```

---

### **对象遍历**

#### 1. **`for...in` 循环**

- 遍历对象的**可枚举属性**（包括原型链）。
- **注意**：需用 `hasOwnProperty` 过滤非自有属性。

  ```javascript
  const obj = { a: 1, b: 2 };
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      console.log(key, obj[key]); // a 1, b 2
    }
  }
  ```

#### 2. **`Object.keys()` / `Object.values()` / `Object.entries()`**

- 将对象属性转为数组后遍历。

  ```javascript
  Object.keys(obj).forEach((key) => {
    console.log(key, obj[key]); // a 1, b 2
  });

  Object.entries(obj).forEach(([key, value]) => {
    console.log(key, value); // a 1, b 2
  });
  ```

#### 3. **`Reflect.ownKeys()`**

- 获取对象所有自有属性（包括 Symbol 类型）。

  ```javascript
  const sym = Symbol("id");
  const obj = { [sym]: 100, c: 3 };
  Reflect.ownKeys(obj).forEach((key) => {
    console.log(key); // 'c', Symbol(id)
  });
  ```

---

### **对比与最佳实践**

| **方法**           | **适用类型** | **特点**                   |
| ------------------ | ------------ | -------------------------- |
| `for`              | 数组         | 灵活控制索引，可中断循环。 |
| `for...of`         | 数组         | 简洁，直接遍历元素。       |
| `forEach`          | 数组         | 函数式风格，无法中断。     |
| `for...in`         | 对象         | 遍历键名，需过滤原型属性。 |
| `Object.entries()` | 对象         | 同时获取键值对，兼容性好。 |

---

### **何时选择哪种方法？**

- **数组遍历优先**：`for...of` 或 `forEach`（简洁性优先）或 `for`（控制索引或性能敏感场景）。
- **对象遍历优先**：`Object.entries()` + `for...of`（现代语法）或 `for...in` + `hasOwnProperty`（兼容性）。

通过合理选择遍历方法，可以提升代码可读性和维护性。

## `Array`的哪些方法可以中断，哪些不能中断，要强制中断怎么做？

以下是 JavaScript 数组遍历方法的中断能力总结及强行中断方法：

---

### **可中断的遍历方法**

| 方法                    | 中断方式           | 示例                                                               |
| ----------------------- | ------------------ | ------------------------------------------------------------------ |
| **`for` 循环**          | `break` 语句       | `for (let i=0; i<arr.length; i++) { if (arr[i] === 3) break; }`    |
| **`for...of` 循环**     | `break` 语句       | `for (const num of arr) { if (num === 3) break; }`                 |
| **`Array.some()`**      | 回调返回 `true`    | `arr.some(num => { if (num === 3) return true; });`                |
| **`Array.every()`**     | 回调返回 `false`   | `arr.every(num => { if (num === 3) return false; return true; });` |
| **`Array.find()`**      | 找到元素后自动停止 | `arr.find(num => num === 3);`                                      |
| **`Array.findIndex()`** | 找到索引后自动停止 | `arr.findIndex(num => num === 3);`                                 |

---

### **不可中断的遍历方法**

| 方法                  | 原因                             |
| --------------------- | -------------------------------- |
| **`Array.forEach()`** | 设计为完整遍历，无内置中断机制。 |
| **`Array.map()`**     | 需转换所有元素生成新数组。       |
| **`Array.filter()`**  | 需检查所有元素是否符合条件。     |
| **`Array.reduce()`**  | 需遍历所有元素完成累积计算。     |

---

### **强行中断不可中断的方法**

虽然不推荐，但可通过 **抛出异常** 强行终止：

#### **示例：强行中断 `forEach`**

```javascript
try {
  const arr = [1, 2, 3, 4];
  arr.forEach((num) => {
    if (num === 3) throw new Error("BreakLoop");
    console.log(num); // 1, 2
  });
} catch (e) {
  if (e.message !== "BreakLoop") throw e; // 忽略中断异常
}
```

#### **示例：强行中断 `map`**

```javascript
try {
  const arr = [1, 2, 3, 4];
  const result = [];
  arr.map((num) => {
    if (num === 3) throw new Error("BreakLoop");
    result.push(num * 2);
  });
} catch (e) {
  console.log(result); // [2, 4]
}
```

---

### **推荐做法**

- **优先使用可中断方法**（如 `for`、`some`、`every`）。
- **避免异常中断**，因其破坏代码可读性且影响性能。
- **重构逻辑**：用 `filter` + `map` 替代强制中断的需求：

  ```javascript
  const arr = [1, 2, 3, 4];
  const result = arr
    .filter((num) => num < 3) // 过滤出 [1, 2]
    .map((num) => num * 2); // 转换为 [2, 4]
  ```

---

### **总结**

- **可中断方法**：`for`、`for...of`、`some`、`every`、`find`、`findIndex`。
- **不可中断方法**：`forEach`、`map`、`filter`、`reduce`。
- **强行中断**：通过异常抛出，但应谨慎使用。

## the difference on the usage of foo between funciton foo() {} and var foo = function () {}?

在 JavaScript 中，`function foo() {}` 和 `var foo = function() {}` 是两种不同的函数定义方式，它们在 **作用域提升（Hoisting）**、**函数命名** 和 **使用场景** 上有显著区别。以下是详细分析：

---

### **1. 函数声明（Function Declaration）: `function foo() {}`**

- **定义方式**：直接命名并定义函数。
- **提升（Hoisting）**：函数声明会被 **整体提升** 到作用域顶部，可以在声明前调用。

  ```javascript
  foo(); // 正常执行，输出 "Hello"
  function foo() {
    console.log("Hello");
  }
  ```

- **作用域**：函数声明的作用域是整个包围它的函数或全局作用域。
- **特性**：
  - 函数名 `foo` 不可变（不能被重新赋值）。
  - 在严格模式下，函数声明在块级作用域（如 `if`、`for`）中的行为可能不一致（ES5 中无效，ES6+ 中允许但存在差异）。

---

### **2. 函数表达式（Function Expression）: `var foo = function() {}`**

- **定义方式**：将匿名或具名函数赋值给变量。
- **提升（Hoisting）**：变量 `foo` 的声明会被提升，但 **赋值操作留在原地**。在赋值前调用会抛出错误。

  ```javascript
  foo(); // TypeError: foo is not a function
  var foo = function () {
    console.log("Hello");
  };
  ```

- **作用域**：遵循变量作用域规则（函数级作用域）。
- **特性**：

  - 可以动态赋值（例如根据条件赋值不同函数）。
  - 允许具名函数表达式（`var foo = function bar() {}`），此时 `bar` 仅在函数内部可见。
  - 函数名可重新赋值（因为 `foo` 是变量）：

    ```javascript
    var foo = function () {
      console.log("A");
    };
    foo = function () {
      console.log("B");
    }; // 重新赋值
    foo(); // 输出 "B"
    ```

---

### **对比表格**

| **特性**               | `function foo() {}`          | `var foo = function() {}`                |
| ---------------------- | ---------------------------- | ---------------------------------------- |
| **提升方式**           | 函数整体提升，可在声明前调用 | 变量声明提升，赋值不提升，声明前调用报错 |
| **作用域**             | 整个包围函数/全局作用域      | 遵循变量作用域规则（函数级作用域）       |
| **是否可重新赋值**     | 否（函数名固定）             | 是（变量值可重新赋值）                   |
| **适用场景**           | 通用函数定义                 | 动态赋值、回调函数、条件定义             |
| **具名函数内部可见性** | 函数名全局可见               | 具名函数名仅在函数内部可见（如 `bar`）   |

---

### **使用场景示例**

#### **函数声明（推荐）**

- 定义工具函数或模块的核心逻辑。

  ```javascript
  function calculateSum(a, b) {
    return a + b;
  }
  ```

#### **函数表达式（灵活）**

- 动态赋值或条件逻辑：

  ```javascript
  let operation;
  if (useAddition) {
    operation = function (a, b) {
      return a + b;
    };
  } else {
    operation = function (a, b) {
      return a - b;
    };
  }
  ```

- 作为回调函数：

  ```javascript
  button.addEventListener("click", function () {
    console.log("Clicked!");
  });
  ```

---

### **ES6+ 补充**

- **箭头函数表达式**：更简洁的函数表达式语法。

  ```javascript
  const foo = () => console.log("Hello");
  ```

- **块级作用域声明（`let`/`const`）**：避免变量提升问题。

  ```javascript
  // 使用 let/const 声明函数表达式
  const foo = function () {};
  ```

---

### **总结**

- **优先使用函数声明**：当需要提升或定义明确的命名函数时。
- **选择函数表达式**：需要动态赋值、条件定义或作为回调时。
- **注意作用域和提升规则**：避免因提升导致的逻辑错误。

## Explian `Function.prototype.bind`函数

`Function.prototype.bind` 是 JavaScript 中的一个重要方法，用于**显式绑定函数的执行上下文（`this`）** 和 **预设参数**，返回一个新的函数。其核心作用是确保函数在调用时，`this` 始终指向指定的对象，无论调用方式如何变化。以下是其详细说明及用法：

---

### **1. 核心功能**

- **绑定 `this`**：强制函数中的 `this` 指向指定的对象。
- **预设参数**：提前固定部分参数，生成一个部分应用函数（Partial Application）。
- **返回新函数**：原函数不受影响，`bind` 返回一个绑定了上下文和参数的新函数。

---

### **语法**

```javascript
const boundFunc = originalFunc.bind(thisArg, arg1, arg2, ...);
```

- **`thisArg`**：绑定到函数的 `this` 值。
- **`arg1, arg2, ...`**：可选参数，预设给新函数的参数。

---

### **使用场景**

#### **场景 1：绑定 `this` 解决上下文丢失**

当方法被单独调用时，`this` 可能指向全局对象或 `undefined`，`bind` 可固定 `this`：

```javascript
const user = {
  name: "Alice",
  greet() {
    console.log(`Hello, ${this.name}`);
  },
};

const greetFunc = user.greet;
greetFunc(); // 错误：this.name 为 undefined

const boundGreet = user.greet.bind(user);
boundGreet(); // 正确：输出 "Hello, Alice"
```

#### **场景 2：事件监听器绑定 `this`**

在事件处理中，确保回调函数的 `this` 指向组件实例：

```javascript
class Button {
  constructor() {
    this.text = "Click me";
    this.handleClick = this.handleClick.bind(this); // 绑定 this
  }

  handleClick() {
    console.log(this.text); // 正确指向 Button 实例
  }
}

const button = new Button();
document.querySelector("button").addEventListener("click", button.handleClick);
```

#### **场景 3：预设参数（Partial Application）**

提前固定部分参数，生成新函数：

```javascript
function multiply(a, b) {
  return a * b;
}

const double = multiply.bind(null, 2); // 预设 a = 2
console.log(double(3)); // 2 * 3 = 6
```

---

### **注意事项**

1. **无法二次 `bind`**：  
   多次调用 `bind` 时，只有第一次绑定的 `this` 生效：

   ```javascript
   function foo() {}
   const bound1 = foo.bind({ a: 1 });
   const bound2 = bound1.bind({ a: 2 });
   bound2(); // this 仍指向 { a: 1 }
   ```

2. **构造函数行为**：  
   若 `bind` 后的函数通过 `new` 调用，原绑定的 `this` 会被忽略（构造函数会创建新对象）：

   ```javascript
   function Person(name) {
     this.name = name;
   }
   const BoundPerson = Person.bind({ id: 1 });
   const p = new BoundPerson("Alice");
   console.log(p); // Person { name: "Alice" }, 而非 { id: 1 }
   ```

3. **箭头函数不可绑定 `this`**：  
   箭头函数的 `this` 由词法作用域决定，`bind` 无效：

   ```javascript
   const foo = () => console.log(this);
   const bound = foo.bind({ a: 1 });
   bound(); // 输出外层 this（如 window）
   ```

---

### **与 `call`/`apply` 的区别**

| **方法** | 执行时机 | 返回值       | 参数传递方式         |
| -------- | -------- | ------------ | -------------------- |
| `bind`   | 延迟执行 | 新函数       | 参数列表或预设参数   |
| `call`   | 立即执行 | 函数执行结果 | 参数列表（逐个传递） |
| `apply`  | 立即执行 | 函数执行结果 | 参数数组             |

---

### **总结**

- **用途**：解决 `this` 指向问题、预设参数、适配函数调用形式。
- **优势**：灵活控制上下文，避免因调用方式导致的 `this` 丢失。
- **替代方案**：箭头函数（自动绑定外层 `this`）或 Class 属性（如 `handleClick = () => {}`）。

通过合理使用 `bind`，可以更安全地管理函数执行上下文，提升代码的可维护性。
