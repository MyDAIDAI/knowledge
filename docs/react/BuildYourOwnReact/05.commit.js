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

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  };
  nextUnitOfWork = wipRoot;
}

// 将大任务拆分为小任务的循环执行机制
let nextUnitOfWork = null; // 全局变量，保存接下来需要执行的任务
let wipRoot = null;
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

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  // add dom node
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
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
    if (index === 0) {
      fiber.child = newFiber;
      newFiber.parent = fiber;
    } else {
      prevSibling.sibling = newFiber;
      newFiber.parent = fiber;
    }
    prevSibling = newFiber;
    index++;
  }
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

function commitRoot() {
  // TODO add nodes to dom
}

const Deact = {
  createElement,
  createTextElement,
  render,
};
const element = Deact.createElement(
  "h1",
  { title: "foo" },
  Deact.createElement("a", null, "a"),
  Deact.createElement("div", null, "b"),
  "hello"
);

const container = document.getElementById("root");
Deact.render(element, container);
