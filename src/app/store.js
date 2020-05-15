import { configureStore, combineReducers } from '@reduxjs/toolkit';
import currentTrackReducer from './reducers/currentTrackSlice';
import currentSequenceReducer from './reducers/currentSequenceSlice';
import settingsGeneralReducer from './reducers/settingsGeneralSlice';
import settingsTrack from './reducers/settingsTrackSlice';
import settingsTrack3D from './reducers/settingsTrack3DSlice';
import startPersistingStore from './storePersistence';

let store = configureStore({
  reducer: {
    currentTrack: currentTrackReducer,
    currentSequence: currentSequenceReducer,
    settings: combineReducers({
      general: settingsGeneralReducer,
      track: settingsTrack,
      track3D: settingsTrack3D
    })
  },
});

startPersistingStore(store);

window.store = store;

export default store;
