import { baseApi } from './baseApi';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Category {
  id:        string;
  name:      string;
  slug:      string;
  isActive:  boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id:        string;
  name:      string;
  slug:      string;
  isActive:  boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id:                string;
  title:             string;
  description:       string;
  images:            string[];
  tags:              string[];
  category:          Category | null;
  brand:             Brand    | null;
  price:             number;
  compareAtPrice?:   number;
  stock:             number;
  reservedStock:     number;
  sku:               string;
  lowStockThreshold: number;
  status:            'DRAFT' | 'ACTIVE' | 'INACTIVE';
  seller:            string;
  ratingAvg:         number;
  ratingCount:       number;
  createdAt:         string;
  updatedAt:         string;
}

export interface ProductsPage {
  page:     number;
  limit:    number;
  total:    number;
  pages:    number;
  products: Product[];
}

export interface ProductListParams {
  page?:         number;
  limit?:        number;
  q?:            string;
  categorySlug?: string;
  brandSlug?:    string;
  minPrice?:     number;
  maxPrice?:     number;
  sort?:         'newest' | 'price_asc' | 'price_desc' | 'rating';
}

export interface ProductBody {
  title:              string;
  description?:       string;
  images?:            string[];
  tags?:              string[];
  categoryId?:        string;
  brandId?:           string;
  price:              number;
  compareAtPrice?:    number;
  stock:              number;
  sku?:               string;
  lowStockThreshold?: number;
  status?:            'DRAFT' | 'ACTIVE' | 'INACTIVE';
}

export interface UploadedFile {
  filename: string;
  url:      string;
  mimetype: string;
  size:     number;
}

function toQS(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
}

// ── API ───────────────────────────────────────────────────────────────────────

export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    // ── Catalog ──────────────────────────────────────────────────────────────

    listCategories: build.query<{ categories: Category[] }, void>({
      query: () => '/catalog/categories',
      providesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    listBrands: build.query<{ brands: Brand[] }, void>({
      query: () => '/catalog/brands',
      providesTags: [{ type: 'Brand', id: 'LIST' }],
    }),

    // ── Products ─────────────────────────────────────────────────────────────

    listProducts: build.query<ProductsPage, ProductListParams | void>({
      query: (params) => `/products${params ? toQS(params as Record<string, unknown>) : ''}`,
      providesTags: (res) =>
        res
          ? [
              ...res.products.map((p) => ({ type: 'Product' as const, id: p.id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    getProduct: build.query<{ product: Product }, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Product', id }],
    }),

    createProduct: build.mutation<{ message: string; product: Product }, ProductBody>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, { type: 'SellerProduct', id: 'LIST' }],
    }),

    updateProduct: build.mutation<{ message: string; product: Product }, { id: string } & Partial<ProductBody>>({
      query: ({ id, ...body }) => ({ url: `/products/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
        { type: 'SellerProduct', id: 'LIST' },
      ],
    }),

    deleteProduct: build.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, { type: 'SellerProduct', id: 'LIST' }],
    }),

    // ── Upload ────────────────────────────────────────────────────────────────

    uploadProductImage: build.mutation<{ message: string; file: UploadedFile }, FormData>({
      query: (body) => ({ url: '/uploads/product-image', method: 'POST', body }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useListCategoriesQuery,
  useListBrandsQuery,
  useListProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
} = productApi;
