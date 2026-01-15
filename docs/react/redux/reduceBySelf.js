function createStore(reducer, middleware) {
  let state = null;
  const subscribers = [];

  const coreDispatch = (action) => {
    state = reducer(state, action);
    subscribers.forEach(handler => handler())
  }

  const subscribe = (handler) => {
    subscribers.push(handler);
    return () => {
      const index = subscribers.indexOf(handler);
      if(index > -1) {
        subscribers.splice(index, 1);
      }
    }
  }

  const getState = () => state;
  const store = {
    getState,
    dispatch: coreDispatch,
    subscribe,
  }

  if(middleware) {
    // 为了传入中间件函数内部也可以使用到包含左右中间件的dispatch函数而不是coreDispatch，所以需要新建一个dispatch函数
    // 利用 store.dispatch 的指向函数的引用来动态获取
    const dispatch = (action) => {
      console.log('dispatch', store.dispatch)
      return store.dispatch(action);
    }
    store.dispatch = middleware({
      dispatch: dispatch,
      getState
    })(coreDispatch);
  }

  return store;
}

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case 'ADD':
      return state + 1;
    case 'SUB':
      return state - 1;
    default:
      return state;
  }
}


// 加一个中间件
const delayMiddleware = ({dispatch, getState}) => next => action => {
  // 在中间件内部直接调用dispatch函数会造成死循环
  // dispatch(action)
  setTimeout(() => {
    console.log('delayMiddleware', dispatch, next, action);
    next(action)
  , 1000});
}

const loggingMiddleware = ({dispatch, getState}) => next => action => {
  console.log('loggingMiddleware before', getState());
  next(action);
  console.log('loggingMiddleware after', getState());
}

const thunkMiddleware = ({dispatch, getState}) => next => action => {
  if(typeof action === 'function') {
    return action(dispatch, getState);
  }
  return next(action);
}

// 将两个中间件或者多个中间件进行 compose
const applyMiddleware = (...middleware) => (store) => next => {
  if(middleware?.length === 0) {
    return (action) => next(action);
  }
  if(middleware?.length === 1) {
    return middleware[0](store)(next);
  }
  const list = middleware.map(fn => fn(store))
  const composeMiddleware = list.reduce((a, b) => {
    return a(b(next))
  })
  console.log('composeMiddleware', composeMiddleware)
  return (action) => composeMiddleware(action);
}


const initialState = 0;
const store = createStore(reducer, applyMiddleware(delayMiddleware, loggingMiddleware, thunkMiddleware));

store.subscribe(() => {
  console.log('subscribe', store.getState());
});
// store.dispatch 为包含中间件的dispatch
store.dispatch((dispatch) => {
  dispatch({type: 'ADD'})
});


console.log(store.getState());

