import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
}

const initialState: ContextMenuState = {
  isOpen: false,
  x: 0,
  y: 0,
};

const contextMenuSlice = createSlice({
  name: 'contextMenu',
  initialState,
  reducers: {
    openContextMenu: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.isOpen = true;
      state.x = action.payload.x;
      state.y = action.payload.y;
    },
    closeContextMenu: (state) => {
      state.isOpen = false;
    },
  },
});

export const { openContextMenu, closeContextMenu } = contextMenuSlice.actions;
export default contextMenuSlice.reducer; 