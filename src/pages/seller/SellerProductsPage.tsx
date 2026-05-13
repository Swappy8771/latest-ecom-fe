import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PriceDisplay from '../../components/Product/PriceDisplay';
import StockBadge from '../../components/Product/StockBadge';
import {
  useListSellerProductsQuery,
  useUpdateSellerProductStatusMutation,
  type ProductStatus,
} from '../../services/sellerApi';
import { useDeleteProductMutation } from '../../services/productApi';

const BASE_ORIGIN = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api').replace('/api', '');

function resolveImg(url: string) {
  if (!url) return url;
  if (url.startsWith('http')) return url;
  return BASE_ORIGIN + url;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:   'bg-green-100 text-green-700',
  DRAFT:    'bg-zinc-100 text-zinc-600',
  INACTIVE: 'bg-red-100 text-red-600',
};

export default function SellerProductsPage() {
  const navigate = useNavigate();
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isFetching } = useListSellerProductsQuery({ page, limit: 20, status: status || undefined });
  const [updateStatus] = useUpdateSellerProductStatusMutation();
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();

  const products   = data?.products ?? [];
  const totalPages = data?.pages    ?? 1;
  const total      = data?.total    ?? 0;

  const filtered = search
    ? products.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    : products;

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      await updateStatus({ id, status: newStatus as 'DRAFT' | 'ACTIVE' | 'INACTIVE' }).unwrap();
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteProduct(deleteId).unwrap();
      toast.success('Product removed');
      setDeleteId(null);
    } catch {
      toast.error('Failed to remove product');
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">My Products</h1>
            <p className="text-sm text-zinc-500 mt-0.5">{total} products total</p>
          </div>
          <Link
            to="/seller/products/new"
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2"
          >
            + Add product
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="text-sm border border-zinc-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 w-64"
          />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as ProductStatus | ''); setPage(1); }}
            className="text-sm border border-zinc-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          {isFetching ? (
            <div className="divide-y divide-zinc-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                  <div className="w-12 h-12 rounded-lg bg-zinc-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-200 rounded w-1/2" />
                    <div className="h-3 bg-zinc-200 rounded w-1/4" />
                  </div>
                  <div className="h-4 bg-zinc-200 rounded w-20" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-5xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-zinc-700">No products yet</h3>
              <p className="text-sm text-zinc-500 mt-1 mb-6">Start selling by adding your first product.</p>
              <Link
                to="/seller/products/new"
                className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                Add product
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/50">
                      <th className="text-left font-semibold text-zinc-500 px-4 py-3">Product</th>
                      <th className="text-left font-semibold text-zinc-500 px-4 py-3">Price</th>
                      <th className="text-left font-semibold text-zinc-500 px-4 py-3">Stock</th>
                      <th className="text-left font-semibold text-zinc-500 px-4 py-3">Status</th>
                      <th className="text-right font-semibold text-zinc-500 px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filtered.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                        {/* Product */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                              {p.images[0] ? (
                                <img src={resolveImg(p.images[0])} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-300 text-lg">📦</div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-zinc-800 line-clamp-1">{p.title}</p>
                              {p.sku && <p className="text-xs text-zinc-400">SKU: {p.sku}</p>}
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3">
                          <PriceDisplay price={p.price} compareAtPrice={p.compareAtPrice} size="sm" />
                        </td>

                        {/* Stock */}
                        <td className="px-4 py-3">
                          <StockBadge stock={p.stock} lowStockThreshold={p.lowStockThreshold ?? 5} />
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <select
                            value={p.status}
                            onChange={(e) => handleStatusChange(p.id, e.target.value)}
                            className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer ${STATUS_COLORS[p.status] ?? ''}`}
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="DRAFT">Draft</option>
                            <option value="INACTIVE">Inactive</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/seller/products/${p.id}/edit`)}
                              className="text-xs font-medium text-violet-600 hover:text-violet-800 transition-colors px-2 py-1 rounded-lg hover:bg-violet-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteId(p.id)}
                              className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-zinc-100">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 disabled:opacity-40"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm text-zinc-500">Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Remove product?</h3>
            <p className="text-sm text-zinc-500 mb-6">
              The product will be set to Inactive and hidden from the store. This action can be reversed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                {deleting ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
