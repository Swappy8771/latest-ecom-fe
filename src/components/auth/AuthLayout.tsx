import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '🚀', text: 'Lightning-fast delivery in 1–3 days' },
  { icon: '🔒', text: '256-bit encrypted, secure payments' },
  { icon: '↩️', text: '30-day hassle-free returns' },
  { icon: '💬', text: '24/7 live human support' },
];

interface AuthLayoutProps {
  children:  ReactNode;
  heading:   string;
  subheading: string;
  panelTitle?: string;
  panelSub?:   string;
}

export default function AuthLayout({ children, heading, subheading, panelTitle, panelSub }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex">

      {/* ── Left panel (branding) ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative overflow-hidden flex-col">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-slate-950 to-blue-950" />
        <div className="absolute inset-0 dot-grid opacity-40" />

        {/* Glow orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-12 xl:px-16 py-12">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 w-fit">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center font-extrabold text-white shadow-lg shadow-violet-500/30">
              K
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Kly<span className="text-violet-400">ro</span>
            </span>
          </Link>

          {/* Main copy */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-8 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse-dot" />
              Trusted by 1M+ shoppers
            </div>

            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-5">
              {panelTitle ?? 'Your ultimate\nshopping\ndestination'}
            </h2>
            <p className="text-slate-400 text-base leading-relaxed mb-10">
              {panelSub ?? 'Discover thousands of curated products from verified sellers. Unbeatable deals, blazing delivery, and a shopping experience you\'ll love.'}
            </p>

            {/* Feature list */}
            <ul className="space-y-4">
              {FEATURES.map(({ icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-base shrink-0">
                    {icon}
                  </div>
                  <span className="text-slate-300 text-sm">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom testimonial */}
          <div className="bg-white/4 border border-white/8 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex gap-0.5 mb-3">
              {[1,2,3,4,5].map((i) => (
                <svg key={i} className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <p className="text-slate-300 text-sm leading-relaxed italic">
              "Klyro completely changed how I shop online. The quality, speed and experience is unmatched."
            </p>
            <div className="flex items-center gap-2.5 mt-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center text-xs font-bold text-white">P</div>
              <div>
                <p className="text-white text-xs font-semibold">Priya Sharma</p>
                <p className="text-slate-500 text-[11px]">Verified Buyer · Mumbai</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-10 py-12 overflow-y-auto">
        {/* Mobile logo */}
        <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center font-extrabold text-white text-sm shadow-md shadow-violet-500/30">K</div>
          <span className="font-extrabold text-lg tracking-tight text-white">Kly<span className="text-violet-400">ro</span></span>
        </Link>

        <div className="w-full max-w-md">
          {/* Form heading */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{heading}</h1>
            <p className="mt-2 text-slate-400 text-sm leading-relaxed">{subheading}</p>
          </div>

          {children}
        </div>
      </div>

    </div>
  );
}
