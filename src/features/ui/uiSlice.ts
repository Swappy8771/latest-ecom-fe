import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type ModalType = 'login' | 'register' | 'quickView' | 'confirmDelete' | null;

interface UiState {
  activeModal: ModalType;
  modalPayload: unknown;
  searchOpen: boolean;
  globalLoading: boolean;
}

const initialState: UiState = {
  activeModal: null,
  modalPayload: null,
  searchOpen: false,
  globalLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openModal(state, action: PayloadAction<{ type: ModalType; payload?: unknown }>) {
      state.activeModal = action.payload.type;
      state.modalPayload = action.payload.payload ?? null;
    },
    closeModal(state) {
      state.activeModal = null;
      state.modalPayload = null;
    },
    toggleSearch(state) {
      state.searchOpen = !state.searchOpen;
    },
    closeSearch(state) {
      state.searchOpen = false;
    },
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.globalLoading = action.payload;
    },
  },
});

export const { openModal, closeModal, toggleSearch, closeSearch, setGlobalLoading } = uiSlice.actions;
export default uiSlice.reducer;
