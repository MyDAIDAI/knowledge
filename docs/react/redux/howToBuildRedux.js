const createStore = (reducer) => {
  let state;
  let subscribers = [];
  const store = {
    getState: () => state,
    dispatch: (action) => {
      state = reducer(state, action);
      subscribers.forEach(handler => handler());
    },
    subscribe: (handler) => {
      subscribers.push(handler);
      return () => {
        const index = subscribers.indexOf(handler);
        if (index !== -1) {
          subscribers.splice(index, 1);
        }
      }
    }
  }
  store.dispatch({type: '@@redux/INIT'});
  return store;
}

const CREATE_NOTE = 'CREATE_NOTE';
const UPDATE_NOTE = 'UPDATE_NOTE';

const initialState = {
  nextNoteId: 1,
  notes: {}
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_NOTE: {
      const id = state.nextNoteId;
      const newNote = {
        id,
        content: ''
      };
      return {
        ...state,
        nextNoteId: id + 1,
        notes: {
          ...state.notes,
          [id]: newNote
        }
      };
    }
    case UPDATE_NOTE: {
      const {id, content} = action;
      const editedNote = {
        ...state.notes[id],
        content
      };
      return {
        ...state,
        notes: {
          ...state.notes,
          [id]: editedNote
        }
      };
    }
    default:
      return state;
  }
};

const store = createStore(reducer);
console.log('store', store);

store.subscribe(() => {
  console.log('state changed', store.getState());
  Deact.render(Deact.createElement('div', { id: 'root' }, Deact.createElement('h1', null, store.getState().notes[1].content)), document.getElementById('root'));
});

store.dispatch({type: CREATE_NOTE});
store.dispatch({type: UPDATE_NOTE, id: 1, content: 'Hello, world!'});