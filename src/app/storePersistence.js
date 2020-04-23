/* 
  Thanks to Jam Creencia
  https://medium.com/@jrcreencia/persisting-redux-state-to-local-storage-f81eb0b90e7e
*/

import throttle from 'lodash/throttle';

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

export const loadSlice = (slice = 'sliceSkaters') => {
  let state = loadState();
  if (state && state.hasOwnProperty(slice)) {
    return state[slice];
  }
  return undefined;
}

export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('state', serializedState);
  } catch {
    // ignore write errors
  }
};

let stopPersistingStateCallback;

export const startPersistingState = (store) => {
  stopPersistingStateCallback = store.subscribe(throttle(() => {
    saveState(store.getState());
  }, 1000));
}

export const stopPersistingState = () => {
  if (stopPersistingStateCallback) stopPersistingStateCallback();
}

export default startPersistingState;