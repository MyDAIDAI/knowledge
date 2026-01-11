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

const createStore = (reducer) => {
  let state = undefined;
  const subscribers = [];
  const store = {
    dispatch: (action) => {
      state = reducer(state, action);
      console.log('state', state);
      subscribers.forEach(handler => handler());
    },
    getState: () => {
      return state;
    },
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
  // 传入一个任意类型的action，来初始化状态
  store.dispatch({type: '@@redux/INIT'});
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
  Deact.useEffect(() => {
    console.log('useEffect', props.store.getState());
    props.store.subscribe(() => {
      console.log('callback subscribe', props.store.getState());
      setState(() => { 
        console.log('setState', props.store.getState());
        return props.store.getState();
      });
    });
  }, [props.store.getState()]);

  const onAddNote = () => {
    props.store.dispatch({ type: CREATE_NOTE });
    console.log('onAddNote', props.store.getState());
  };
  return Deact.createElement(NoteApp, { notes: state.notes, onAddNote });
}

const store = createStore(reducer);
Deact.render(Deact.createElement(NoteContainer, { store }), document.getElementById('root'));