import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ContextMenuType = 
  | { type: 'default' }
  | { type: 'track'; action: 'view' | 'rename' | 'editDescription'; targetId: string };

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  menu: ContextMenuType;
}

const initialState: ContextMenuState = {
  isOpen: false,
  x: 0,
  y: 0,
  menu: { type: 'default' }
};

const contextMenuSlice = createSlice({
  name: 'contextMenu',
  initialState,
  reducers: {
    openContextMenu: (
      state,
      action: PayloadAction<{
        x: number;
        y: number;
        menu: ContextMenuType;
      }>
    ) => {
      state.isOpen = true;
      state.x = action.payload.x;
      state.y = action.payload.y;
      state.menu = action.payload.menu;
    },
    closeContextMenu: (state) => {
      state.isOpen = false;
      state.menu = { type: 'default' };
    },
  },
});

export const { openContextMenu, closeContextMenu } = contextMenuSlice.actions;
export default contextMenuSlice.reducer; 