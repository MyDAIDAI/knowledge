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

