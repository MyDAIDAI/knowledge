// const CREATE_NOTE = 'CREATE_NOTE';
// const UPDATE_NOTE = 'UPDATE_NOTE';

// const initialState = {
//   nextNoteId: 1,
//   notes: {}
// };

// const reducer = (state = initialState, action) => {
//   switch (action.type) {
//     case CREATE_NOTE:
//       // change the state
//       return;
//     case UPDATE_NOTE:
//       // change the state
//       return;
//     default:
//       return state;
//   }
// };

// const handlers = {
//   [CREATE_NOTE]: (state) => {
//     return;
//   },
//   [UPDATE_NOTE]: (state) => {
//     return;
//   }
// };

// const reducer = (state = initialState, action) => {
//   const handler = handlers[action.type];
//   if (handler) {
//     return handler(state, action);
//   }
//   return state;
// };

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

// const state0 = reducer(undefined, {
//   type: CREATE_NOTE
// });
// console.log(state0);

// const state1 = reducer(state0, {
//   type: UPDATE_NOTE,
//   id: 1,
//   content: 'Hello, world!'
// });

// const actions = [
//   { type: CREATE_NOTE },
//   { type: UPDATE_NOTE, id: 1, content: 'Hello, world!' },
// ]
// const state2 = actions.reduce(reducer, undefined);

// Deact.render(
//   Deact.createElement('div', null, JSON.stringify(state2)),
//   document.getElementById('root')
// );

const createStore = (reducer, middleware) => {
  let state = undefined;
  const subscribers = [];

  const coreDispatch = (action) => {
    state = reducer(state, action);
    subscribers.forEach(handler => handler());
  }

  const getState = () => {
    return state;
  }

  const store = {
    dispatch: coreDispatch,
    getState,
    subscribe: handler => {
      subscribers.push(handler);
      console.log('subscribe', subscribers);
      return () => {
        const newIndex = subscribers.indexOf(handler)
        if(newIndex > -1) {
          subscribers.splice(newIndex, 1);
        }
      }
    }
  };

  if(middleware) {
    const dispatch = action => store.dispatch(action);
    store.dispatch = middleware({
      dispatch,
      getState
    })(coreDispatch);
    console.log('store.dispatch', store.dispatch);
  }

  // 传入一个任意类型的action，来初始化状态
  coreDispatch({type: '@@redux/INIT'});
  return store;
}


// 初始化渲染
// Deact.render(
//   Deact.createElement('div', null, JSON.stringify(store.getState())),
//   document.getElementById('root')
// );
// store.subscribe(() => {
//   console.log('subscribe', store.getState());
//   Deact.render(
//     Deact.createElement('div', null, JSON.stringify(store.getState())),
//     document.getElementById('root')
//   );
// });

// setTimeout(() => {
//   store.dispatch({ type: UPDATE_NOTE, id: 1, content: 'Hello, world!' });
// }, 2000);

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

  // 注意📢：这个地方的useEffect加不加依赖值的问题
  // TODO: 2026-01-08 23:05 需要再研究下加不加依赖值的区别
  // TODO: 2026-01-12 09:24 需要对比下原生react的下的实现方式
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



const delayMiddleware = ({dispatch}) => coreDispatch => action => {
  console.log('delayMiddleware dispatch', dispatch);
  console.log('delayMiddleware', action, coreDispatch);
  coreDispatch(action);
};

const loggingMiddleware = ({getState}) => coreDispatch => action => {
  console.info('before', getState());
  console.info('action', action, coreDispatch);
  const result = coreDispatch(action);
  console.info('after', getState());
  return result;
};

const applyMiddleware = (...middlewares) => store => {
  if (middlewares.length === 0) {
    return (next) => next;
  }
  const chain = middlewares.map(middleware => middleware(store));
  console.log('chain', chain);
  const result = (next) => chain.reduce((a, b) => {
    console.log('applyMiddleware', a, b, b(next), a(b(next)));
    return a(b(next));
  });
  console.log('result', result);
  return result;
};
const store = createStore(reducer, applyMiddleware(delayMiddleware, loggingMiddleware));
// Deact.render(Deact.createElement(NoteContainer, { store }), document.getElementById('root'));



const StoreContext = Deact.createContext(null);

const Connect = (mapStateToProps, mapDispatchToProps) => {
  return (WrappedComponent) => {
    return function(props) {
      const store = Deact.useContext(StoreContext);
      console.log('Connect', store.getState());
      
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
      console.log('stateProps', stateProps);
      console.log('dispatchProps', dispatchProps);
      
      // 使用 useState 来存储一个强制更新的计数器
      // 当 store 变化时，递增计数器，触发组件重新渲染
      const [updateCount, setUpdateCount] = Deact.useState(0);

      // 订阅 store 的变化
      Deact.useEffect(() => {
        const unsubscribe = store.subscribe(() => {
          // 当 store 变化时，强制组件重新渲染
          // 在重新渲染时，会重新计算 stateProps 和 dispatchProps
          console.log('store changed, forcing update');
          setUpdateCount(prev => prev + 1);
        });
        return () => {
          unsubscribe();
        };
      }, []); // 空依赖数组，只在组件挂载时订阅一次

      // 每次渲染时，重新计算并直接传递给子组件
      const mergedProps = { ...stateProps, ...dispatchProps };
      console.log('mergedProps', mergedProps);

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
Deact.render(Deact.createElement(StoreContext.Provider, { value: store }, Deact.createElement(NoteAppContainer)), document.getElementById('root'));

