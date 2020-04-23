import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import currentTrackReducer from './reducers/currentTrackSlice';
import startPersistingStore from './storePersistence';

let store = configureStore({
  reducer: {
    counter: counterReducer,
    currentTrack: currentTrackReducer
  },
});

startPersistingStore(store);

window.store = store;

export default store;
