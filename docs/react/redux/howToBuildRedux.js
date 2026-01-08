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

const state0 = reducer(undefined, {
  type: CREATE_NOTE
});
console.log(state0);

const state1 = reducer(state0, {
  type: UPDATE_NOTE,
  id: 1,
  content: 'Hello, world!'
});

const actions = [
  { type: CREATE_NOTE },
  { type: UPDATE_NOTE, id: 1, content: 'Hello, world!' },
]
const state2 = actions.reduce(reducer, undefined);

Deact.render(
  Deact.createElement('div', null, JSON.stringify(state2)),
  document.getElementById('root')
);
