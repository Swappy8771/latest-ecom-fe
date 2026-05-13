import { baseApi } from './baseApi';
import type { AuthUser, UserRole } from '../features/auth/authSlice';

// ── Raw backend shapes ────────────────────────────────────────────────────────

interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isVerified?: boolean;
  status?: string;
  lastLogin?: string;
}

interface LoginRequest    { email: string; password: string }
interface RegisterRequest { name: string; email: string; password: string; role?: 'USER' | 'SELLER' }
interface ClerkSyncRequest { clerkToken: string }

interface RawLoginResponse    { message: string; accessToken: string; refreshToken: string; user: BackendUser }
interface RawRegisterResponse { message: string; user: BackendUser; devOtp?: string }
interface RawVerifyOtpResponse { message: string; user: BackendUser }
interface RawMeResponse       { user: BackendUser }

// ── Mapped frontend shapes ────────────────────────────────────────────────────

export interface LoginResponse    { message: string; accessToken: string; refreshToken: string; user: AuthUser }
export interface RegisterResponse { message: string; user: AuthUser; devOtp?: string }
export interface VerifyOtpResponse { message: string; user: AuthUser }

// Maps backend { id } → frontend { _id }
export function mapBackendUser(u: BackendUser): AuthUser {
  return {
    _id:              u.id,
    name:             u.name,
    email:            u.email,
    role:             u.role,
    avatar:           u.avatar,
    isVerified:       u.isVerified,
    isVerifiedSeller: u.role === 'SELLER' && u.isVerified,
    status:           u.status,
  };
}

// ── Injected endpoints ────────────────────────────────────────────────────────

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (raw: RawLoginResponse) => ({
        ...raw,
        user: mapBackendUser(raw.user),
      }),
    }),

    register: build.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      transformResponse: (raw: RawRegisterResponse) => ({
        ...raw,
        user: mapBackendUser(raw.user),
      }),
    }),

    verifyOtp: build.mutation<VerifyOtpResponse, { email: string; otp: string }>({
      query: (body) => ({ url: '/auth/verify-otp', method: 'POST', body }),
      transformResponse: (raw: RawVerifyOtpResponse) => ({
        ...raw,
        user: mapBackendUser(raw.user),
      }),
    }),

    // Send Clerk OAuth token → backend creates/finds user → returns our JWT
    clerkSync: build.mutation<LoginResponse, ClerkSyncRequest>({
      query: (body) => ({ url: '/auth/clerk', method: 'POST', body }),
      transformResponse: (raw: RawLoginResponse) => ({
        ...raw,
        user: mapBackendUser(raw.user),
      }),
    }),

    // Backend requires { refreshToken } in body to invalidate the server-side token
    logout: build.mutation<{ message: string }, { refreshToken: string }>({
      query: (body) => ({ url: '/auth/logout', method: 'POST', body }),
    }),

    getMe: build.query<{ user: AuthUser }, void>({
      query: () => '/auth/me',
      transformResponse: (raw: RawMeResponse) => ({ user: mapBackendUser(raw.user) }),
      providesTags: ['User'],
    }),

    forgotPassword: build.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),

    // Backend takes { token, password } in the body — NOT a URL param
    resetPassword: build.mutation<{ message: string }, { token: string; password: string }>({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useClerkSyncMutation,
  useLogoutMutation,
  useGetMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
