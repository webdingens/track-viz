import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import currentTrackReducer from './reducers/currentTrackSlice';

export default configureStore({
  reducer: {
    counter: counterReducer,
    currentTrack: currentTrackReducer
  },
});
