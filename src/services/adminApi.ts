import { baseApi } from './baseApi';

// ── Types ─────────────────────────────────────────────────────────────────────

export type UserRole           = 'USER' | 'SELLER' | 'ADMIN';
export type UserStatus         = 'ACTIVE' | 'PENDING' | 'SUSPENDED';
export type VerificationStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AdminUser {
  id:                 string;
  name:               string;
  email:              string;
  phone:              string;
  role:               UserRole;
  avatar:             string;
  isVerified:         boolean;
  status:             UserStatus;
  lastLogin:          string | null;
  verificationStatus: VerificationStatus;
  isVerifiedSeller:   boolean;
  businessName:       string;
  gstNumber:          string;
  createdAt:          string;
  updatedAt:          string;
}

// ── Paginated wrappers ────────────────────────────────────────────────────────

export interface UsersPage {
  page:  number; limit: number; total: number; pages: number;
  users: AdminUser[];
}

export interface SellersPage {
  page:  number; limit: number; total: number; pages: number;
  sellers: AdminUser[];
}

// ── Query param types ─────────────────────────────────────────────────────────

export interface ListUsersParams {
  page?:   number;
  limit?:  number;
  search?: string;
  role?:   UserRole;
  status?: UserStatus;
}

export interface ListSellersParams {
  page?:               number;
  limit?:              number;
  verificationStatus?: VerificationStatus;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toQS(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') q.set(k, String(v));
  }
  return q.toString();
}

// ── API slice ─────────────────────────────────────────────────────────────────

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    // GET /admin/users
    listAdminUsers: build.query<UsersPage, ListUsersParams | void>({
      query: (p = {}) => {
        const qs = toQS(p as Record<string, string | number | undefined>);
        return `/admin/users${qs ? `?${qs}` : ''}`;
      },
      providesTags: (res) =>
        res
          ? [...res.users.map((u) => ({ type: 'AdminUser' as const, id: u.id })), { type: 'AdminUser', id: 'LIST' }]
          : [{ type: 'AdminUser', id: 'LIST' }],
    }),

    // GET /admin/users/:id
    getAdminUser: build.query<{ user: AdminUser }, string>({
      query: (id) => `/admin/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'AdminUser', id }],
    }),

    // PATCH /admin/users/:id/status
    updateAdminUserStatus: build.mutation<{ message: string; user: AdminUser }, { id: string; status: UserStatus }>({
      query: ({ id, status }) => ({ url: `/admin/users/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'AdminUser', id }, { type: 'AdminUser', id: 'LIST' }],
    }),

    // PATCH /admin/users/:id/role
    updateAdminUserRole: build.mutation<{ message: string; user: AdminUser }, { id: string; role: UserRole }>({
      query: ({ id, role }) => ({ url: `/admin/users/${id}/role`, method: 'PATCH', body: { role } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'AdminUser', id }, { type: 'AdminUser', id: 'LIST' }],
    }),

    // GET /admin/sellers
    listAdminSellers: build.query<SellersPage, ListSellersParams | void>({
      query: (p = {}) => {
        const qs = toQS(p as Record<string, string | number | undefined>);
        return `/admin/sellers${qs ? `?${qs}` : ''}`;
      },
      providesTags: (res) =>
        res
          ? [...res.sellers.map((s) => ({ type: 'AdminSeller' as const, id: s.id })), { type: 'AdminSeller', id: 'LIST' }]
          : [{ type: 'AdminSeller', id: 'LIST' }],
    }),

    // PATCH /admin/sellers/:id/verification
    updateSellerVerification: build.mutation<{ message: string; seller: AdminUser }, { id: string; verificationStatus: VerificationStatus }>({
      query: ({ id, verificationStatus }) => ({ url: `/admin/sellers/${id}/verification`, method: 'PATCH', body: { verificationStatus } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'AdminSeller', id }, { type: 'AdminSeller', id: 'LIST' }],
    }),

    // PATCH /admin/sellers/:id/status
    updateSellerStatus: build.mutation<{ message: string; seller: AdminUser }, { id: string; status: 'ACTIVE' | 'SUSPENDED' }>({
      query: ({ id, status }) => ({ url: `/admin/sellers/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'AdminSeller', id }, { type: 'AdminSeller', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListAdminUsersQuery,
  useGetAdminUserQuery,
  useUpdateAdminUserStatusMutation,
  useUpdateAdminUserRoleMutation,
  useListAdminSellersQuery,
  useUpdateSellerVerificationMutation,
  useUpdateSellerStatusMutation,
} = adminApi;
