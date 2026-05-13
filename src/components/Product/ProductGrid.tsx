import type { Product } from '../../services/productApi';
import ProductCard from './ProductCard';

interface Props {
  products:  Product[];
  isLoading: boolean;
}

function SkeletonCard() {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden animate-pulse">
      <div className="aspect-square bg-zinc-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-zinc-200 rounded w-1/3" />
        <div className="h-4 bg-zinc-200 rounded w-full" />
        <div className="h-4 bg-zinc-200 rounded w-2/3" />
        <div className="h-5 bg-zinc-200 rounded w-1/2 mt-2" />
      </div>
    </div>
  );
}

export default function ProductGrid({ products, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-zinc-700">No products found</h3>
        <p className="text-sm text-zinc-500 mt-1">Try adjusting your filters or search term.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
