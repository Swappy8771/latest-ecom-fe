import { Link } from 'react-router-dom';
import type { Product } from '../../services/productApi';
import PriceDisplay from './PriceDisplay';
import RatingStars from './RatingStars';

const BASE_ORIGIN = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api').replace('/api', '');

function resolveImg(url: string) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return BASE_ORIGIN + url;
}

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const img = product.images[0] ? resolveImg(product.images[0]) : null;
  const isOutOfStock = product.stock === 0;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group relative flex flex-col bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square bg-zinc-50 overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300 text-4xl">
            📦
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-sm font-semibold text-zinc-500">Out of stock</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1 p-3 flex-1">
        {product.brand && (
          <p className="text-xs text-zinc-400 uppercase tracking-wide truncate">{product.brand.name}</p>
        )}
        <h3 className="text-sm font-medium text-zinc-800 leading-snug line-clamp-2">{product.title}</h3>

        {product.ratingCount > 0 && (
          <RatingStars avg={product.ratingAvg} count={product.ratingCount} size="sm" />
        )}

        <div className="mt-auto pt-2">
          <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
        </div>
      </div>
    </Link>
  );
}
