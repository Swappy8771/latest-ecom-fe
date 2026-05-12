import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'USER' | 'SELLER' | 'ADMIN';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isVerifiedSeller?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean; // true while we're validating the stored token on startup
}

// Purge empty-string tokens left by failed/partial OAuth flows
const rawToken    = localStorage.getItem('accessToken');
const storedToken = rawToken && rawToken.length > 0 ? rawToken : null;
if (!storedToken && rawToken !== null) localStorage.removeItem('accessToken');

const initialState: AuthState = {
  user: null,
  accessToken: storedToken || null,
  // Don't consider authenticated until token is validated via /auth/me
  isAuthenticated: false,
  isInitializing: !!storedToken, // only need to initialize if there's a stored token
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: AuthUser; accessToken: string }>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken || null;
      state.isAuthenticated = !!(action.payload.accessToken && action.payload.user);
      state.isInitializing = false;
      if (action.payload.accessToken) {
        localStorage.setItem('accessToken', action.payload.accessToken);
      } else {
        localStorage.removeItem('accessToken');
      }
    },
    updateUser(state, action: PayloadAction<Partial<AuthUser>>) {
      if (state.user) state.user = { ...state.user, ...action.payload };
    },
    // Called after /auth/me succeeds on startup
    finishInitializing(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isInitializing = false;
    },
    // Called after /auth/me fails on startup (expired / invalid token)
    clearInvalidToken(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
      localStorage.removeItem('accessToken');
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
      localStorage.removeItem('accessToken');
    },
  },
});

export const { setCredentials, updateUser, logout, finishInitializing, clearInvalidToken } = authSlice.actions;
export default authSlice.reducer;
