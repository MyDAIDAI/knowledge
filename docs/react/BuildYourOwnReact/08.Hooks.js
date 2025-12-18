function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child == "object" ? child : createTextElement(child)
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
      ? document.createTextNode(fiber.props.nodeValue)
      : document.createElement(fiber.type);
  return dom;
}

let wipRoot = null;
let nextUnitOfWork = null;
let currentRoot = null;
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

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  nextUnitOfWork = wipRoot;
  console.log('render', wipRoot);
}

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

let wipFiber = null;
let hookIndex = 0;
// 更新函数式组件
function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  console.log('updateFunctionComponent', children);
  reconcileChildren(fiber, children);
}
// 更新宿主组件
function updateHostComponent(fiber) {
  if(!fiber.dom) {
    fiber.dom = createDom(fiber);
    updateDom(fiber.dom, {}, fiber.props);
  }
  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);
}

let deletions = [];
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let prevSibling = null;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  while(index < elements.length) {
    const element = elements[index];
    let newFiber = null;
    const sameType = oldFiber && oldFiber.type === element.type;
    // type相同，则不需要创建新的dom节点，只需要更新对应属性即可
    if(sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        parent: wipFiber,
        dom: oldFiber.dom,
        alternate: oldFiber,
        effectTag: "UPDATE",
      }
    }
    if(element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        parent: wipFiber,
        dom: null,
        alternate: null,
        effectTag: "PLACEMENT",
      }
    }
    if(oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }
    if(oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    if(index === 0) {
      wipFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
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
  wipRoot = null;
  deletions = [];
}

function commitWork(fiber) {
  if(!fiber) {
    return;
  }
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
    // domParent.removeChild(fiber.dom);
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
  console.log('actions', actions);
  actions.forEach(action => {
    hook.state = action(hook.state) || initial;
    console.log('hook.state', hook.state);
  });
  const setState = (action) => {
    hook.queue.push(action);
    console.log('hook.queue', hook.queue);
    // 复用当前currentRoot的dom以及props
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    // 设置下一个工作单元
    nextUnitOfWork = wipRoot;
    deletions = [];
  }
  wipFiber.hooks.push(hook);
  console.log('wipFiber.hooks', wipFiber.hooks);
  hookIndex++;
  return [hook.state, setState];
}


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