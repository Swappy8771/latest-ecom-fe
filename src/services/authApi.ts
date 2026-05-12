import { baseApi } from './baseApi';
import type { AuthUser } from '../features/auth/authSlice';

// ── Request / Response types ──────────────────────────────────────────────────

interface LoginRequest    { email: string; password: string }
interface RegisterRequest { name: string; email: string; password: string; role?: 'USER' | 'SELLER' }
interface AuthResponse    { user: AuthUser; accessToken: string; message: string }
interface ClerkSyncRequest { clerkToken: string }

// ── Injected endpoints ────────────────────────────────────────────────────────

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),

    register: build.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),

    // Send Clerk OAuth token → backend creates / finds user → returns our JWT
    clerkSync: build.mutation<AuthResponse, ClerkSyncRequest>({
      query: (body) => ({ url: '/auth/clerk', method: 'POST', body }),
    }),

    logout: build.mutation<{ message: string }, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),

    getMe: build.query<{ user: AuthUser }, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),

    forgotPassword: build.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),

    resetPassword: build.mutation<{ message: string }, { token: string; password: string }>({
      query: ({ token, ...body }) => ({ url: `/auth/reset-password/${token}`, method: 'POST', body }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useClerkSyncMutation,
  useLogoutMutation,
  useGetMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
