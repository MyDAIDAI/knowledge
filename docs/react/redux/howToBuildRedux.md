# Build Yourself a Redux

## Bring Your Own State Object

大多数`app`将会从服务端获取对象，但是我们也可以创建本地对象，`Redux`可以帮助管理状态的改变，但是它并不真正的关心状态本身。

```js
const initialState = {
  nextNoteId: 1,
  notes: {}
};
```

## Why Redux?

为什么需要使用`Redux`呢？在我们深入挖掘之前，让我们来看看如果没有`Redux`，怎么构建一个`app`呢，或许需要将某个对象挂载在`window`上 `window.state = initialState;`，在组件内部使用方式如下：

```js
const onAddNote = () => {
  const id = window.state.nextNoteId;
  window.state.notes[id] = {
    id,
    content: ''
  };
  window.state.nextNoteId++;
  renderApp();
};

const NoteApp = ({notes}) => (
  <div>
    <ul className="note-list">
    {
      Object.keys(notes).map(id => (
        // Obviously we should render something more interesting than the id.
        <li className="note-list-item" key={id}>{id}</li>
      ))
    }
    </ul>
    <button className="editor-button" onClick={onAddNote}>New Note</button>
  </div>
);

const renderApp = () => {
  ReactDOM.render(
    <NoteApp notes={window.state.notes}/>,
    document.getElementById('root')
  );
};

renderApp();
```

上面的实现方式不优雅，但是仍然可以工作，那么是否我们可以不需要`Redux`呢？

让我们在添加一下功能，我们在`onAddNote`中增加一个请求

```js
const onAddNote = () => {
  window.state.onLoading = true;
  renderApp();
  api.createNote()
    .then((note) => {
      window.state.onLoading = false;
      window.state.notes[id] = note;
      renderApp();
    });
};
```

可以看到在上面的函数中，修改了两次`state`的值，同时为了更新界面，需要调用两次`renderApp`函数来进行更新。除此之外，如果逻辑更多，则需要改变和处理的情况就越多，也越容易出现问题

```js
const ARCHIVE_TAG_ID = 0;

const onAddTag = (noteId, tagId) => {
  window.state.onLoading = true;
  // Whoops, forgetting to render here!
  // For quick local server, we might not notice.
  api.addTag(noteId, tagId)
    .then(() => {
      window.state.onLoading = false;
      window.state.tagMapping[tagId] = noteId;
      if (ARCHIVE_TAG_ID) {
        // Whoops, some naming bugs here. Probably from a
        // rogue search and replace. Won't be noticed till
        // we test that archive page that nobody really uses.
        window.state.archived = window.state.archive || {};
        window.state.archived[noteId] = window.state.notes[noteId];
        delete window.state.notes[noteId];
      }
      renderApp();
    });
};
```

上面的代码有两处错误，一个是在设置`onLoading=true`后，没有调用`renderApp`，页面也就没有对该交互进行渲染。还有一个是下面的变量取值错误，这种错误没有控制台警告，只能依赖开发者手动调试，在遇到相关问题时才能暴露出来，并且极难被发现。

还有如下面的代码：

```js
const SomeEvilComponent = () => {
  <button onClick={() => window.state.pureEvil = true}>Do Evil</button>
};
```

全局状态值可能被应用在页面的各个组件中，如果出现问题，需要依赖经验查找原因，调试及其困难，会给开发者造成很大的时间浪费。这就是为什么需要使用`Redux`的主要原因。如果想降低一个`app`的复杂度，最有效的方式就是限制程序状态变更的方式与变更范围。`Redux`并不是一个能解决这些问题的万能良方，但由于有了许多限制，上面的问题会逐渐减少。

## The Reducer

`Redux`是如何提供这些约束并帮助管理状态的呢？我们可以通过一个先实现一个简单的函数，这个函数接收当前的状态以及一个行为`action`，返回一个新的状态。所以我们可以针对上面的状态，完成一个如下的函数：

```js
const CREATE_NOTE = 'CREATE_NOTE';
const UPDATE_NOTE = 'UPDATE_NOTE';

const initialState = {
  nextNoteId: 1,
  notes: {}
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_NOTE:
      // change the state
      return;
    case UPDATE_NOTE:
      // change the state
      return;
    default:
      return state;
  }
};
```

上面的`reducer`函数也可以换一种方式实现，使用对象映射不同的`action`操作

```js
const handlers = {
  [CREATE_NOTE]: (state) => {
    return;
  },
  [UPDATE_NOTE]: (state) => {
    return;
  }
};

const reducer = (state = initialState, action) => {
  const handler = handlers[action.type];
  if (handler) {
    return handler(state, action);
  }
  return state;
};
```

`reducer`的可以按照你想要的任何方式实现。`Redux`并不关心。

## Immutability

`Redux`只关心`reducer`是否是一个[纯函数](./pureFunction.md)。意味着不能向下面👇🏻这样实现`reducer`函数

```js
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_NOTE: {
      // DO NOT MUTATE STATE LIKE THIS!!!
      state.notes[state.nextNoteId] = {
        id: state.nextNoteId,
        content: ''
      };
      state.nextNoteId++;
      return state;
    }
    case UPDATE_NOTE: {
      // DO NOT MUTATE STATE LIKE THIS!!!
      state.notes[action.id].content = action.content;
      return state;
    }
    default:
      return state;
  }
};
```

使用上面的方式直接修改对象，那么对象的引用不会改变，则使用该对象作为属性的组件无法正确更新。除此之外，还会使`Redux`开发工具无法使用，这些工具依赖追踪历史状态，持续对对象进行状态修改，则无法进行**回溯**。

纯函数具有可预测性，因为相同的输入必然产生相同的输出。若直接修改状态，则一切都变得不可预测。函数调用失去确定性，开发者需要时刻在脑海中保持整个函数调用过程的。

可以直接使用**拓展运算符**或者`Object.assign`。对于对象中不可变的部分，我们直接引用现有内容，如下代码：我们只需要改变`notes`属性，因此`state`中的其他属性使用浅复制保持原对象引用。这样的话就可以利用`shouldComponentUpdate`或者`PureCompnent`，如果组件中的`props`中包含未变更的对象属性，则可以避免被重新渲染。基于此原则，我们也应该避免将`reducer`编写成如下的形式：

```js
const reducer = (state = initialState, action) => {
  // Well, we avoid mutation, but still... DON'T DO THIS!
  state = _.cloneDeep(state)
  switch (action.type) {
    // ...
    case UPDATE_NOTE: {
      // Hey, now I can do good old mutations.
      state.notes[action.id].content = action.content;
      return state;
    }
    default:
      return state;
  }
};
```

上面的代码从技术上来说在`Redux`中也能运行。但是这样会破坏优化机制。每次状态变更时，每个对象和数组都会被重新创建，因此依赖这些对象和数组的组件都必须重新渲染，但实际上其状态值并没有更新。

`Immutability`即为**不可变性**，指数据一旦创建就不能被修改的特性。意味着：

- 状态对象本身不可变
- 任何状态更新都必须返回**全新的对象**，而不是修改原对象
- 状态树中的每个节点都是不可变的

如下：

```js
// ❌ 错误做法：直接修改原状态
function reducer(state, action) {
  state.todos.push(action.payload);  // 直接修改
  return state;  // 返回同一引用
}

// ✅ 正确做法：返回新对象
function reducer(state, action) {
  return {
    ...state,
    todos: [...state.todos, action.payload]  // 创建新数组
  };
}
```

### 为什么需要不可变呢？

#### 性能优化：引用比较

在`react`内部是通过**浅比较**判断属性值是否发生变化，那么每次状态更新返回新的对象也就是一个新的引用，就可以通过浅比较发现其状态发生了变化

```js
// 通过引用比较快速判断状态是否变化
function connect(mapStateToProps) {
  // 通过 === 比较引用，O(1)时间复杂度
  const newProps = mapStateToProps(state);
  if (oldProps !== newProps) {
    component.update(newProps);
  }
}
```

#### 时间旅行调试

在每次状态修改时都将状态保存到一个历史栈中，每次都是一个新值，保证了历史栈中存储的数据准确

```js
// 保存状态历史
const stateHistory = [initialState];

// 每次dispatch都保存完整状态快照
function dispatch(action) {
  const newState = reducer(currentState, action);
  stateHistory.push(newState);  // 需要不可变性保证历史不被修改
  currentState = newState;
}

// 回退到之前的状态
function travelBack(step) {
  currentState = stateHistory[stateHistory.length - step];
  // 原状态保持不变，可安全使用
}
```

#### 纯函数特性

```js
// Reducer必须是纯函数
function reducer(state = initialState, action) {
  // 纯函数要求：
  // 1. 相同输入 → 相同输出
  // 2. 无副作用
  // 3. 不依赖外部状态
  
  // 不可变性是实现纯函数的基础
  return {
    ...state,
    updatedAt: Date.now()  // 每次都返回新对象
  };
}
```

#### 更新高效

在组件内部使用浅比较`Props`进行更新判断，如果状态可变，那么深层需要进行递归判断，代价非常昂贵。

```js
// React-Redux的浅比较
function shouldComponentUpdate(nextProps) {
  // 浅层比较props引用
  for (let key in this.props) {
    if (this.props[key] !== nextProps[key]) {
      return true;
    }
  }
  return false;
}
// 如果状态可变，深层比较会非常昂贵
```

## Using our Reducer

让我们使用创建的`reducer`来获取一个新的状态

```js
const state0 = reducer(undefined, {
  type: CREATE_NOTE
});
// the value of state 0
{
  nextNoteId: 2,
  notes: {
    1: {
      id: 1,
      content: ''
    }
  }
}
```

在上面的状态初始化中，我们传递了一个`undefined`值作为初始状态值。`Redux`总是传递一个`undefined`作为初始变量，或者可以使用一个像这样的默认参数`state=initialState`。后面可以将前一个状态`previous state`继续传入`Redux`中

```js
const state1  = reducer(state0, {
  type: UPDATE_NOTE,
  id: 1,
  content: 'Hello, world!'
});
// state1
{
  nextNoteId: 2,
  notes: {
    1: {
      id: 1,
      content: 'Hello, world!'
    }
  }
}
```

我们可以按照下面的方式来使用状态，将其放置在`html`页面中，可以看到在页面中正确的渲染了该状态值。

```js
const CREATE_NOTE = 'CREATE_NOTE';
const UPDATE_NOTE = 'UPDATE_NOTE';

const initialState = {
  nextNoteId: 1,
  notes: {}
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_NOTE:
      const id = state.nextNoteId;
      const newNote = {
        id,
        content: ''
      }
      return {
        ...state,
        nextNoteId: id + 1,
        notes: {
          ...state.notes,
          [id]: newNote
        }
      };
    case UPDATE_NOTE:
      const editedNote = {
        ...state.notes[action.id],
        content: action.content
      }
      return {
        ...state,
        notes: {
          ...state.notes,
          [action.id]: editedNote
        }
      };
    default:
      return state;
  }
};

const state0 = reducer(undefined, {
  type: CREATE_NOTE
});
console.log(state0);

const state1 = reducer(state0, {
  type: UPDATE_NOTE,
  id: 1,
  content: 'Hello, world!'
});

Deact.render(
  Deact.createElement('div', null, JSON.stringify(state1)),
  document.getElementById('root')
);
```

`Redux`的核心本质上就是编写一段代码--一个简单的函数，它接受上一个状态和一个动作，并返回下一个状态。这个函数可以被直接嵌入`reduce`函数中，也就是为这什么这个函数被称为`reducer`的原因。

```js
const actions = [
  { type: CREATE_NOTE },
  { type: UPDATE_NOTE, id: 1, content: 'Hello, world!' },
]
const state2 = actions.reduce(reducer, undefined);
console.log('state2', state2);

// state2
{
  nextNoteId: 2,
  notes: {
    1: {
      id: 1,
      content: 'Hello, world!'
    }
  }
}
```

可以看到上面两种方式使用`reducer`返回的状态值相同，这就是为什么`Redux`被称为是`JavaScript`应用程序的可预测状态容器了。输入相同的状态值以及`action`，最终会得到相同的状态。

## The Store

现在我们来创建一个存储器`store`，使用闭包的方式将状态值以及`reducer`保存在函数的局部作用域中，避免变量污染。存储器还提供修改状态的方法`dispatch`以及获取状态的方法`getState`。通过这个方式可以简化状态修改的使用，并且避免直接修改状态值，必须使用`dispatch`方法来进行修改，方便后期对状态修改进行回溯。

```js
const createStore = (reducer) => {
  let state = undefined;
  return {
    dispatch: (action) => {
      state = reducer(state, action);
    },
    getState: () => {
      return state;
    }
  }
}
const store = createStore(reducer);
store.dispatch({ type: CREATE_NOTE });
store.dispatch({ type: UPDATE_NOTE, id: 1, content: 'Hello, world!' });
console.log('store.getState()', store.getState());
```

使用上面的方式，我们可以拥有一个能使用任意`reducer`来管理状态的存储库。但是上面的`store`缺少一个关键的功能，就是当修改后，使用该状态的组件不能及时更新。也就是缺少**订阅状态变更的机制**。如果不使用该机制，而是使用命令方式进行更新的话，是非常不友好的。

```js
const createStore = (reducer) => {
  let state = undefined;
  const subscribers = [];
  const store = {
    dispatch: (action) => {
      state = reducer(state, action);
      subscribers.forEach(handler => handler());
    },
    getState: () => {
      return state;
    },
    subscribe: handler => {
      subscribers.push(handler);
      return () => {
        const newIndex = subscribers.indexOf(handler)
        if(newIndex > -1) {
          subscribers.splice(newIndex, 1);
        }
      }
    }
  };
  // 传入一个任意类型的action，来初始化状态
  store.dispatch({type: '@@redux/INIT'});
  return store;
}

const store = createStore(reducer);

// 初始化渲染
Deact.render(
  Deact.createElement('div', null, JSON.stringify(store.getState())),
  document.getElementById('root')
);
store.subscribe(() => {
  console.log('subscribe', store.getState());
  Deact.render(
    Deact.createElement('div', null, JSON.stringify(store.getState())),
    document.getElementById('root')
  );
});

setTimeout(() => {
  store.dispatch({ type: UPDATE_NOTE, id: 1, content: 'Hello, world!' });
}, 2000);
```

将上面的代码渲染在页面上，可以看到在初始化渲染完成之后，使用定时器在2000毫秒之后修改状态值，页面也更新为了最新的状态值。

## Bring Your own Components

一般情况下，我们只需要使用过组件内部的状态，那么什么时候需要使用`Redux`状态库呢？只需要考虑下面的问题：
> 状态是否需要在组件卸载之后继续存在
如果上面的答案是否定的，那么组件状态可能是最合适的选择。对于需要持久化到服务器或者需要在多个独立挂载和卸载的组件之间共享的状态，那么使用`Redux`可能是更好的选择。

```js
const NoteApp = function(props) {
  console.log('NoteApp', props);
  const len = Object.keys(props.notes).length;

  const notes = len > 0 ? Object.keys(props.notes).map(id => (
    Deact.createElement('li', { key: id }, props.notes[id].content)
  )) : [];
  return Deact.createElement('div', null,
    Deact.createElement('ul', null, ...notes),
    Deact.createElement('button', { onClick: props.onAddNote }, 'Add Note')
  );
}

const NoteContainer = function(props) {
  const [state, setState] = Deact.useState(props.store.getState());
  console.log('NoteContainer', state);

  Deact.useEffect(() => {
    console.log('useEffect', props.store.getState());
    const unsubscribe = props.store.subscribe(() => {
      console.log('callback subscribe', props.store.getState());
      setState(() => { 
        console.log('setState', props.store.getState());
        return props.store.getState();
      });
    });
    return () => {
      unsubscribe();
    };
  }, [props.store.getState()]);

  const onAddNote = () => {
    props.store.dispatch({ type: CREATE_NOTE });
    console.log('onAddNote', props.store.getState());
  };
  return Deact.createElement(NoteApp, { notes: state.notes, onAddNote });
}

const store = createStore(reducer);
Deact.render(Deact.createElement(NoteContainer, { store }), document.getElementById('root'));
```

在上面实现组件实现中，我们将状态值`state`作为属性值传入组件，子组件可以对其值进行渲染，但是我们可以注意到`NoteContainer`组件没有实际的作用，它的主要作用是添加状态值，以及对状态值进行`subscribe`、`unsubscribe`操作。如果我们使用的每个组件都需要使用`container`进行包裹的话，无疑是很麻烦的。我们接下来需要解决这个问题...

## `Provider and Connect`

上面的试实现可以使用，但是仍然有一些问题：

- 需要创建重复的`container`容器代码
- 每次想要用`store`与某个组件链接的时候，都必须使用全局`store`对象，或者我们需要将`store`属性传递给整个组件树，这种写法在大型应用中不是理想的.

那就是为什么我们需要使用`React Redux`中的`Provider`和`connect`。

```js
const Provider = function(props) {
  return Deact.createElement(Deact.Provider, 
    { value: props.store },
    props.children
  );
}
```

上面的`Provider`组件利用了`React`的上下文功能，将`store`转换为上下文`context`属性。上下文`context`是一种将信息从顶层组件传毒给子组件的方式，中间组件无需显式传递属性。`Provider`只提供了状态的传递，我们还需要一个组件来实现状态值改变的订阅等操作.

```js
const StoreContext = Deact.createContext(null);

const Connect = (mapStateToProps, mapDispatchToProps) => {
  return (WrappedComponent) => {
    return function(props) {
      const store = Deact.useContext(StoreContext);
      
      // 使用 useRef 保存最新的 props 和映射函数，以便在订阅回调中使用
      const propsRef = Deact.useRef(props);
      const mapStateToPropsRef = Deact.useRef(mapStateToProps);
      const mapDispatchToPropsRef = Deact.useRef(mapDispatchToProps);
      
      // 更新 ref 的值，确保订阅回调中总是使用最新的值
      propsRef.current = props;
      mapStateToPropsRef.current = mapStateToProps;
      mapDispatchToPropsRef.current = mapDispatchToProps;
      
      // 计算当前的 props
      const currentState = store.getState();
      const stateProps = mapStateToProps(currentState, props);
      const dispatchProps = mapDispatchToProps(store.dispatch, props);
      
      // 使用 useState 来存储一个强制更新的计数器
      // 当 store 变化时，递增计数器，触发组件重新渲染
      const [updateCount, setUpdateCount] = Deact.useState(0);

      // 订阅 store 的变化
      Deact.useEffect(() => {
        const unsubscribe = store.subscribe(() => {
          setUpdateCount(prev => prev + 1);
        });
        return () => {
          unsubscribe();
        };
      }, []);

      // 每次渲染时，重新计算并直接传递给子组件
      const mergedProps = { ...stateProps, ...dispatchProps };

      return Deact.createElement(WrappedComponent, {...mergedProps});
    }
  }
}
const mapStateToProps = (state) => {
  return {
    notes: state.notes,
    openNoteId: state.openNoteId
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    onAddNote: () => dispatch({ type: CREATE_NOTE }),
    onOpenNote: (id) => dispatch({ type: OPEN_NOTE, id }),
    onCloseNote: () => dispatch({ type: CLOSE_NOTE }),
  }
}
const NoteAppContainer = Connect(mapStateToProps, mapDispatchToProps)(NoteApp);
console.log('NoteAppContainer', NoteAppContainer);
Deact.render(
  Deact.createElement(
    StoreContext.Provider, 
    { 
      value: store 
    }, 
    Deact.createElement(NoteAppContainer)
  ), 
  document.getElementById('root')
);
```

在上面的代码中，实现了一个`Connect`组件，向该函数传入两个映射函数，一个将`state`映射为`props`中的属性，一个将`dispatch`映射为`props`中的方法，然后传入一个需要被包裹的组件，执行完成后会返回一个组件函数，在该函数内有被映射的属性以及方法，还有最重要的就是，对`store`修改添加订阅更新事件`subscribe`
