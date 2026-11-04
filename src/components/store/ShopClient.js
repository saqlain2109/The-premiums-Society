'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  SlidersHorizontal,
  X,
  Check,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  ShoppingBag,
  ChevronDown,
} from 'lucide-react';

export default function ShopClient({
  categories = [],
  availableSizes = [],
  availableColours = [],
  allVariants = [],
  totalCount = 0,
  initialSort = 'newest',
  currentCategory = null,
  currentSize = null,
  currentColour = null,
  currentInStock = false,
  filterType = null,
  searchQuery = '',
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Active filter count
  const activeCount = [
    currentCategory,
    currentSize,
    currentColour,
    currentInStock,
    filterType,
    searchQuery,
  ].filter(Boolean).length;

  const handleSortChange = (newSort) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <>
      {/* Top Interactive Filter Trigger & Quick Pills Bar */}
      <div className="bg-[#041a13] rounded-2xl border border-amber-500/20 p-3 sm:p-4 mb-6 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Filter Modal Trigger Button + Active Badges */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setFilterDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black shadow-md hover:scale-[1.02] active:scale-95 transition-all"
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          {/* Quick Clear All if any filter applied */}
          {activeCount > 0 && (
            <Link
              href="/shop"
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:text-white font-bold hover:bg-rose-500/20 transition-all text-[11px]"
            >
              <RotateCcw size={12} />
              <span>Clear ({activeCount})</span>
            </Link>
          )}

          {/* Active Filter Chips */}
          {currentCategory && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold text-[11px]">
              <span>Category: {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}</span>
              <Link href={`/shop?${(() => {
                const p = new URLSearchParams(searchParams.toString());
                p.delete('category');
                return p.toString();
              })()}`} className="hover:text-white">
                <X size={12} />
              </Link>
            </span>
          )}

          {currentSize && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold text-[11px]">
              <span>Size: {currentSize}</span>
              <Link href={`/shop?${(() => {
                const p = new URLSearchParams(searchParams.toString());
                p.delete('size');
                return p.toString();
              })()}`} className="hover:text-white">
                <X size={12} />
              </Link>
            </span>
          )}

          {currentColour && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold text-[11px]">
              <span>Color: {currentColour}</span>
              <Link href={`/shop?${(() => {
                const p = new URLSearchParams(searchParams.toString());
                p.delete('colour');
                return p.toString();
              })()}`} className="hover:text-white">
                <X size={12} />
              </Link>
            </span>
          )}
        </div>

        {/* Right: Sort By Dropdown / Pills */}
        <div className="flex items-center gap-2">
          <span className="text-stone-400 font-medium hidden sm:inline">Sort:</span>
          <div className="relative">
            <select
              value={initialSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="appearance-none bg-[#02130e] text-stone-200 border border-amber-500/30 rounded-xl px-3 py-2 pr-8 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="oldest">Oldest First</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Slide-over Filter Drawer (Opens on demand for Mobile & Desktop) */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setFilterDrawerOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative w-full max-w-md bg-[#041a13] text-stone-100 h-full overflow-y-auto border-l border-amber-500/30 shadow-2xl p-6 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-amber-400" />
                  <h3 className="font-serif-luxury font-bold text-lg text-white">Filter Wardrobe</h3>
                </div>
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* In-Stock Toggle */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                <Link
                  href={`/shop?${(() => {
                    const p = new URLSearchParams(searchParams.toString());
                    if (currentInStock) p.delete('inStock');
                    else p.set('inStock', 'true');
                    return p.toString();
                  })()}`}
                  onClick={() => setFilterDrawerOpen(false)}
                  className="flex items-center justify-between text-xs font-bold text-white cursor-pointer"
                >
                  <span>In-Stock Items Only</span>
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      currentInStock
                        ? 'bg-amber-400 border-amber-400 text-slate-950 font-black'
                        : 'border-white/20 bg-black/40'
                    }`}
                  >
                    {currentInStock && <Check size={13} />}
                  </div>
                </Link>
              </div>

              {/* Categories */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-widest font-brand-title">
                  Collection Categories
                </h4>
                <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  <Link
                    href={`/shop?${(() => {
                      const p = new URLSearchParams(searchParams.toString());
                      p.delete('category');
                      return p.toString();
                    })()}`}
                    onClick={() => setFilterDrawerOpen(false)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      !currentCategory
                        ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                        : 'bg-white/[0.03] text-stone-300 hover:bg-white/10'
                    }`}
                  >
                    <span>All Collections</span>
                    <span>({totalCount})</span>
                  </Link>

                  {categories.map((cat) => {
                    const isSelected = currentCategory === cat.slug;
                    return (
                      <Link
                        key={cat.id}
                        href={`/shop?${(() => {
                          const p = new URLSearchParams(searchParams.toString());
                          if (isSelected) p.delete('category');
                          else p.set('category', cat.slug);
                          return p.toString();
                        })()}`}
                        onClick={() => setFilterDrawerOpen(false)}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                            : 'bg-white/[0.03] text-stone-300 hover:bg-white/10'
                        }`}
                      >
                        <span>{cat.name}</span>
                        {isSelected && <Check size={14} />}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Size Filter */}
              {availableSizes.length > 0 && (
                <div className="border-t border-white/10 pt-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-widest font-brand-title">
                    Available Sizes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((sz) => {
                      const isSelected = currentSize === sz;
                      return (
                        <Link
                          key={sz}
                          href={`/shop?${(() => {
                            const p = new URLSearchParams(searchParams.toString());
                            if (isSelected) p.delete('size');
                            else p.set('size', sz);
                            return p.toString();
                          })()}`}
                          onClick={() => setFilterDrawerOpen(false)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                              : 'bg-white/[0.04] text-stone-200 border border-white/10 hover:border-amber-400/50'
                          }`}
                        >
                          {sz}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Colour Filter */}
              {availableColours.length > 0 && (
                <div className="border-t border-white/10 pt-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-widest font-brand-title">
                    Colour Palette
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {availableColours.map((cl) => {
                      const isSelected = currentColour === cl;
                      const matchVar = allVariants.find((v) => v.colour === cl);
                      return (
                        <Link
                          key={cl}
                          href={`/shop?${(() => {
                            const p = new URLSearchParams(searchParams.toString());
                            if (isSelected) p.delete('colour');
                            else p.set('colour', cl);
                            return p.toString();
                          })()}`}
                          onClick={() => setFilterDrawerOpen(false)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md font-black'
                              : 'bg-white/[0.03] text-stone-200 border-white/10 hover:border-amber-400/40'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/30 shadow-xs shrink-0"
                            style={{ backgroundColor: matchVar?.colourCode || '#1E293B' }}
                          />
                          <span>{cl}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Drawer Actions */}
            <div className="pt-6 border-t border-white/10 flex items-center gap-3">
              <Link
                href="/shop"
                onClick={() => setFilterDrawerOpen(false)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-stone-300 text-center font-bold text-xs rounded-xl border border-white/10 transition-colors"
              >
                Reset All
              </Link>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
