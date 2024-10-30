import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the serialized track type
export interface SerializedTrack {
  id: string;
  name: string;
  tags: string[];
  description?: string;
}

export interface PlayerState {
  // Track List State
  tracks: SerializedTrack[];
  allTags: string[];
  loading: boolean;
  error: string | null;
  searchName: string;
  searchTags: string;
  selectedTrackIndex: number;
  isTrackListFocused: boolean;
  
  // Audio Players State
  activePlayers: {
    [trackId: string]: {
      isPlaying: boolean;
      currentTime: number;
      duration: number;
      volume: number;
      isLooping: boolean;
      isFadeEffectActive: boolean;
    }
  };
  selectedPlayerId: string | null;

  // Modal State
  modalState: {
    isOpen: boolean;
    type: 'prompt' | 'confirm' | null;
    title: string;
    message: string;
    onConfirm?: () => void;
  };

  // Context Menu State
  contextMenu: {
    isOpen: boolean;
    x: number;
    y: number;
    items: Array<{
      label: string;
      action: () => void;
    }>;
  };
}

const initialState: PlayerState = {
  tracks: [],
  allTags: [],
  loading: false,
  error: null,
  searchName: '',
  searchTags: '',
  selectedTrackIndex: -1,
  isTrackListFocused: false,
  
  activePlayers: {},
  selectedPlayerId: null,

  modalState: {
    isOpen: false,
    type: null,
    title: '',
    message: '',
  },

  contextMenu: {
    isOpen: false,
    x: 0,
    y: 0,
    items: [],
  },
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    // Track List Actions
    setTracks: (state, action: PayloadAction<SerializedTrack[]>) => {
      state.tracks = action.payload;
    },
    setAllTags: (state, action: PayloadAction<string[]>) => {
      state.allTags = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSearchName: (state, action: PayloadAction<string>) => {
      state.searchName = action.payload;
    },
    setSearchTags: (state, action: PayloadAction<string>) => {
      state.searchTags = action.payload;
    },
    setSelectedTrackIndex: (state, action: PayloadAction<number>) => {
      state.selectedTrackIndex = action.payload;
    },
    setTrackListFocus: (state, action: PayloadAction<boolean>) => {
      state.isTrackListFocused = action.payload;
    },

    // Audio Player Actions
    addPlayer: (state, action: PayloadAction<string>) => {
      console.log('[playerSlice] Adding player:', action.payload);
      if (!state.activePlayers[action.payload]) {
        state.activePlayers[action.payload] = {
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          volume: 1,
          isLooping: false,
          isFadeEffectActive: false,
        };
        console.log('[playerSlice] Player state initialized');
      }
    },

    removePlayer: (state, action: PayloadAction<string>) => {
      delete state.activePlayers[action.payload];
      if (state.selectedPlayerId === action.payload) {
        state.selectedPlayerId = null;
      }
    },

    updatePlayerState: (state, action: PayloadAction<{
      trackId: string;
      updates: Partial<PlayerState['activePlayers'][string]>;
    }>) => {
      const { trackId, updates } = action.payload;
      if (state.activePlayers[trackId]) {
        state.activePlayers[trackId] = {
          ...state.activePlayers[trackId],
          ...updates,
        };
      }
    },
    setSelectedPlayer: (state, action: PayloadAction<string | null>) => {
      state.selectedPlayerId = action.payload;
    },

    // Modal Actions
    openModal: (state, action: PayloadAction<Omit<PlayerState['modalState'], 'isOpen'>>) => {
      state.modalState = {
        ...action.payload,
        isOpen: true,
      };
    },
    closeModal: (state) => {
      state.modalState = {
        ...initialState.modalState,
        isOpen: false,
      };
    },

    // Context Menu Actions
    openContextMenu: (state, action: PayloadAction<Omit<PlayerState['contextMenu'], 'isOpen'>>) => {
      state.contextMenu = {
        ...action.payload,
        isOpen: true,
      };
    },
    closeContextMenu: (state) => {
      state.contextMenu = initialState.contextMenu;
    },

    navigateTrack: (state, action: PayloadAction<'up' | 'down'>) => {
      const direction = action.payload;
      const totalTracks = state.tracks.length;
      
      if (totalTracks === 0) return;

      if (state.selectedTrackIndex === -1) {
        state.selectedTrackIndex = 0;
        return;
      }

      if (direction === 'up') {
        state.selectedTrackIndex = state.selectedTrackIndex > 0 
          ? state.selectedTrackIndex - 1 
          : totalTracks - 1;
      } else {
        state.selectedTrackIndex = state.selectedTrackIndex < totalTracks - 1 
          ? state.selectedTrackIndex + 1 
          : 0;
      }
    },

    selectTrack: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload < state.tracks.length) {
        state.selectedTrackIndex = action.payload;
      }
    },

    playSelectedTrack: (state) => {
      // This will be handled by a thunk
    },
  },
});

export const {
  // Track List Actions
  setTracks,
  setAllTags,
  setLoading,
  setError,
  setSearchName,
  setSearchTags,
  setSelectedTrackIndex,
  setTrackListFocus,

  // Audio Player Actions
  addPlayer,
  removePlayer,
  updatePlayerState,
  setSelectedPlayer,

  // Modal Actions
  openModal,
  closeModal,

  // Context Menu Actions
  openContextMenu,
  closeContextMenu,

  navigateTrack,
  selectTrack,
  playSelectedTrack,
} = playerSlice.actions;

export default playerSlice.reducer; 