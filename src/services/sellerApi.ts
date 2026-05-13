import { baseApi } from './baseApi';

// ── Domain enums ──────────────────────────────────────────────────────────────

export type ProductStatus      = 'DRAFT' | 'ACTIVE' | 'INACTIVE';
export type OrderStatus        = 'PLACED' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type FulfillmentStatus  = 'PENDING' | 'ACCEPTED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NONE';

// ── Response shapes (backend uses `id`, not `_id`) ────────────────────────────

export interface SellerProfile {
  id:                 string;
  name:               string;
  email:              string;
  phone?:             string;
  role:               string;
  avatar?:            string;
  isVerified:         boolean;
  status:             string;
  businessName?:      string;
  gstNumber?:         string;
  verificationStatus: VerificationStatus;
  isVerifiedSeller:   boolean;
  createdAt:          string;
  updatedAt:          string;
}

export interface SellerProduct {
  id:                string;
  title:             string;
  description?:      string;
  images:            string[];
  category?:         string;
  brand?:            string;
  tags:              string[];
  price:             number;
  compareAtPrice?:   number;
  stock:             number;
  reservedStock:     number;
  sku?:              string;
  lowStockThreshold: number;
  status:            ProductStatus;
  createdAt:         string;
  updatedAt:         string;
}

export interface SellerOrderItem {
  product:           string;
  title:             string;
  price:             number;
  quantity:          number;
  fulfillmentStatus: FulfillmentStatus;
  lineTotal:         number;
}

export interface ShippingAddress {
  name:    string;
  line1:   string;
  line2?:  string;
  city:    string;
  state:   string;
  pincode: string;
  phone:   string;
}

export interface SellerOrder {
  id:              string;
  user:            string;
  items:           SellerOrderItem[];
  subtotal:        number;
  status:          OrderStatus;
  shippingAddress: ShippingAddress;
  createdAt:       string;
  updatedAt:       string;
}

// ── Paginated wrappers ────────────────────────────────────────────────────────

export interface ProductsPage {
  page:     number;
  limit:    number;
  total:    number;
  pages:    number;
  products: SellerProduct[];
}

export interface OrdersPage {
  page:   number;
  limit:  number;
  total:  number;
  pages:  number;
  orders: SellerOrder[];
}

// ── Bulk upload ───────────────────────────────────────────────────────────────

export interface BulkUploadError {
  row:     number;
  message: string;
}

export interface BulkUploadResult {
  message:       string;
  totalRows:     number;
  insertedCount: number;
  skippedCount:  number;
  errors:        BulkUploadError[];
  note:          string;
}

// ── Request param types ───────────────────────────────────────────────────────

export interface ListProductsParams {
  page?:   number;
  limit?:  number;
  status?: ProductStatus;
  q?:      string;
}

export interface ListOrdersParams {
  page?:   number;
  limit?:  number;
  status?: OrderStatus;
}

export interface UpdateProfileBody {
  businessName?: string;
  gstNumber?:    string;
  phone?:        string;
  avatar?:       string;
}

// ── API slice ─────────────────────────────────────────────────────────────────

export const sellerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    // GET /seller/me
    getSellerMe: build.query<{ seller: SellerProfile }, void>({
      query: () => '/seller/me',
      providesTags: ['SellerProfile'],
    }),

    // PATCH /seller/profile
    // Changing businessName or gstNumber drops verificationStatus back to PENDING
    updateSellerProfile: build.mutation<{ message: string; seller: SellerProfile }, UpdateProfileBody>({
      query: (body) => ({ url: '/seller/profile', method: 'PATCH', body }),
      invalidatesTags: ['SellerProfile'],
    }),

    // GET /seller/products?page=&limit=&status=&q=
    listSellerProducts: build.query<ProductsPage, ListProductsParams | void>({
      query: (params = {}) => {
        const q = new URLSearchParams();
        if (params && params.page  !== undefined) q.set('page',   String(params.page));
        if (params && params.limit !== undefined) q.set('limit',  String(params.limit));
        if (params && params.status)              q.set('status', params.status);
        if (params && params.q)                   q.set('q',      params.q);
        const qs = q.toString();
        return `/seller/products${qs ? `?${qs}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.products.map((p) => ({ type: 'SellerProduct' as const, id: p.id })),
              { type: 'SellerProduct', id: 'LIST' },
            ]
          : [{ type: 'SellerProduct', id: 'LIST' }],
    }),

    // PATCH /seller/products/:id/status
    updateSellerProductStatus: build.mutation<
      { message: string; product: SellerProduct },
      { id: string; status: ProductStatus }
    >({
      query: ({ id, status }) => ({
        url:    `/seller/products/${id}/status`,
        method: 'PATCH',
        body:   { status },
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'SellerProduct', id },
        { type: 'SellerProduct', id: 'LIST' },
      ],
    }),

    // GET /seller/orders?page=&limit=&status=
    listSellerOrders: build.query<OrdersPage, ListOrdersParams | void>({
      query: (params = {}) => {
        const q = new URLSearchParams();
        if (params && params.page  !== undefined) q.set('page',   String(params.page));
        if (params && params.limit !== undefined) q.set('limit',  String(params.limit));
        if (params && params.status)              q.set('status', params.status);
        const qs = q.toString();
        return `/seller/orders${qs ? `?${qs}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.orders.map((o) => ({ type: 'SellerOrder' as const, id: o.id })),
              { type: 'SellerOrder', id: 'LIST' },
            ]
          : [{ type: 'SellerOrder', id: 'LIST' }],
    }),

    // GET /seller/orders/:id
    getSellerOrder: build.query<{ order: SellerOrder }, string>({
      query: (id) => `/seller/orders/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'SellerOrder', id }],
    }),

    // PATCH /seller/orders/:id/items/:productId/status
    updateOrderItemStatus: build.mutation<
      { message: string; order: SellerOrder },
      { orderId: string; productId: string; fulfillmentStatus: FulfillmentStatus }
    >({
      query: ({ orderId, productId, fulfillmentStatus }) => ({
        url:    `/seller/orders/${orderId}/items/${productId}/status`,
        method: 'PATCH',
        body:   { fulfillmentStatus },
      }),
      invalidatesTags: (_res, _err, { orderId }) => [
        { type: 'SellerOrder', id: orderId },
        { type: 'SellerOrder', id: 'LIST' },
      ],
    }),

    // POST /seller/products/bulk-upload (multipart/form-data, field name: "file")
    bulkUploadProducts: build.mutation<BulkUploadResult, File>({
      query: (file) => {
        const body = new FormData();
        body.append('file', file);
        return { url: '/seller/products/bulk-upload', method: 'POST', body };
      },
      invalidatesTags: [{ type: 'SellerProduct', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSellerMeQuery,
  useUpdateSellerProfileMutation,
  useListSellerProductsQuery,
  useUpdateSellerProductStatusMutation,
  useListSellerOrdersQuery,
  useGetSellerOrderQuery,
  useUpdateOrderItemStatusMutation,
  useBulkUploadProductsMutation,
} = sellerApi;
