import { useState } from 'react';
import type { Category, Brand } from '../../services/productApi';

interface Filters {
  q:            string;
  categorySlug: string;
  brandSlug:    string;
  minPrice:     string;
  maxPrice:     string;
}

interface Props {
  filters:      Filters;
  categories:   Category[];
  brands:       Brand[];
  onApply:      (f: Filters) => void;
  onReset:      () => void;
}

export default function FilterSidebar({ filters, categories, brands, onApply, onReset }: Props) {
  const [local, setLocal] = useState<Filters>(filters);

  function set<K extends keyof Filters>(key: K, val: Filters[K]) {
    setLocal((prev) => ({ ...prev, [key]: val }));
  }

  function handleApply() {
    onApply(local);
  }

  function handleReset() {
    const empty: Filters = { q: '', categorySlug: '', brandSlug: '', minPrice: '', maxPrice: '' };
    setLocal(empty);
    onReset();
  }

  return (
    <aside className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
          Search
        </label>
        <input
          type="text"
          value={local.q}
          onChange={(e) => set('q', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          placeholder="Search products…"
          className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
          Category
        </label>
        <select
          value={local.categorySlug}
          onChange={(e) => set('categorySlug', e.target.value)}
          className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Brand */}
      <div>
        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
          Brand
        </label>
        <select
          value={local.brandSlug}
          onChange={(e) => set('brandSlug', e.target.value)}
          className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
        >
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.slug}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Price range */}
      <div>
        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
          Price range (₹)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={local.minPrice}
            onChange={(e) => set('minPrice', e.target.value)}
            placeholder="Min"
            min={0}
            className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <span className="text-zinc-400 text-sm">–</span>
          <input
            type="number"
            value={local.maxPrice}
            onChange={(e) => set('maxPrice', e.target.value)}
            placeholder="Max"
            min={0}
            className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleApply}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2 rounded-xl transition-colors"
        >
          Apply filters
        </button>
        <button
          onClick={handleReset}
          className="w-full border border-zinc-200 hover:bg-zinc-50 text-zinc-600 text-sm font-medium py-2 rounded-xl transition-colors"
        >
          Reset
        </button>
      </div>
    </aside>
  );
}
