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
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

// 将大任务拆分为小任务的循环执行机制
let nextUnitOfWork = null; // 全局变量，保存接下来需要执行的任务
let wipRoot = null;
let currentRoot = null;
let deletions = []; // 全局变量，保存需要删除的节点
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
  reconcileChildren(fiber, elements);
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

/**
 *
 * @param {*} wipFiber 当前要构建的fiber节点
 * @param {*} elements 当前需要构建的fiber树的子元素
 *
 * 在这个函数中，我们将会用老的`fiber`与新的元素进行`reconcile`
 * 当前wipFiber是当前要构建的fiber节点，其alternate属性指向的是最近一次已提交的fiber树的对应节点
 * 1. 如果老的`fiber`存在，则我们将会用新的元素与老的`fiber`进行比较
 * 2. 如果老的`fiber`不存在，则我们将会用新的元素创建新的`fiber`
 * 3. 如果新的元素与老的`fiber`的类型相同，则我们将会用新的元素更新老的`fiber`
 * 4. 如果新的元素与老的`fiber`的类型不同，则我们将会删除老的`fiber`，并创建新的`fiber`
 * 5. 如果新的元素与老的`fiber`的类型相同，则我们将会用新的元素更新老的`fiber`
 */
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  // fiber节点的第一个子节点
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  // 1. 如果老的`fiber`存在，则我们将会用新的元素与老的`fiber`进行比较
  while (oldFiber !== null || index < elements.length) {
    const element = elements[index];
    console.log("oldFiber", oldFiber);
    console.log("element", element);
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

const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);
function updateDom(dom, prevProps, nextProps) {
  // remove old or changed event listeners
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

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  console.log("currentRoot", currentRoot);
  wipRoot = null;
}

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
