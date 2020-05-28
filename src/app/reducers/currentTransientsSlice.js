import { createSlice } from '@reduxjs/toolkit';

export const defaultTransients = {
  userIsInteractingWithTrack3D: false,
};

export const currentTransientsSlice = createSlice({
  name: 'currentTransients',
  initialState: defaultTransients,
  reducers: {
    setUserIsInteractingWithTrack3D: (state, action) => {
      state.userIsInteractingWithTrack3D = action.payload;
    },
    reset: (state) => {
      state = defaultTransients;
    },
  },
});

export const { setUserIsInteractingWithTrack3D, reset } = currentTransientsSlice.actions;

export const selectCurrentTransients = state => state.currentTransients;
export const selectUserIsInteractingWithTrack3D = state => state.currentTransients.userIsInteractingWithTrack3D;

export default currentTransientsSlice.reducer;
