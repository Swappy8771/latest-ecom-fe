import { baseApi } from './baseApi';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Address {
  id:         string;
  label:      string;
  fullName:   string;
  phone:      string;
  line1:      string;
  line2:      string;
  city:       string;
  state:      string;
  postalCode: string;
  country:    string;
  isDefault:  boolean;
  createdAt:  string;
  updatedAt:  string;
}

export interface AddressBody {
  label?:      string;
  fullName:    string;
  phone:       string;
  line1:       string;
  line2?:      string;
  city:        string;
  state:       string;
  postalCode:  string;
  country:     string;
  isDefault?:  boolean;
}

export type UpdateAddressBody = Partial<AddressBody>;

// ── API slice ─────────────────────────────────────────────────────────────────

export const addressApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    // GET /addresses  — sorted: default first, then newest
    listAddresses: build.query<{ addresses: Address[] }, void>({
      query: () => '/addresses',
      providesTags: (res) =>
        res
          ? [
              ...res.addresses.map((a) => ({ type: 'Address' as const, id: a.id })),
              { type: 'Address', id: 'LIST' },
            ]
          : [{ type: 'Address', id: 'LIST' }],
    }),

    // POST /addresses
    createAddress: build.mutation<{ message: string; address: Address }, AddressBody>({
      query: (body) => ({ url: '/addresses', method: 'POST', body }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),

    // PATCH /addresses/:id
    updateAddress: build.mutation<{ message: string; address: Address }, { id: string } & UpdateAddressBody>({
      query: ({ id, ...body }) => ({ url: `/addresses/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Address', id },
        { type: 'Address', id: 'LIST' },
      ],
    }),

    // DELETE /addresses/:id  — auto-promotes newest as default if deleted was default
    deleteAddress: build.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/addresses/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),

    // PATCH /addresses/:id/default  — unsets all others, sets this as default
    setDefaultAddress: build.mutation<{ message: string; address: Address }, string>({
      query: (id) => ({ url: `/addresses/${id}/default`, method: 'PATCH' }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} = addressApi;
