export default function UserHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Quick overview of your account.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
          <p className="text-slate-400 text-sm">Orders</p>
          <p className="text-white text-2xl font-bold mt-1">—</p>
          <p className="text-slate-500 text-xs mt-2">Hook this to `/api/orders`.</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
          <p className="text-slate-400 text-sm">Wishlist</p>
          <p className="text-white text-2xl font-bold mt-1">—</p>
          <p className="text-slate-500 text-xs mt-2">Coming soon.</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
          <p className="text-slate-400 text-sm">Wallet</p>
          <p className="text-white text-2xl font-bold mt-1">—</p>
          <p className="text-slate-500 text-xs mt-2">Coming soon.</p>
        </div>
      </div>
    </div>
  );
}

