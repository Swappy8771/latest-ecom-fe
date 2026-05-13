import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import ProductGrid from '../components/Product/ProductGrid';
import FilterSidebar from '../components/Product/FilterSidebar';
import SortSelect from '../components/Product/SortSelect';
import {
  useListProductsQuery,
  useListCategoriesQuery,
  useListBrandsQuery,
  type ProductListParams,
} from '../services/productApi';

interface Filters {
  q:            string;
  categorySlug: string;
  brandSlug:    string;
  minPrice:     string;
  maxPrice:     string;
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialise filter state from URL so category/brand deep-links work
  const [filters, setFilters] = useState<Filters>({
    q:            searchParams.get('q')            ?? '',
    categorySlug: searchParams.get('categorySlug') ?? '',
    brandSlug:    searchParams.get('brandSlug')    ?? '',
    minPrice:     searchParams.get('minPrice')     ?? '',
    maxPrice:     searchParams.get('maxPrice')     ?? '',
  });
  const [sort, setSort]             = useState<ProductListParams['sort']>(
    (searchParams.get('sort') as ProductListParams['sort']) ?? 'newest',
  );
  const [page, setPage]             = useState(Number(searchParams.get('page') ?? 1));
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Keep URL in sync with state
  useEffect(() => {
    const p: Record<string, string> = { sort: sort ?? 'newest', page: String(page) };
    if (filters.q)            p.q            = filters.q;
    if (filters.categorySlug) p.categorySlug = filters.categorySlug;
    if (filters.brandSlug)    p.brandSlug    = filters.brandSlug;
    if (filters.minPrice)     p.minPrice     = filters.minPrice;
    if (filters.maxPrice)     p.maxPrice     = filters.maxPrice;
    setSearchParams(p, { replace: true });
  }, [filters, sort, page, setSearchParams]);

  const params: ProductListParams = {
    page,
    limit: 20,
    sort,
    ...(filters.q            && { q:            filters.q }),
    ...(filters.categorySlug && { categorySlug: filters.categorySlug }),
    ...(filters.brandSlug    && { brandSlug:    filters.brandSlug }),
    ...(filters.minPrice     && { minPrice:     Number(filters.minPrice) }),
    ...(filters.maxPrice     && { maxPrice:     Number(filters.maxPrice) }),
  };

  const { data, isFetching } = useListProductsQuery(params);
  const { data: catData }    = useListCategoriesQuery();
  const { data: brandData }  = useListBrandsQuery();

  const products   = data?.products      ?? [];
  const totalPages = data?.pages         ?? 1;
  const total      = data?.total         ?? 0;
  const categories = catData?.categories ?? [];
  const brands     = brandData?.brands   ?? [];

  function handleFiltersApply(f: Filters) {
    setFilters(f);
    setPage(1);
    setDrawerOpen(false);
  }

  function handleFiltersReset() {
    setFilters({ q: '', categorySlug: '', brandSlug: '', minPrice: '', maxPrice: '' });
    setPage(1);
    setDrawerOpen(false);
  }

  function handleSortChange(s: string) {
    setSort(s as ProductListParams['sort']);
    setPage(1);
  }

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              {filters.categorySlug
                ? categories.find((c) => c.slug === filters.categorySlug)?.name ?? 'Products'
                : filters.brandSlug
                ? brands.find((b) => b.slug === filters.brandSlug)?.name ?? 'Products'
                : 'All Products'}
            </h1>
            {!isFetching && (
              <p className="text-sm text-zinc-500 mt-0.5">{total.toLocaleString()} results</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 text-sm border border-zinc-200 rounded-xl px-3 py-2 bg-white hover:bg-zinc-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-violet-600 inline-block" />
              )}
            </button>

            <SortSelect value={sort ?? 'newest'} onChange={handleSortChange} />
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-5">
            {filters.q && (
              <Chip label={`"${filters.q}"`} onRemove={() => { setFilters((f) => ({ ...f, q: '' })); setPage(1); }} />
            )}
            {filters.categorySlug && (
              <Chip
                label={categories.find((c) => c.slug === filters.categorySlug)?.name ?? filters.categorySlug}
                onRemove={() => { setFilters((f) => ({ ...f, categorySlug: '' })); setPage(1); }}
              />
            )}
            {filters.brandSlug && (
              <Chip
                label={brands.find((b) => b.slug === filters.brandSlug)?.name ?? filters.brandSlug}
                onRemove={() => { setFilters((f) => ({ ...f, brandSlug: '' })); setPage(1); }}
              />
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <Chip
                label={`₹${filters.minPrice || '0'} – ₹${filters.maxPrice || '∞'}`}
                onRemove={() => { setFilters((f) => ({ ...f, minPrice: '', maxPrice: '' })); setPage(1); }}
              />
            )}
            <button
              onClick={handleFiltersReset}
              className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <div className="hidden lg:block w-60 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 sticky top-24">
              <FilterSidebar
                filters={filters}
                categories={categories}
                brands={brands}
                onApply={handleFiltersApply}
                onReset={handleFiltersReset}
              />
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            <ProductGrid products={products} isLoading={isFetching} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm border border-zinc-200 rounded-xl bg-white hover:bg-zinc-50 disabled:opacity-40 transition-colors"
                >
                  ← Prev
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const mid = Math.min(Math.max(page, 3), totalPages - 2);
                  const pg  = totalPages <= 5 ? i + 1 : mid - 2 + i;
                  return (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`w-9 h-9 text-sm rounded-xl border transition-colors ${
                        pg === page
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                      }`}
                    >
                      {pg}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm border border-zinc-200 rounded-xl bg-white hover:bg-zinc-50 disabled:opacity-40 transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-zinc-900">Filters</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <FilterSidebar
              filters={filters}
              categories={categories}
              brands={brands}
              onApply={handleFiltersApply}
              onReset={handleFiltersReset}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// ── Filter chip ───────────────────────────────────────────────────────────────

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs bg-violet-50 text-violet-700 border border-violet-200 rounded-full px-3 py-1 font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-violet-900 leading-none text-sm">×</button>
    </span>
  );
}
