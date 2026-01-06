# Build your own React

我们要从下面几个步骤来创建一个`React`

- 第一步：`createElement`函数
- 第二步：`render`函数
- 第三步：`concurrent`模式
- 第四步：`Fiber`
- 第五步：渲染`Render`以及`Commit`阶段
- 第六步：函数组件
- 第七步：`Hooks`

## 第 0 步：回顾

```jsx
// 定义 react 中的元素 element
const element = <h1 title="foo">Hello</h1>;
// 定义挂载容器
const container = document.getElementById("root");
// 将元素渲染进入挂载容器中
ReactDOM.render(element, container);
```

上面三行是在我们使用`react`时必要的代码

在上面的第一步中，定义`react`中的元素`element`，其中`<h1>`并不是一个合法的`JavaScript`，所以我们需要使用合法的`JS`来代替它

`JSX`通过像`Babel`类的构建工具，将其转换为`JS`，转换规则也是简单的：使用`createElement`代替，传递进入`tag`名称以及相应地`props`和`children`作为参数，如下：

```js
const element = <h1 title="foo">hello</h1>;

// 转换为
const element = React.createElement(
  "h1",
  {
    title: "foo",
  },
  "hello"
);
```

`createElement`所做的就是，一些基本的校验，以及从传入的参数中创建一个对象。如，上面的`element`为下面的对象

```js
const element = {
  type: "h1",
  props: {
    title: "foo",
    children: "hello",
  },
};
```

`element`是一个有两个对象的属性，`type`以及`props`（其实还有更多，但是现在只需要关心这两个即可。）

- `type`是一个字符串，用来指定我们想创建的`DOM`节点的类型，它是当要使用`document.createElement`创建`DOM`时传递给这个函数的`tagName`。该字段也可以是一个函数。当我们使用函数组件时，这个`type`类型也就为一个函数。

- `props`是另一个对象。它包含了`JSX`中的所有的`keys`以及`values`，也包含其中的`children`。

- `children`：在当前的例子中是一个字符串，但是常见情况下，是一个数组

> 除了上面的`JSX`，另一方面我们需要替换为我们自己的函数的为`render`

`render`函数是`React`用来改变`DOM`的地方，因此我们可以使用我们自己的方式来进行更新。使用`DOM`操作`API`来向页面中插入即可

```javaScript
const node = document.createElement(element.type);
node["title"] = element.props.title;
const text = document.createTextNode("");
text.nodeValue = element.props.children;
node.appendChild(text);
container.appendChild(node);
```

所以上面实现了将`JSX`转换为`JS`，并将其根据`type`类型生成对应`DOM`节点，并插入到页面中的过程。

## 第一步：`createElement`函数

在上面中可以看到，需要使用`createElement`函数，生成一个`React`中的`element`

```js
const element = React.createElement(
  "div",
  { id: "foo" },
  React.createElement("a", null, "bar"),
  React.createElement("b")
);
```

其`createElement`函数主要是创建了一个`element`对象，用来对相应的`DOM`节点进行描述，主要有`type`以及`props`属性。所以我们可以根据这个进行`createElement`的编写

比如：`createElement("div")`返回：

```js
{
  "type": "div",
  "props": { "children": [] }
}
```

`createElement("div", null, a)`返回：

```js
{
  "type": "div",
  "props": { "children": [a] }
}
```

`createElement("div", null, a, b)`返回：

```js
{
  "type": "div",
  "props": { "children": [a, b] }
}
```

传入`children`中的数组的值类型，即可以是一个字符串，数字，也可以是一个`element`对象，如

```js
{
  "type": "div",
  "props": {
    "children": [
      {
        "type": "div",
        "props": { "children": [a, b] }
      },
      b
    ]
  }
}
```

如果值的类型为字符串以及数字，那么会创建一个`TEXT_ELEMENT`类型来指定其为文本类型节点（注意 📢： `React`源码中没有对原始值以及数组为空的情况进行处理，但是我们为了简化我们的代码，做了该处理。）

```js
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children,
    },
  };
}
```

添加`TEXT_ELEMENT`类型节点的处理逻辑：

```js
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: { nodeValue: text, children: [] },
  };
}
```

为了与`React`代码进行区分，将我们其命名为：`Deact`，如下：

```js
const Deact = {
  createElement,
  createTextElement,
};
```

## 第二步：`render`函数

现在，我们来创建`render`函数

```js
function render(element, container) {
  const dom = document.createElement(element.type);
  // 遍历 element.props 中的属性，并将其添加到 node 中
  Object.keys(element.props).forEach((key) => {
    dom[key] = element.props[key];
  });
  // 遍历 element.props.children 中的元素，并将其添加到 node 中
  element.props.children.forEach((child) => {
    render(child, dom);
  });
  container.appendChild(dom);
}
```

需要对文本类型节点做特殊处理:

```js
function render(element, container) {
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);
  // 遍历 element.props 中的属性，并将其添加到 node 中
  Object.keys(element.props).forEach((key) => {
    if (key !== "children") {
      dom[key] = element.props[key];
    }
  });
  // 遍历 element.props.children 中的元素，并将其添加到 node 中
  element.props.children.forEach((child) => {
    render(child, dom);
  });
  container.appendChild(dom);
}
```

## 第三步：`Concurrent`模式

上面的递归调用有一个问题。

一旦我们开始渲染，直到我们渲染完成整个`DOM`树，这个渲染过程不会停止。如果这个树非常大，那么会阻塞主线程很长时间。**如果浏览器有一些如处理用户输入或者动画类的高优先级任务，则必须要等待整个渲染完成才能执行。**这是非常不友好的，会给用户造成非常不好的体验。

我们为了解决这个问题，需要做下面 👇🏻 几件事：

1. 将`render`中不能中断的渲染大任务，拆解为可以中断的小任务
2. 确定当前浏览器是否有空余时间
3. 需要有一个机制，在有空余时间时，可以进行循环执行，直到任务执行完成
4. 需要一个全局变量，保存下一次需要执行的任务。可以将任务接着执行

### 实现循环机制

```js
// 将大任务拆分为小任务的循环执行机制
let nextUnitOfWork = null; // 全局变量，保存接下来需要执行的任务
function workLoop(deadline) {
  let shouldYield = false; // 判断浏览器是否有剩余时间
  while (nextUnitOfWork && !shouldYield) {
    // 在一个requestIdleCallback中，有后续任务并且浏览器有剩余时间，则继续执行
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    // 执行完一个任务后，判断是否有空余时间，如果没空余时间，则停止循环，将当前变量存储在nextUnitWork中
    shouldYield = deadline.timeRemaining() < 1;
  }
  // 继续监听下一个浏览器空余时间
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);
```

可以使用`requestIdleCallback`来创建一个`loop`循环，可以将`requestIdleCallback`作为一个`setTimeout`。

浏览器在空闲时会调用传入`requestIdleCallback`的回调函数，并向其中传入`deadline`变量，该变量可以获取实时的剩余时间。

`React`内部不在使用`requestIdleCallback`，而是使用`scheduler`调度器。但是在这个例子中，我们的核心不在调度部分，所以仍然使它。

`requestIdleCallback`会传入回调函数一个`deadline`参数，我们可以使用这个参数来判断到浏览器再次控制还剩余多少时间

## 第四步：Fibers

为了组织工作单元，我们需要一种数据结构（**可以保存当前执行的上下文以及可以随时进行中断**）：`fiber`树

我们将针对每一个`element`都有一个对应的`fiber`，每一个`fiber`将成为一个工作单元

如果我们想渲染下面的`element`树

```ts
Deact.render(
  <div>
    <h1>
      <p></p>
      <a></a>
    </h1>
    <h2></h2>
  </div>,
  container
);
```

在`render`中，我们将创建根`RootFiber`以及将其设置为`nextUnitOfWork`。其他的工作将在`performUnitWork`函数中发生，我们针对每一个`fiber`节点将会做下面三件事：

1. 增加一个插入到`DOM`的元素`element`
2. 为`element`的子孙创建`fiber`
3. 选择下一个工作单元

![alt text](image.png)

这种数据结构的一个目的就是**更加容易的发现下一个工作单元**，那就是为什么每一个`fiber`都有一个链接指向它的第一个子元素，它的下一个兄弟元素以及它的父级元素

当完成一个`fiber`的工作，如果它存在子节点，那么这个子节点的`fiber`将成为下一个工作单元

在我们上图的例子中，当我们完成`div`的`fiber`的工作，那么下一个工作单元就是`h1`的`fiberNode`

如果这个`fiberNode`没有子节点，那么会使用`sibling`的`fiberNoode`作为下一个工作单元

在我们上图的例子中，`p`的`fiberNode`执行完成后，没有`child`的`fiberNode`，那么将返回`a`的`fiberNode`作为下一个工作单元

如果一个`fiberNode`既没有`child`的`fiberNode`，也没有`sibling`的`fiberNode`，那就就会去寻找`uncle`叔叔节点的`fiberNode`，也就是`sibling`的`parent`节点

如上图中的`a`以及`h2`节点

如果`parent`的`fiberNode`没有`sibling`节点，那么会继续向上查找`parent`的`fiberNode`直到发现一个`sibling`节点，或者直到到达顶层的`root`节点。如果到达`root`节点，那么意味着我们已经完成了这次`perform`渲染的所有工作

让我们根据上面的思想来进行代码改造：

将`render`中与创建`DOM`相关的代码单独封装为一个函数，如下：

```js
function createDom(fiber) {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);
  const isProperty = (key) => key !== "children";
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });
  return dom;
}
```

在`render`函数中，我们将设置`nextUnitOfWork`为`fiber`树的根节点

```js
function render(element, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  };
}
```

然后，当浏览器准备好时，它将会调用`workLoop`函数，然后将从`root`节点开始工作.

下面，我们需要来完`performUnitOfWork`函数，首先，我们创建一个新的`node`，并将其插入到`DOM`中。我们通过`fiber.dom`属性去会追踪其`DOM`的`node`节点

```js
function performUnitOfWork(fiber) {
  // create new node and append it to the DOM
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }
}
```

然后，对于每一个`child`，我们将会创建其对应的`fiber`节点，然后将其`fiber`对应的`child`以及`sibling`指向对应的`fiberNode`节点

```js
function performUnitOfWork(fiber) {
  // ...add dom node
  // create new fibers
  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;
  while (index < elements.length) {
    const element = elements[index];
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };
    // child指向第一个子节点
    if (index === 0) {
      fiber.child = newFiber;
      newFiber.parent = fiber;
    } else {
      // 循环建立sibling连接
      prevSibling.sibling = newFiber;
      newFiber.parent = fiber;
    }
    prevSibling = newFiber;
    index++;
  }
}
```

最后，我们需要返回数据以供下一个工作单元使用，按照上面 👆🏻 的过程，我们首先返回`child`，然后是`sibling`，最后是`uncle`等等

```js
function performUnitOfWork(fiber) {
  // ...add dom node
  // ...create new fibers

  // 如果有子节点，则直接返回
  if (fiber.child) {
    return fiber.child;
  }
  // 查找sibling节点，如果存在则返回，否则返回parent的sibling节点
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
  return null;
}
```

## 第五步：`Render`和`Commit`阶段

上面的代码实现了生成`fiber`以及根据`fiber`生成对应的`DOM`，并将其插入到页面中。但是这样也会造成其他的问题。

我们每次对一个`fiber`进行`perform`的时候，都会创建一个新的`DOM`，并将其插入到`DOM`中。并且由于我们的执行过程可以被浏览器的高优先级任务中断，在这种情况下，用户会看到没有渲染完成的`UI`。这是非常不友好的。

根据我们上面的代码，我们需要将其挂载插入`DOM`的部分移除

除此之外，还需要追踪`fiber`树的跟节点，我们将其称为`workInProgress`或者`wipRoot`

```js
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  };
  nextUnitOfWork = wipRoot;
}

// 全局变量，保存接下来需要执行的任务
let nextUnitOfWork = null;
let wipRoot = null;
```

当执行完所有的`perform`后，再将整个`fiber`树一起提交到`DOM`中，修改为如下代码：

```js
function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  // 当nextUnitOfWork的值为Null的时候，代表已经完成了整个fiber树的perform过程
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}
```

在`commitRoot`中，使用`wipRoot`节点，该变量保存着对整个的`fiber`树的引用，递归调用将所有的节点从顶部深度优先遍历将整个树挂载在进入页面中

```js
function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

function commitRoot() {
  commtWork(wipRoot.child);
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  const domParent = fiber.parent.dom;
  domParent.appendChild(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
```

## 第六步：`Reconciliation`

到现在为止，我们只是添加内容到`DOM`中（因为只有第一次的挂载），但是如果需要更新或者删除节点呢

那就是我们后面要做的事，我们需要去比较`render`函数内接收到的`element`元素，与我们最近一次提交到`DOM`上的元素

因此我们需要在完成`commit`之后保存一个“最近提交的 fiber 树”的引用，将其称为`currentRoot`

```js
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  nextUnitOfWork = wipRoot;
}
```

现在我们抽取`performUnitOfWork`中关于创建`new fiber`的相关代码到单独的函数中

```js
function performUnitOfWork(fiber) {
  // other code...
  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);
  // other code...
}

function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let prevSibling = null;
  while (index < elements.length) {
    const element = elements[index];
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: wipFiber,
      dom: null,
    };
    if (index === 0) {
      wipFiber.child = newFiber;
      newFiber.parent = wipFiber;
    } else {
      prevSibling.sibling = newFiber;
      newFiber.parent = wipFiber;
    }
    prevSibling = newFiber;
    index++;
  }
}
```

在这个函数中，我们将会用老的`fiber`与新的元素进行`reconcile`

获取当前正在创建的`fiber`元素的`alternate`中的子元素（也就是最近一次已经提交到页面的`fiber`节点），与将要生成的元素进行比较，我们需要比较看是否有改变需要被应用到`DOM`中，我们使用`type`类型进行如下比较：

- 比较类型是否相同，相同则复用原本的`DOM`节点，只需要更新相关属性即可

```js
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  // fiber节点的第一个子节点
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  // 1. 如果老的`fiber`存在，则我们将会用新的元素与老的`fiber`进行比较
  while (oldFiber !== null || index < elements.length) {
    const element = elements[index];
    const sameType = oldFiber && oldFiber.type === element.type;
    // type类型想通过，意味着不需要创建新的dom节点，只需要复用老节点，更新对应属性就可以
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE", // 更新标识位
      };
    }
    // 移动到下一个老的`fiber`节点
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    index++;
  }
}
```

- 如果类型不同，并且存在新元素，那么创建新元素

```js
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  // fiber节点的第一个子节点
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  // 1. 如果老的`fiber`存在，则我们将会用新的元素与老的`fiber`进行比较
  while (oldFiber !== null || index < elements.length) {
    const element = elements[index];
    const sameType = oldFiber && oldFiber.type === element.type;
    // 新的元素与老的`fiber`的类型不同，并且当前element存在，创建新的节点
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT", // 插入标识位
      };
    }
    // 移动到下一个老的`fiber`节点
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    index++;
  }
}
```

- 如果类型不同，旧的`fiber`节点存在，则删除旧节点

```js
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  // fiber节点的第一个子节点
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  // 1. 如果老的`fiber`存在，则我们将会用新的元素与老的`fiber`进行比较
  while (oldFiber !== null || index < elements.length) {
    const element = elements[index];
    const sameType = oldFiber && oldFiber.type === element.type;
    // other code...
    // 新的元素与老的`fiber`的类型不同，并且当前oldFiber存在，删除旧的节点
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }
    // 移动到下一个老的`fiber`节点
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    index++;
  }
}
```

接下来需要修改`commitRoot`函数的内容，之前只有`append`的操作，也就是`PLACEMENT`的标识位操作，现在需要添加`UPDATE`以及`DELETION`

```js
function commitRoot() {
  // 删除节点
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}
```

具体的`DOM`操作在`commitWork`执行：

```js
function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  const domParent = fiber.parent.dom;
  // 添加effect标识位处理
  if (fiber.effectTag === "PLACEMENT" && fiber.dom !== null) {
    // PLACEMENT：插入标识位
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom !== null) {
    // UPDATE：更新标识位
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    // DELETION：删除标识位
    domParent.removeChild(fiber.dom);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
```

其中`UPDATE`标识位需要对其属性进行更新，由于属性较多，需要进行比较遍历操作，所以将其封装在`updateDom`函数中，还需要对事件进行单独处理，下面是比较属性操作

```js
const isProperty = (key) => key !== "children";
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);
function updateDom(dom, prevProps, nextProps) {
  // remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = "";
    });
  // add new properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });
}
```

一种特殊的属性为事件监听器，因此以`on`前缀开头的属性名我们都需要特殊处

```js
const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
function updateDom(dom, prevProps, nextProps) {
  // remove old or changed event listeners
  // old event listeners: !(key in nextProps)
  // changed event listener: isNew(prevProps, nextProps)(key)
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });
  // add new or changed event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
  // remove old properties
  // add new properties
}
```

## 第七步：`Function Components`

下面我们要做的事就是需要支持函数组件`Function Components`，将`JSX格式的函数式组件进行转换，就得到了如下代码结构：

```js
function App(props) {
  return Deact.createElement("h1", null, "Hello, ", props.name);
}
const element = Deact.createElement(App, { name: "foo" });
const container = document.getElementById("root");
Deact.render(element, container);
```

函数式组件主要有两种不同的地方：

- 从**函数式组件**创建的`fiber`节点没有对应的`dom`
- 子节点来自于执行函数，而非其`props`中的`children`属性

```js
function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;
  if(isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }
  // return next fiber to work on
  if(fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while(nextFiber) {
    if(nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
  return null;
}

// 更新函数式组件
function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}
// 更新宿主组件
function updateHostComponent(fiber) {
  if(!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);
}

function App(props) {
  return Deact.createElement("h1", null, "Hello, ", props.name);
}
```

在`updateFunctionComponent`函数中，我们可以运行**函数组件来获取其子节点**，并将其属性作为参数值进行传入。如上面的`App`函数，在执行完成之后，会返回一个`h1`对应的元素节点。然后，一旦我们生成对应的`children`，我们就可以可以用同样的方式调用`reconcileChildren`函数

除此之外，还需要做的一个改变就是，由于函数组件没有对应的`dom`属性，所以还需要修改`commitWork`函数

```js
function commitWork(fiber) {
  if(!fiber) {
    return;
  }
  // 向上层查找最近含有dom属性的fiber
  let domParentFiber = fiber.parent;
  while(!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;
  if (fiber.effectTag === "PLACEMENT" && fiber.dom !== null) {
    // PLACEMENT：插入标识位
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom !== null) {
    // UPDATE：更新标识位
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    // DELETION：删除标识位
    commitDeletion(fiber, domParent);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
  if(fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent)
  }
}
```

首先，由于函数组件没有其`dom`属性，所以需要向上层递归找到对应存在`dom`属性值的`fiber`节点，除此之外，删除节点需要递归将其函数组件下的所有节点进行删除

## 第八步：`Hooks`

最后一步，需要给函数组件添加状态。我们先添加一个典型的`Counter`组件，每次点击后，都会将状态值加1

```js
const Deact = {
  createElement,
  createTextElement,
  render,
  useState,
};

function Counter() {
  const [state, setState] = Deact.useState(1);
  return Deact.createElement("h1", null, "Count: ", state, Deact.createElement("button", { onClick: () => setState(c => c + 1) }, "Increment"));
}
const container = document.getElementById("root");
const element = Deact.createElement(Counter);
Deact.render(element, container);
```

### `useState`

可以看到我们直接调用了`Deact`对象的`useState`方法，所以需要在`Deact`对象中奖`useState`暴露出去。为了实现`useState`函数，需要做以下工作：

1. 需要一个全局变量保存当前正在执行的`fiber`节点，以便将对应的`hook`信息挂载在上面
2. 需要一个全局的`hook`的索引变量，使用该索引获取更新前`fiber`对应的`hook`，并以此获取其中的`state`值进行使用

```js
let wipFiber = null;
let hookIndex = 0;
// 更新函数式组件
function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}
```

在上面可以看到，在执行`updateFunctionComponent`函数中，将对应的变量进行了重置，并将`wipFiber.hooks`设置为一个数组，，然后会调用`fiber.type`进行执行，也就是执行函数组件，在函数组件内部执行时，会调用`useState`方法，每调用一次`useState`，就会向其中推入一个`hook`对象，该对象保存着状态值`state`以及更新队列`queue`，下面我们开始创建对应的`useState`方法

```js
function useState(initial) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach(action => {
    hook.state = action(hook.state) || initial;
  });
  const setState = (action) => {
    // some code...
  }
  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}
```

可以看到上面的`useState`函数主要做了几件事：

1. 通过`hookIndex`索引在`wipFiber.hooks`中取出对应的`oldHook`，也这就是为什么不能将`hook`写在条件语句中的原因，不同条件后，`hookIndex`所对应的`hook`对象不相同，会导致值更新错误
2. 从`oldHook`中取出`state`以及`actions`，依次执行`action`函数，获得最新`hook.state`的值将其存入
3. 创建`setState`函数，将`state`以`setState`函数一起传递刚给外部

```js
const setState = (action) => {
  hook.queue.push(action);
  // 复用当前currentRoot的dom以及props，并将当前页面渲染的fiber作为alternate属性
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot,
  };
  // 设置下一个工作单元
  nextUnitOfWork = wipRoot;
  deletions = [];
}
```

上面是`setState`的实现过程，每次调用该函数时，将传入的函数作为`action`，放入`hook`的更新队列`queue`中，并设置`wipRoot`以及`nextUnitOfWork`变量，由于代码中的`workLoop`函数在浏览器有空闲时间时一直循环执行的，可以看到控制台会一直打印下面的`workLoop`日志。

```js
function workLoop(deadline) {
  console.log('workLoop', deadline, nextUnitOfWork);
  let shouldYield = false;
  while(nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if(!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);
```

执行`workLoop`函数后，发现当前的`nextUnitOfWork`变量存在，则会继续向下执行`performUnitOfWork`函数，生成新的`fiber`树，重新执行函数组件以及`useState`函数，遍历`actions`生成最新的`state`来更新组件状态，并进行显示。

### `useEffect`

`useEffect`是传入一个副作用函数，然后根据是否传入依赖值以及依赖值是否变化来判断该副作用函数是否执行。有以下几种情况

- 没有传入依赖值`deps`，则每次执行组件函数也就是组件更新时都会执行
- 传入一个空数组作为依赖值，那么只在第一次组件挂载时执行
- 传入状态作为依赖值，则每次执行函数组件时会判断该依赖是否被更新，如果两次依赖值不同则更新
- 副作用函数还可以返回一个`cleanup`函数，该函数会在下一次更新执行副作用函数之前执行

也就是说，在使用`useEffect`时，是进行副作用函数以及依赖的收集，在完成`commit`阶段后才会从`wipRoot`节点开始深度遍历所有的`fiber`，找到里面的`hooks`，取出所有的`effect`函数来进行执行

```js
function useEffect(effect, deps) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];
  const hook = {
    effect,
    deps,
    cleanup: undefined,
    _tag: 'effect',
    state:null,
    queue: [],
  }
  if(oldHook && isEffectHook(oldHook)) {
    const hasDepsChange = !deps || !oldHook.deps || deps.length !== oldHook.deps.length || deps.some((dep, index) => dep !== oldHook.deps[index]);
    if(hasDepsChange) {
      hook.cleanup = oldHook.cleanup;
    } else {
      // 没有依赖项改变，则直接复用旧的effect hook
      // No change in deps, skip this effect
      hook.cleanup = oldHook.cleanup;
      hook.effect = oldHook.effect;
    }
  }
  wipFiber.hooks.push(hook);
  hookIndex++;
}

function shouldRunEffect(currentHook, previousHook) {
  // If previousHook doesn't exist or its deps don't exist, run the effect
  // If currentHook's deps don't exist, run the effect everytime
  if(!previousHook || !previousHook.deps || !currentHook.deps) {
    return true;
  }
  return currentHook.deps.some((dep, index) => dep !== previousHook.deps[index]);
}

function runEffectsRecursively(fiber) {
  if(fiber.hooks && fiber.hooks.length > 0) {
    const preFiber = fiber.alternate;

    fiber.hooks.forEach((hook, index) => {
      if(!isEffectHook(hook)) {
        return;
      }
      const effectHook = hook;
      const previousHook = preFiber && preFiber.hooks ? preFiber.hooks[index] : null;
      const shouldRun = shouldRunEffect(effectHook, previousHook);
      // 需要执行副作用函数并且当前effectHook有保存上一次的cleaup函数
      // 执行cleanup函数
      if(shouldRun && effectHook.cleanup) {
        effectHook.cleanup();
        effectHook.cleanup = undefined;
      }
      if(shouldRun) {
        // 执行副作用函数，收集cleanup函数以便下次调用
        const cleanup = effectHook.effect();
        if(cleanup && typeof cleanup === 'function') {
          effectHook.cleanup = cleanup;
        }
      }
    });
  }
  if(fiber.child) {
    runEffectsRecursively(fiber.child);
  }
  if(fiber.sibling) {
    runEffectsRecursively(fiber.sibling);
  }
}

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  // 提交阶段完成后进行副作用函数执行
  // When your component commits, React will run your setup function
  runEffectsRecursively(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
  deletions = [];
}
```

### `useMemo`

`useMemo`可以缓存在重新渲染之间的计算结果，使用方式：`const cachedValue = useMemo(calculateValue, dependencies)`

`Parameters`：

- `calculateValue`：这是一个函数，返回你想要缓存的值，该函数应该是一个**存函数**，应该没有参数，可以返回任何类型的值。`React`将会在初次渲染的时候调用该函数。在接下来的渲染中，`React`将会返回相同的值，如果`dependencies`没有改变。否则，则就调用该函数，重新返回计算结果，并将其结果存储起来。
- `dependencies`：在`calculateValue`函数中依赖的响应值列表。响应值包含`props`、`state`和所有在组件内部声明的变量以及函数。`React`将会使用`Object.is`函数来将其之前的每一个依赖值与现在进行比较。

根据上面👆🏻使用方法可以得到下面的信息：

- `useMemo`需要保存计算值以及依赖，判断前一次依赖与本次是否相同，不相同则重新对值进行计算
- `useMemo`不会在依赖修改的时候触发重新渲染，只会在组件执行期间根据依赖项是否变化判断是否需要重新计算值

```js
// useMemo hook
function isMemoHook(hook) {
  return hook !== null && typeof hook === 'object' && hook._tag === 'memo';
}

function useMemo(factory, deps) {
  const oldHook = wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex];
  
  const hook = {
    _tag: 'memo',
    deps,
    factory,
    state: null,
  }
  let valu
  if(oldHook && isMemoHook(oldHook)){
    const hasDepsChange = !deps || !oldHook.deps || deps.length !== oldHook.deps.length || deps.some((dep, index) => dep !== oldHook.deps[index]);
    if(hasDepsChange) {
      value = factory();
    } else {
      value = oldHook.state;
    }
  } else {
    value = factory();
  }
  hook.state = value;

  wipFiber.hooks.push(hook);
  hookIndex++;
  return hook.state;
}
```

### `useCallback`

`useCallback`是一个`React`的`Hook`，它可以让你在组件重新渲染时缓存函数，使用方式为`useCallback(fn, dependencies)`

使用`useCallback`缓存函数只在下面的场景中有价值：

- 将缓存的函数作为一个`prop`传递给一个被`memo`包裹的组件。你想要在依赖值没有修改时跳过重新渲染。`Memozation`可以让组件只在依赖项改变时重新渲染
- 缓存的函数被作为了其他`Hook`的依赖项。例如，另一个被`useCallback`包裹的函数依赖它或者在`useEffect`中使用了依赖了该函数

```js
// useCallback hook
function isCallbackHook(hook) {
  return hook !== null && typeof hook === 'object' && hook._tag === 'callback';
}

function useCallback(callback, deps) {
  const oldHook = wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex];
  const hook = {
    _tag: 'callback',
    deps,
    state: callback,
  }
  if(oldHook && isCallbackHook(oldHook)) {
    const hasDepsChange = !deps || !oldHook.deps || deps.length !== oldHook.deps.length || deps.some((dep, index) => dep !== oldHook.deps[index]);
    if(!hasDepsChange) {
      hook.state = oldHook.state;
    }
  }
  wipFiber.hooks.push(hook);
  hookIndex++;
  return hook.state;
}
```

### `useContext`

`useContext`是一个可以读取以及订阅上下文`context`的`hook`，使用时通常需要搭配`createContext`以及`Provider`一起使用，使用方式如下：

```js
// 创建上下文对象
const ThemeContext = Deact.createContext('light');

function ThemeApp() {
  const [theme, setTheme] = Deact.useState('dark');
  
  return Deact.createElement(
    ThemeContext.Provider,
    { value: theme },
    Deact.createElement('div', null,
      Deact.createElement('div', null, Deact.createElement(ThemeChild)),
      Deact.createElement('button', {
        onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark')
      }, 'Toggle Theme')
    )
  );
}

function ThemeChild() {
  const theme = Deact.useContext(ThemeContext);
  return Deact.createElement('div', null, `Current Theme: ${theme}`);
}
```

我们首先来看`createContext`做了什么，根据这个名称可以指定是创建一个上下文对象，对象里面至少需要包含`Provider`以及`Consumer`，这两个对象一个向子组件提供上下文，一个可以用来消费上下文

```js
// createContext hook
function createContext(defaultValue) {
  // 创建一个上下文对象
  const context = {
    _value: defaultValue, // 默认值
    _currentValue: defaultValue, // Provider 提供的当前值
    Provider: null,
    Consumer: null,
    _subscribers: new Set(), // 订阅者集合，存储所有使用该 context 的 fiber 节点
    _needsUpdate: false, // 标记是否需要更新订阅者
  };
  
  // Provider 组件
  function Provider(props) {
    return props.children;
  }
  // 标记 Provider 组件对应的 context，用于在 updateFunctionComponent 中识别
  Provider._context = context;
  context.Provider = Provider;
  
  // Consumer 组件（可选，通常使用 useContext）
  context.Consumer = function Consumer(props) {
    const value = useContext(context);
    return props.children(value);
  };
  
  return context;
}
```

从上面可以看出，`Provider`本质就是一个函数组件，将其`props.children`属性返回进行子组件渲染。重点是将当前上下文对象`context`挂载在了`Provider._context`对象上，以便渲染的时候使用。

接下来是`useContext`，根据前面的定义，使用该`hook`可以读取以及订阅传入的上下文对象

```js
// useContext hook
function useContext(context) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];
  
  // 向上遍历 fiber 树，查找最近的 Provider
  let fiber = wipFiber;
  let value = context._value; // 默认值
  let providerFiber = null;
  
  // 从当前节点向上层遍历parent，查找最近的提供context对象的Provider
  while (fiber) {
    // 检查当前 fiber 是否有 context 值
    if (fiber.context && fiber.context[context] !== undefined) {
      value = fiber.context[context];
      providerFiber = fiber;
      break;
    }
    fiber = fiber.parent;
  }
  
  // 如果没有找到 Provider，使用 context 的当前值（可能是默认值或之前的值）
  if (!providerFiber) {
    value = context._currentValue;
  }
  
  
  // 重点：为当前上下文添加对该fiber的订阅
  context._subscribers.add(wipFiber);
  
  const hook = {
    _tag: 'context',
    state: value,
    context: context,
  }
  
  wipFiber.hooks.push(hook);
  hookIndex++;
  return value;
}
```

从上面的代码可以看出做了两个重要的事：

- 第一个是从当前`fiber`依次向上层查找包含该上下文`context`的`fiber`节点，那么该`fiber`就是具有上下文对象的`Provider`
- 将该`fiber`添加到上下文的订阅中，以便状态值更新后会更新对应的`fiber`

只完成上面两个函数还不足以实现该功能，在`useContext`函数中可以看到`Provider`对应的`fiberNode`中包含`context`属性，那么我们需要再`updateFunctionComponent`函数中添加对应的处理

```js
// 更新函数式组件
function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  
  // 如果组件是 Provider，先设置 context 值
  // 这样在渲染子组件时，useContext 就能访问到 context 值
  if (fiber.type && fiber.type._context) {
    const context = fiber.type._context;
    const oldValue = context._currentValue;
    // Provider 组件的固定向其中传入value值，所以需要从props中获取
    const newValue = fiber.props.value;
    
    // 存储到 fiber 节点上，供 useContext 查找
    // 一个 fiber 节点上，可能有多个 context 对象
    if (!wipFiber.context) {
      wipFiber.context = {};
    }
    wipFiber.context[context] = newValue;
    
    // 如果值改变了，标记 context 需要更新
    // 实际的更新会在 commitRoot 完成后进行
    if (oldValue !== newValue) {
      context._needsUpdate = true;
      // 先更新当前值，供本次渲染使用
      context._currentValue = newValue;
    }
  }
  
  const context = fiber.type && fiber.type._context;
  const children = context ? context.Provider(fiber.props) : [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}
```

在上面比较了`context`中值的是否变化，有变化则更新状态值并添加对应的标识符，接下来要做的就是在提交`commit`阶段，判断更新状态

```js
function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  runEffectsRecursively(wipRoot.child);
  
  // 检查是否有 context 需要更新（检查本次渲染的树）
  const contextsToUpdate = [];
  function collectContexts(fiber) {
    if (!fiber) return;
    
    // 检查是否是 Provider 组件
    if (fiber.type && fiber.type._context) {
      const context = fiber.type._context;
      if (context._needsUpdate && context._subscribers.size > 0) {
        contextsToUpdate.push(context);
        context._needsUpdate = false; // 重置标记
      }
    }
    
    collectContexts(fiber.child);
    collectContexts(fiber.sibling);
  }
  collectContexts(wipRoot.child);
  
  const rootToCommit = wipRoot;
  currentRoot = wipRoot;
  wipRoot = null;
  deletions = [];
  
  // 如果有 context 更新，触发订阅者重新渲染
  if (contextsToUpdate.length > 0 && rootToCommit && rootToCommit.dom) {
    // 收集所有需要更新的订阅者
    const subscribersToUpdate = new Set();
    contextsToUpdate.forEach(context => {
      context._subscribers.forEach(subscriber => {
        if (subscriber) {
          subscribersToUpdate.add(subscriber);
        }
      });
    });
    // 如果有订阅者需要更新，触发重新渲染
    if (subscribersToUpdate.size > 0) {
      // 从根节点重新渲染
      wipRoot = {
        dom: rootToCommit.dom,
        props: rootToCommit.props,
        alternate: rootToCommit,
      };
      nextUnitOfWork = wipRoot;
      deletions = [];
    }
  }
}
```

## 参考

- [build your own react](https://pomb.us/build-your-own-react/)
