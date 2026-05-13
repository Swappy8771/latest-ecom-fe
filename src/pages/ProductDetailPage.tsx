import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import PriceDisplay from '../components/Product/PriceDisplay';
import RatingStars from '../components/Product/RatingStars';
import StockBadge from '../components/Product/StockBadge';
import { useGetProductQuery } from '../services/productApi';

const BASE_ORIGIN = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api').replace('/api', '');

function resolveImg(url: string) {
  if (!url) return url;
  if (url.startsWith('http')) return url;
  return BASE_ORIGIN + url;
}

export default function ProductDetailPage() {
  const { id }            = useParams<{ id: string }>();
  const navigate          = useNavigate();
  const [activeImg, setActiveImg] = useState(0);

  const { data, isLoading, isError } = useGetProductQuery(id ?? '', { skip: !id });
  const product = data?.product;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
          <div className="grid md:grid-cols-2 gap-10 animate-pulse">
            <div className="aspect-square rounded-2xl bg-zinc-200" />
            <div className="space-y-4">
              <div className="h-8 bg-zinc-200 rounded w-3/4" />
              <div className="h-5 bg-zinc-200 rounded w-1/3" />
              <div className="h-6 bg-zinc-200 rounded w-1/2" />
              <div className="h-32 bg-zinc-200 rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="text-5xl">😕</div>
          <h2 className="text-xl font-semibold text-zinc-700">Product not found</h2>
          <button
            onClick={() => navigate('/products')}
            className="text-violet-600 hover:underline text-sm"
          >
            ← Back to products
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : [];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-zinc-400 mb-6">
          <Link to="/" className="hover:text-violet-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-violet-600 transition-colors">Products</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                to={`/products?categorySlug=${product.category.slug}`}
                className="hover:text-violet-600 transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-zinc-600 truncate max-w-48">{product.title}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-zinc-100 shadow-sm">
              {images.length > 0 ? (
                <img
                  src={resolveImg(images[activeImg])}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-300 text-7xl">📦</div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === activeImg ? 'border-violet-500' : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <img src={resolveImg(url)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">
            {/* Brand + title */}
            <div>
              {product.brand && (
                <Link
                  to={`/products?brandSlug=${product.brand.slug}`}
                  className="text-sm text-violet-600 hover:underline font-medium uppercase tracking-wide"
                >
                  {product.brand.name}
                </Link>
              )}
              <h1 className="text-2xl font-bold text-zinc-900 mt-1 leading-snug">{product.title}</h1>
            </div>

            {/* Rating */}
            {product.ratingCount > 0 && (
              <RatingStars avg={product.ratingAvg} count={product.ratingCount} />
            )}

            {/* Price */}
            <PriceDisplay
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              size="lg"
            />

            {/* Stock */}
            <div className="flex items-center gap-3">
              <StockBadge stock={product.stock} lowStockThreshold={product.lowStockThreshold} />
              {product.sku && (
                <span className="text-xs text-zinc-400">SKU: {product.sku}</span>
              )}
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Add to cart placeholder */}
            <div className="pt-2">
              <button
                disabled={product.stock === 0}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="border-t border-zinc-100 pt-5">
                <h2 className="text-sm font-semibold text-zinc-700 mb-2">Description</h2>
                <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Meta */}
            <div className="border-t border-zinc-100 pt-5 grid grid-cols-2 gap-y-2 text-sm">
              {product.category && (
                <>
                  <span className="text-zinc-400">Category</span>
                  <Link
                    to={`/products?categorySlug=${product.category.slug}`}
                    className="text-violet-600 hover:underline font-medium"
                  >
                    {product.category.name}
                  </Link>
                </>
              )}
              <span className="text-zinc-400">Listed</span>
              <span className="text-zinc-700">{new Date(product.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
