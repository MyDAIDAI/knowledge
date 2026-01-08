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
