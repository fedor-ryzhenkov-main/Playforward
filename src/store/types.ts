import { PlayerState } from 'store/slices/playerSlice';

// Define root state type for the page-level store
export interface RootState {
  player: PlayerState;
} 