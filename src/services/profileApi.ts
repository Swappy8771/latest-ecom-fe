import { baseApi } from './baseApi';

// ── Profile shape (all roles) ─────────────────────────────────────────────────

export interface UserProfile {
  id:                  string;
  name:                string;
  email:               string;
  phone:               string;
  role:                'USER' | 'SELLER' | 'ADMIN';
  avatar:              string;
  isVerified:          boolean;
  status:              'ACTIVE' | 'PENDING' | 'SUSPENDED';
  lastLogin:           string | null;
  createdAt:           string;
  updatedAt:           string;
  // Seller-only — null for USER / ADMIN
  businessName:        string | null;
  gstNumber:           string | null;
  verificationStatus:  'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  isVerifiedSeller:    boolean | null;
}

// ── Request shapes ────────────────────────────────────────────────────────────

export interface UpdateProfileBody {
  name?:   string;
  phone?:  string;
  avatar?: string;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword:     string;
}

export interface DeleteAccountBody {
  password: string;
}

// ── Injected endpoints ────────────────────────────────────────────────────────

export const profileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    // GET /profile
    getProfile: build.query<{ profile: UserProfile }, void>({
      query: () => '/profile',
      providesTags: ['Profile'],
    }),

    // PATCH /profile  — update name / phone / avatar
    updateProfile: build.mutation<{ message: string; profile: UserProfile }, UpdateProfileBody>({
      query: (body) => ({ url: '/profile', method: 'PATCH', body }),
      invalidatesTags: ['Profile'],
      // Optimistically patch the Redux auth user so the header avatar updates instantly
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          profileApi.util.updateQueryData('getProfile', undefined, (draft) => {
            if (body.name   !== undefined) draft.profile.name   = body.name;
            if (body.phone  !== undefined) draft.profile.phone  = body.phone;
            if (body.avatar !== undefined) draft.profile.avatar = body.avatar;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    // PATCH /profile/change-password
    // On success the backend clears all refresh tokens → caller should logout
    changePassword: build.mutation<{ message: string }, ChangePasswordBody>({
      query: (body) => ({ url: '/profile/change-password', method: 'PATCH', body }),
    }),

    // DELETE /profile  — soft-delete + PII anonymisation
    // On success the caller must clear Redux auth state
    deleteAccount: build.mutation<{ message: string }, DeleteAccountBody>({
      query: (body) => ({ url: '/profile', method: 'DELETE', body }),
      invalidatesTags: ['Profile'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} = profileApi;
