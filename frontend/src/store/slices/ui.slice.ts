import { createSlice } from '@reduxjs/toolkit';

/**
 * Cross-component UI state. Currently used to coordinate the seller signup
 * modal so that any header/footer button (and the buyer area) can open it
 * without prop-drilling.
 */
export interface UiState {
  isSellerSignupOpen: boolean;
}

const initialState: UiState = {
  isSellerSignupOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openSellerSignup(state) {
      state.isSellerSignupOpen = true;
    },
    closeSellerSignup(state) {
      state.isSellerSignupOpen = false;
    },
  },
});

export const { openSellerSignup, closeSellerSignup } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
