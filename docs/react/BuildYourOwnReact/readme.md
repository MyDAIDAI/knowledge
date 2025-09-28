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
const element = <h1 titl="foo">hello</h1>;

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
