/* 
  Thanks to Jam Creencia
  https://medium.com/@jrcreencia/persisting-redux-state-to-local-storage-f81eb0b90e7e
*/

import throttle from "lodash/throttle";
import _ from "lodash";

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem("state");
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

export const loadSlice = (slice = "sliceSkaters") => {
  let state = loadState();
  return _.get(state, slice, {});
};

/*
 * Removes old properties and adds new default properties
 * to the loaded state
 */
export const cleanupSlice = (state, defaultState) => {
  if (state) {
    state = _.pick(state, _.keys(defaultState));
    state = Object.assign({}, defaultState, state);
  }
  return state;
};

export const loadSettingsFromQueryString = (state) => {
  if (window.location.search === "") return state;
  const querySettings = window.location.search
    .slice(1)
    .split("&")
    .map((entry) => entry.split("="))
    .reduce((prev, curr) => {
      if (Object.hasOwnProperty.call(state, curr[0])) {
        let value = curr[1];
        if (value === "1") value = true;
        if (value === "0") value = false;
        prev[curr[0]] = value;
      }
      return prev;
    }, {});
  Object.assign(state, querySettings);
  return state;
};

export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("state", serializedState);
  } catch {
    // ignore write errors
  }
};

let stopPersistingStateCallback;

export const startPersistingState = (store) => {
  stopPersistingStateCallback = store.subscribe(
    throttle(() => {
      saveState(store.getState());
    }, 1000)
  );
};

export const stopPersistingState = () => {
  if (stopPersistingStateCallback) stopPersistingStateCallback();
};

export default startPersistingState;
