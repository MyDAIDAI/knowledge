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
/**
 * 对比新旧fiber树，并更新对应的fiber节点
 * @param {*} wipFiber 父fiber节点
 * @param {*} elements 子元素
 * 
 * 1. 如果旧的fiber节点存在，则我们将会用新的元素与旧的fiber节点进行比较
 * 2. 如果旧的fiber节点不存在，则我们将会用新的元素创建新的fiber节点
 * 3. 如果新的元素与旧的fiber节点的类型相同，则我们将会用新的元素更新旧的fiber节点
 * 4. 如果新的元素与旧的fiber节点的类型不同，则我们将会删除旧的fiber节点，并创建新的fiber节点
 * 5. 如果新的元素与旧的fiber节点的类型相同，则我们将会用新的元素更新旧的fiber节点
 */
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
  runEffectsRecursively(wipRoot.child);
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


// useState hook
function useState(initial) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
    _tag: 'state',
  };
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach(action => {
    hook.state = action(hook.state) || initial;
  });
  const setState = (action) => {
    hook.queue.push(action);
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
  hookIndex++;
  return [hook.state, setState];
}

// useEffect hook
/**
 * 判断hook是否是effect hook
 * @param {*} hook 
 * @returns {boolean} true if hook is effect hook, false otherwise
 */
function isEffectHook(hook) {
  return hook !== null && typeof hook === 'object' && hook._tag === 'effect';
}

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
      if(shouldRun && effectHook.cleanup) {
        effectHook.cleanup();
        effectHook.cleanup = undefined;
      }
      if(shouldRun) {
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
  let value;
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

function useRef(initialValue) {
  const oldHook = wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex];
  const hook = {
    _tag: 'ref',
    state: oldHook ? oldHook.state : { current: initialValue },
  }

  wipFiber.hooks.push(hook);
  hookIndex++;
  return hook.state;
}


const Deact = {
  createElement,
  createTextElement,
  render,
  useState,
  useEffect,
  useMemo,
  useCallback,
};

function Counter() {
  const [state, setState] = Deact.useState(1);
  const [state2, setState2] = Deact.useState(2);

  Deact.useEffect(() => {
    console.log('no deps effect');
    return () => {
      console.log('no deps cleanup');
    }
  });

  Deact.useEffect(() => {
    console.log('deps effect state2', state2);
    return () => {
      console.log('deps cleanup state2', state2);
    }
  }, [state2]);

  Deact.useEffect(() => {
    console.log('effect', state);
    return () => {
      console.log('cleanup', state);
    }
  }, [state]);

  const data1 = Deact.useMemo(() => {
    console.log('useMemo called data1');
    return {
      name: 'John',
      age: 30,
    }
  }, []);
  console.log('data1', data1);

  const data2 = Deact.useMemo(() => {
    console.log('useMemo called data2');
    return {
      name: 'data2',
      age: 30,
    }
  }, [state]);
  console.log('data2', data2);

  const cb1 = Deact.useCallback(() => {
    console.log('useCallback called cb1');
  }, []);
  console.log('cb1', cb1);
 
  return Deact.createElement("h1", null, "Count: ", state, Deact.createElement("button", { onClick: () => setState(c => c + 1) }, "Increment"));
}
const container = document.getElementById("root");
const element = Deact.createElement(Counter);
Deact.render(element, container);