function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...(props || {}),
      children: (children || []).map((child) =>
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
  
  // 如果组件是 Provider，先设置 context 值
  // 这样在渲染子组件时，useContext 就能访问到 context 值
  if (fiber.type && fiber.type._context) {
    const context = fiber.type._context;
    const oldValue = context._currentValue;
    const newValue = fiber.props.value;
    
    // 存储到 fiber 节点上，供 useContext 查找
    if (!wipFiber.context) {
      wipFiber.context = {};
    }
    wipFiber.context[context] = newValue;
    
    // 如果值改变了，标记 context 需要更新
    // 实际的更新会在 commitRoot 完成后进行
    console.log('updateFunctionComponent context', fiber, context, oldValue, newValue);
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
// 更新宿主组件
function updateHostComponent(fiber) {
  if(!fiber.dom) {
    fiber.dom = createDom(fiber);
    updateDom(fiber.dom, {}, fiber.props);
  }
  const elements = fiber.props?.children || [];
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
function updateDom(dom, prevProps = {}, nextProps = {}) {
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
  
  console.log('commitRoot contextsToUpdate', contextsToUpdate);
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
  // 清理 context 订阅
  if (fiber.hooks) {
    fiber.hooks.forEach(hook => {
      if (hook._tag === 'context' && hook.context && hook.context._subscribers) {
        hook.context._subscribers.delete(fiber);
      }
    });
  }
  
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
    const fn = typeof action === 'function' ? action : () => { return action; };
    hook.state = fn(hook.state) || initial;
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

// createContext hook
function createContext(defaultValue) {
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
  
  while (fiber) {
    console.log('useContext fiber', fiber);
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
  
  // 注册当前组件为订阅者
  // 使用 alternate 中的 fiber（如果存在）来清理旧的订阅
  const oldFiber = wipFiber.alternate;
  if (oldFiber && oldFiber.hooks && oldFiber.hooks[hookIndex]) {
    const oldContextHook = oldFiber.hooks[hookIndex];
    if (oldContextHook && oldContextHook.context === context) {
      // 移除旧的订阅（如果存在）
      oldContextHook.context._subscribers.delete(oldFiber);
    }
  }
  
  // 添加新的订阅
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


const Deact = {
  createElement,
  createTextElement,
  render,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  createContext,
  useContext,
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
// const container = document.getElementById("root");
// const element = Deact.createElement(Counter);
// Deact.render(element, container);


// Context 更新示例
const ThemeContext = Deact.createContext('light');
console.log('ThemeContext', ThemeContext);

// 使用 Provider，支持更新 context
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

// 使用 useContext，当 Provider 的 value 改变时会自动更新
function ThemeChild() {
  const theme = Deact.useContext(ThemeContext);
  return Deact.createElement('div', null, `Current Theme: ${theme}`);
}
const container = document.getElementById("root");
const element = Deact.createElement(ThemeApp);
Deact.render(element, container);