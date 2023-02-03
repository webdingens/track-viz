import { configureStore, combineReducers } from "@reduxjs/toolkit";
import currentTrackReducer from "./reducers/currentTrackSlice";
import currentSequenceReducer from "./reducers/currentSequenceSlice";
import interactionStateSlice from "./reducers/interactionStateSlice";
import animatingTrackReducer from "./reducers/animatingTrackSlice";
import settingsGeneralReducer from "./reducers/settingsGeneralSlice";
import settingsTrackReducer from "./reducers/settingsTrackSlice";
import settingsTrack3DReducer from "./reducers/settingsTrack3DSlice";
import currentLibraryReducer from "./reducers/currentLibrarySlice";
import editedLibraryReducer from "./reducers/editedLibrarySlice";
import startPersistingStore from "./storePersistence";

let store = configureStore({
  reducer: {
    currentTrack: currentTrackReducer,
    currentSequence: currentSequenceReducer,
    currentLibrary: currentLibraryReducer,
    interactionState: interactionStateSlice,
    editedLibrary: editedLibraryReducer,
    animatingTrack: animatingTrackReducer,
    settings: combineReducers({
      general: settingsGeneralReducer,
      track: settingsTrackReducer,
      track3D: settingsTrack3DReducer,
    }),
  },
});

startPersistingStore(store);

window.store = store;

export default store;
