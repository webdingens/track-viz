import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import currentTrackReducer from './reducers/currentTrackSlice';
import settingsReducer from './reducers/settingsSlice';
import startPersistingStore from './storePersistence';

let store = configureStore({
  reducer: {
    counter: counterReducer,
    currentTrack: currentTrackReducer,
    settings: settingsReducer
  },
});

startPersistingStore(store);

window.store = store;

export default store;
