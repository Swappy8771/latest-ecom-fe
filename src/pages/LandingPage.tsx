import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

// ─── Static Data ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Electronics',   emoji: '📱', from: 'from-blue-500',    to: 'to-cyan-400',    glow: 'hover:shadow-blue-500/20',   count: '2.4K+', slug: 'electronics' },
  { name: 'Fashion',       emoji: '👗', from: 'from-pink-500',    to: 'to-rose-400',    glow: 'hover:shadow-pink-500/20',   count: '8.1K+', slug: 'fashion' },
  { name: 'Home & Living', emoji: '🛋️', from: 'from-amber-500',   to: 'to-orange-400',  glow: 'hover:shadow-amber-500/20',  count: '3.5K+', slug: 'home-living' },
  { name: 'Sports',        emoji: '⚽', from: 'from-emerald-500', to: 'to-green-400',   glow: 'hover:shadow-emerald-500/20',count: '1.2K+', slug: 'sports' },
  { name: 'Books',         emoji: '📚', from: 'from-violet-500',  to: 'to-purple-400',  glow: 'hover:shadow-violet-500/20', count: '5.6K+', slug: 'books' },
  { name: 'Beauty',        emoji: '💄', from: 'from-fuchsia-500', to: 'to-pink-400',    glow: 'hover:shadow-fuchsia-500/20',count: '2.8K+', slug: 'beauty' },
];

const PRODUCTS = [
  {
    id: 1, emoji: '🎧',
    name: 'Pro Wireless Headphones',
    price: 2999, original: 4999,
    rating: 4.5, reviews: 1204,
    imgFrom: 'from-slate-800', imgTo: 'to-slate-700',
    glowColor: 'hover:shadow-slate-400/10',
    badge: 'Best Seller', badgeColor: 'bg-amber-500',
  },
  {
    id: 2, emoji: '⌚',
    name: 'Smart Watch Series 5',
    price: 8499, original: 12999,
    rating: 4.8, reviews: 856,
    imgFrom: 'from-blue-900', imgTo: 'to-blue-800',
    glowColor: 'hover:shadow-blue-500/15',
    badge: 'New', badgeColor: 'bg-blue-500',
  },
  {
    id: 3, emoji: '👟',
    name: 'Running Sneakers Pro',
    price: 3299, original: 5499,
    rating: 4.3, reviews: 2341,
    imgFrom: 'from-emerald-900', imgTo: 'to-emerald-800',
    glowColor: 'hover:shadow-emerald-500/15',
    badge: 'Trending', badgeColor: 'bg-emerald-500',
  },
  {
    id: 4, emoji: '✨',
    name: 'Premium Skincare Kit',
    price: 1899, original: 2999,
    rating: 4.6, reviews: 643,
    imgFrom: 'from-purple-900', imgTo: 'to-purple-800',
    glowColor: 'hover:shadow-purple-500/15',
    badge: 'Sale', badgeColor: 'bg-red-500',
  },
];

const HERO_MINI_PRODUCTS = [
  { emoji: '🎧', name: 'Headphones', price: '₹2,999', color: 'from-slate-700 to-slate-600' },
  { emoji: '👟', name: 'Sneakers',   price: '₹3,299', color: 'from-emerald-900 to-emerald-800' },
  { emoji: '✨', name: 'Skincare',   price: '₹1,899', color: 'from-purple-900 to-purple-800' },
];

const STATS = [
  { value: '50K+',  label: 'Products Listed',   icon: '📦' },
  { value: '10K+',  label: 'Active Sellers',     icon: '🏪' },
  { value: '1M+',   label: 'Happy Customers',    icon: '😊' },
  { value: '4.8★',  label: 'Average Rating',     icon: '⭐' },
];

const FEATURES = [
  {
    icon: '🚀',
    title: 'Lightning Delivery',
    desc: '1–3 day shipping with real-time GPS tracking from warehouse to your door.',
    from: 'from-blue-500/15', to: 'to-cyan-500/15', border: 'border-blue-500/20', glow: 'hover:shadow-blue-500/10',
  },
  {
    icon: '🔒',
    title: 'Secure Payments',
    desc: '256-bit encryption on every transaction. Your financial data is never stored.',
    from: 'from-emerald-500/15', to: 'to-green-500/15', border: 'border-emerald-500/20', glow: 'hover:shadow-emerald-500/10',
  },
  {
    icon: '↩️',
    title: '30-Day Returns',
    desc: 'Hassle-free returns on anything within 30 days — no questions asked.',
    from: 'from-amber-500/15', to: 'to-orange-500/15', border: 'border-amber-500/20', glow: 'hover:shadow-amber-500/10',
  },
  {
    icon: '💬',
    title: '24 / 7 Support',
    desc: 'Real humans available around the clock via live chat, email, or phone.',
    from: 'from-violet-500/15', to: 'to-purple-500/15', border: 'border-violet-500/20', glow: 'hover:shadow-violet-500/10',
  },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma', role: 'Verified Buyer', initials: 'PS',
    avatarFrom: 'from-pink-500', avatarTo: 'to-rose-400',
    rating: 5,
    text: 'Absolutely love this platform! Product quality is outstanding and delivery was two days early. Will definitely be my go-to for online shopping.',
  },
  {
    name: 'Rahul Mehta', role: 'Verified Buyer', initials: 'RM',
    avatarFrom: 'from-blue-500', avatarTo: 'to-cyan-400',
    rating: 5,
    text: 'Best shopping experience I\'ve had online. The UI is gorgeous, checkout was buttery smooth, and the product matched exactly what was shown.',
  },
  {
    name: 'Ananya Kapoor', role: 'Verified Buyer', initials: 'AK',
    avatarFrom: 'from-violet-500', avatarTo: 'to-purple-400',
    rating: 5,
    text: 'Great variety across categories. Found exactly what I was looking for at a better price than anywhere else. Customer support was super helpful.',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sz = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`${sz} ${i <= Math.round(rating) ? 'text-amber-400' : 'text-slate-700'}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function discount(price: number, original: number) {
  return Math.round(((original - price) / original) * 100);
}

// ─── Countdown ────────────────────────────────────────────────────────────────

function useCountdown(hours: number) {
  const [target] = useState(() => Date.now() + hours * 3_600_000);
  const [time, setTime] = useState({ h: hours, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setTime({
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return time;
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border border-slate-700/60 shadow-xl flex items-center justify-center text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">{label}</span>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-950">
      {/* Background glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-violet-600/12 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-fuchsia-600/8 rounded-full blur-3xl" />
      </div>
      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid pointer-events-none opacity-60" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Left column ── */}
          <div className="space-y-8">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-sm font-medium backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse-dot shrink-0" />
              New Collection 2025 is Live
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold leading-[1.05] tracking-tight">
                <span className="text-white">Discover</span>
                <br />
                <span className="gradient-text">Everything</span>
                <br />
                <span className="text-white">You Love</span>
              </h1>
            </div>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-slate-400 max-w-md leading-relaxed">
              Shop thousands of curated products at unbeatable prices. Trusted sellers,
              blazing-fast delivery — all in one beautifully crafted marketplace.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-2xl transition-all duration-200 shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                Shop Now
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 text-slate-300 hover:text-white font-semibold rounded-2xl transition-all duration-200 hover:bg-slate-800 backdrop-blur-sm"
              >
                Explore Categories
              </Link>
            </div>

            {/* Social proof row */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex -space-x-2.5">
                {[
                  'from-violet-500 to-blue-500',
                  'from-pink-500 to-rose-400',
                  'from-emerald-500 to-cyan-400',
                  'from-amber-500 to-orange-400',
                ].map((g, i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-full border-2 border-slate-950 bg-gradient-to-br ${g} flex items-center justify-center text-xs font-bold text-white shadow-md`}
                  >
                    {['A','B','C','D'][i]}
                  </div>
                ))}
              </div>
              <div className="text-sm text-slate-400 leading-tight">
                <span className="text-white font-semibold">1M+</span> happy customers
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-amber-400">★★★★★</span>
                <span className="text-white font-semibold">4.8</span>
                <span className="text-slate-500">/ 5</span>
              </div>
            </div>
          </div>

          {/* ── Right: Product Showcase Panel ── */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Ambient glow behind the panel */}
              <div className="absolute -inset-6 bg-gradient-to-br from-violet-600/20 via-blue-600/10 to-fuchsia-600/10 rounded-[44px] blur-3xl" />

              {/* Orders badge — top right corner */}
              <div className="absolute -top-4 -right-2 z-20 flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-2xl shadow-black/50 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot shrink-0" />
                <span className="text-xs font-semibold text-white">1,247 orders today</span>
              </div>

              {/* Main featured card */}
              <div className="relative bg-slate-900/90 border border-slate-700/60 rounded-3xl p-6 shadow-2xl shadow-black/60 backdrop-blur-sm">
                {/* New badge */}
                <div className="absolute top-5 left-5 bg-blue-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                  New
                </div>

                {/* Product image area */}
                <div className="h-52 rounded-2xl bg-gradient-to-br from-blue-950 to-indigo-900 border border-blue-800/30 flex items-center justify-center text-7xl mb-5 relative overflow-hidden">
                  {/* Subtle shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/4 to-white/0" />
                  ⌚
                </div>

                {/* Product info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-semibold text-violet-400 uppercase tracking-widest mb-1">Smart Watch</p>
                    <h3 className="text-white font-bold text-lg leading-snug">Smart Watch Series 5</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <Stars rating={4.8} size="md" />
                    <span className="text-xs text-slate-500 font-medium">4.8 · 856 reviews</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-white">₹8,499</span>
                      <span className="text-sm text-slate-500 line-through">₹12,999</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">35% OFF</span>
                  </div>

                  <button className="w-full mt-1 py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/35 hover:-translate-y-px active:translate-y-0">
                    Add to Cart
                  </button>
                </div>
              </div>

              {/* Mini product cards row */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {HERO_MINI_PRODUCTS.map((p) => (
                  <div
                    key={p.name}
                    className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-3.5 flex flex-col items-center gap-2.5 hover:border-slate-600 hover:bg-slate-900 transition-all duration-200 cursor-pointer backdrop-blur-sm group"
                  >
                    <div className={`w-full h-16 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-2xl group-hover:scale-105 transition-transform duration-200`}>
                      {p.emoji}
                    </div>
                    <div className="text-center">
                      <p className="text-white text-xs font-semibold">{p.name}</p>
                      <p className="text-violet-400 text-xs font-bold mt-0.5">{p.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Stats Section ────────────────────────────────────────────────────────────

function StatsSection() {
  return (
    <section className="relative border-y border-slate-800/60">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/80" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-slate-800/60">
          {STATS.map(({ value, label, icon }) => (
            <div key={label} className="flex flex-col items-center gap-2 md:px-8 group cursor-default">
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{icon}</span>
              <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                {value}
              </div>
              <div className="text-sm text-slate-400 font-medium text-center">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Categories Section ───────────────────────────────────────────────────────

function CategoriesSection() {
  return (
    <section className="py-24 lg:py-32 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-violet-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Browse by Category</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">Shop Everything You Need</h2>
          <p className="text-slate-400 mt-5 max-w-xl mx-auto text-base leading-relaxed">
            From the latest gadgets to everyday essentials — explore our hand-curated collections.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/categories/${cat.slug}`}
              className={`group flex flex-col items-center gap-4 p-6 bg-slate-900/50 border border-slate-800/80 rounded-2xl hover:border-slate-700/80 hover:bg-slate-900 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${cat.glow}`}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.from} ${cat.to} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                {cat.emoji}
              </div>
              <div className="text-center">
                <div className="text-white text-sm font-semibold group-hover:text-violet-300 transition-colors leading-tight">{cat.name}</div>
                <div className="text-slate-500 text-xs mt-1">{cat.count} items</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Featured Products Section ────────────────────────────────────────────────

function FeaturedProductsSection() {
  const [added, setAdded] = useState<number | null>(null);

  const handleAdd = (id: number) => {
    setAdded(id);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    <section className="py-24 lg:py-32 bg-slate-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-16">
          <div>
            <p className="text-violet-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Hand-picked for You</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">Featured Products</h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors group"
          >
            View all products
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-0.5 transition-transform">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRODUCTS.map((p) => (
            <div
              key={p.id}
              className={`group relative bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700/80 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${p.glowColor}`}
            >
              <div className={`absolute top-3 left-3 z-10 ${p.badgeColor} text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm`}>
                {p.badge}
              </div>
              <button className="absolute top-3 right-3 z-10 w-8 h-8 bg-slate-800/80 border border-slate-700 rounded-full flex items-center justify-center text-slate-500 hover:text-red-400 hover:border-red-400/50 transition-all opacity-0 group-hover:opacity-100">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>

              <Link to={`/products/${p.id}`}>
                <div className={`h-48 bg-gradient-to-br ${p.imgFrom} ${p.imgTo} flex items-center justify-center text-6xl border-b border-slate-800/60 transition-transform duration-300 group-hover:scale-105`}>
                  {p.emoji}
                </div>
              </Link>

              <div className="p-5">
                <Link to={`/products/${p.id}`} className="block text-sm font-semibold text-white hover:text-violet-300 transition-colors leading-snug mb-2">
                  {p.name}
                </Link>
                <div className="flex items-center gap-2 mb-4">
                  <Stars rating={p.rating} />
                  <span className="text-xs text-slate-500">({p.reviews.toLocaleString()})</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-extrabold text-white">{fmt(p.price)}</span>
                    <span className="text-xs text-slate-500 line-through">{fmt(p.original)}</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                    {discount(p.price, p.original)}% off
                  </span>
                </div>
                <button
                  onClick={() => handleAdd(p.id)}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    added === p.id
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                      : 'bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white shadow-md shadow-violet-500/15 hover:shadow-violet-500/30'
                  }`}
                >
                  {added === p.id ? '✓ Added to Cart' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Flash Sale Section ───────────────────────────────────────────────────────

function FlashSaleSection() {
  const time = useCountdown(5);

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-slate-950 to-blue-950" />
      <div className="absolute inset-0 dot-grid opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-600/8 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-bold mb-10 shadow-lg shadow-red-500/10">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-dot" />
          Flash Sale — Ends Soon
        </div>

        <h2 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold text-white mb-3 tracking-tight">
          UP TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">70% OFF</span>
        </h2>
        <p className="text-slate-400 mb-12 text-lg">On thousands of top-rated products. Limited time only.</p>

        <div className="flex items-end justify-center gap-3 mb-14">
          <TimeBox value={time.h} label="Hours" />
          <span className="text-4xl font-extrabold text-slate-600 pb-7">:</span>
          <TimeBox value={time.m} label="Mins" />
          <span className="text-4xl font-extrabold text-slate-600 pb-7">:</span>
          <TimeBox value={time.s} label="Secs" />
        </div>

        <Link
          to="/deals"
          className="inline-flex items-center gap-2.5 px-12 py-4 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold text-lg rounded-2xl transition-all duration-200 shadow-xl shadow-red-500/30 hover:shadow-red-500/45 hover:-translate-y-0.5 active:translate-y-0"
        >
          Grab the Deal
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3.75 9h10.5M9.75 4.5l4.5 4.5-4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </section>
  );
}

// ─── Why Us Section ───────────────────────────────────────────────────────────

function WhyUsSection() {
  return (
    <section className="py-24 lg:py-32 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-violet-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Our Promise</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">Why Choose Klyro?</h2>
          <p className="text-slate-400 mt-5 max-w-xl mx-auto text-base leading-relaxed">
            Every feature, every flow, every pixel — built with you in mind.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon, title, desc, from, to, border, glow }) => (
            <div
              key={title}
              className={`group p-7 bg-slate-900/50 border border-slate-800/80 rounded-2xl hover:border-slate-700/80 hover:bg-slate-900 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${glow}`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${from} ${to} border ${border} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                {icon}
              </div>
              <h3 className="text-white font-bold text-base mb-2.5 group-hover:text-violet-300 transition-colors">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials Section ─────────────────────────────────────────────────────

function TestimonialsSection() {
  return (
    <section className="py-24 lg:py-32 bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-violet-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Customer Stories</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">Loved by Millions</h2>
          <p className="text-slate-400 mt-5">Real reviews from real customers across India.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ name, role, initials, avatarFrom, avatarTo, rating, text }) => (
            <div
              key={name}
              className="relative p-7 bg-slate-900/80 border border-slate-800/80 rounded-2xl hover:border-slate-700 hover:shadow-2xl hover:shadow-black/40 transition-all duration-300 hover:-translate-y-1 flex flex-col gap-5 group"
            >
              {/* Large quote mark */}
              <div className="absolute top-5 right-6 text-5xl font-serif text-slate-800 select-none leading-none group-hover:text-slate-700 transition-colors">"</div>

              <Stars rating={rating} size="md" />

              <p className="text-slate-300 text-sm leading-relaxed flex-1 relative z-10">"{text}"</p>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarFrom} ${avatarTo} flex items-center justify-center text-xs font-extrabold text-white shrink-0 shadow-md`}>
                  {initials}
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{name}</div>
                  <div className="text-slate-500 text-xs flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-500">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    {role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Newsletter Section ───────────────────────────────────────────────────────

function NewsletterSection() {
  const [email, setEmail]         = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/70 via-slate-950 to-blue-950/70" />
      <div className="absolute inset-0 dot-grid opacity-25" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 flex items-center justify-center text-3xl mx-auto mb-6 shadow-xl shadow-violet-500/10">
          📬
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Stay in the Loop</h2>
        <p className="text-slate-400 mb-10 text-base leading-relaxed">
          Get the latest deals, new arrivals, and exclusive offers delivered to your inbox.
          No spam. Unsubscribe anytime.
        </p>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/10">
              ✓
            </div>
            <p className="text-lg font-bold text-emerald-400">You're subscribed!</p>
            <p className="text-sm text-slate-400">Check your inbox for a welcome gift 🎁</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address…"
              required
              className="flex-1 px-5 py-4 bg-slate-800/70 border border-slate-700 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm backdrop-blur-sm"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-2xl transition-all duration-200 shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0 text-sm whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        )}

        <p className="text-xs text-slate-600 mt-6">By subscribing you agree to our Privacy Policy.</p>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <CategoriesSection />
        <FeaturedProductsSection />
        <FlashSaleSection />
        <WhyUsSection />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
}
