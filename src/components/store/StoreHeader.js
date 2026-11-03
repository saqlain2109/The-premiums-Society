'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from './CartContext';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Phone,
  Sparkles,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Truck,
  Instagram,
  Crown,
} from 'lucide-react';

export default function StoreHeader({ settings = null, content = null, categories: initialCategories = null }) {
  const { totalCount, setDrawerOpen, settings: contextSettings } = useCart();
  const activeSettings = settings || contextSettings;
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState(initialCategories || []);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategories(initialCategories);
    }
  }, [initialCategories]);

  useEffect(() => {
    async function loadNavCats() {
      try {
        const res = await fetch('/api/categories?t=' + Date.now(), { cache: 'no-store' });
        const data = await res.json();
        if (data.success && data.categories) {
          setCategories(data.categories);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadNavCats();

    const handleCatsUpdated = () => {
      loadNavCats();
    };
    window.addEventListener('categories_updated', handleCatsUpdated);
    return () => window.removeEventListener('categories_updated', handleCatsUpdated);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCatDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const currencySym = activeSettings?.currencySymbol || '₹';
  const showAnnouncement = activeSettings ? activeSettings.announcementActive !== false : true;
  const rawAnnouncement = activeSettings?.storeAnnouncement
    || content?.announcementBar
    || `Special Festive Offer: FREE Delivery on orders over ${currencySym}2000 across India!`;
  const announcement = rawAnnouncement
    ? rawAnnouncement.replace(/[\uFFFD\?](?=\d)/g, currencySym).replace(/\uFFFD/g, currencySym)
    : '';

  const businessName = activeSettings?.businessName || 'The Premiums Society';
  const storeLogo = activeSettings?.storeLogo || '/images/logo.png';
  const initials = 'PS';

  const waPhone = activeSettings?.primaryPhone || '+919920517851';
  const cleanPhone = waPhone.replace(/[^0-9]/g, '');
  const instaUrl = activeSettings?.instagramUrl || 'https://www.instagram.com/the_premiumss?xtok=MXBtOTNoc2tiM3RxMg==';

  return (
    <header className="sticky top-0 z-50 bg-[#041a13]/95 backdrop-blur-md border-b border-amber-500/20 shadow-xl transition-all">
      {/* 1. Top Luxury Announcement Bar */}
      {showAnnouncement && (
        <div className="bg-[#02130e] text-emerald-200/90 text-[11px] font-medium py-2 px-3 sm:px-4 border-b border-amber-500/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 truncate">
              <Sparkles size={12} className="text-amber-400 shrink-0 animate-pulse" />
              <span className="truncate tracking-wide">{announcement}</span>
            </div>

            <div className="hidden md:flex items-center gap-5 shrink-0 text-emerald-100/70 text-[11px]">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Truck size={13} />
                <span>All-India Express Delivery</span>
              </span>
              <span className="text-emerald-900">|</span>
              <a
                href={instaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-pink-300 hover:text-white transition-colors"
              >
                <Instagram size={12} />
                <span>@the_premiumss</span>
              </a>
              <span className="text-emerald-900">|</span>
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-emerald-300 hover:text-white transition-colors"
              >
                <Phone size={12} />
                <span>Helpline: {waPhone}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Luxury Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Menu Toggle + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-amber-300 hover:bg-white/10 transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <img
              src={storeLogo}
              alt={businessName}
              className="w-10 h-10 sm:w-11 sm:h-11 object-cover rounded-full shadow-lg border border-amber-400/40 group-hover:scale-105 transition-transform"
            />
            <div className="leading-tight">
              <span className="font-serif-luxury font-black text-white text-base sm:text-lg lg:text-xl tracking-tight block">
                {businessName}
              </span>
              <span className="text-[8px] sm:text-[9px] font-extrabold text-amber-300/90 uppercase tracking-[0.2em] block">
                Society &bull; Luxury Couture
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Clean & Focused Navigation (Only Essential Links) */}
        <nav className="hidden lg:flex items-center gap-8 text-[13px] font-bold text-stone-200">
          <Link
            href="/"
            className="hover:text-amber-400 transition-colors py-2"
          >
            Home
          </Link>

          <Link
            href="/shop"
            className="hover:text-amber-400 transition-colors py-2"
          >
            Shop All
          </Link>

          {/* Collections Dropdown: All outfits/categories are neatly inside here */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setCatDropdownOpen(!catDropdownOpen)}
              onMouseEnter={() => setCatDropdownOpen(true)}
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors py-2 group"
            >
              <span>Collections</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 text-amber-400/70 group-hover:text-amber-400 ${
                  catDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {catDropdownOpen && (
              <div
                onMouseLeave={() => setCatDropdownOpen(false)}
                className="absolute top-full -left-8 w-80 bg-[#041a13] rounded-2xl shadow-2xl border border-amber-500/30 text-white p-3 grid gap-1.5 z-50 animate-fade-in"
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 border-b border-white/10 mb-1 flex items-center justify-between">
                  <span>Society Collections</span>
                  <Crown size={12} className="text-amber-400" />
                </div>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/shop?category=${c.slug}`}
                    onClick={() => setCatDropdownOpen(false)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-stone-900 border border-amber-500/30 shrink-0">
                        {c.image ? (
                          <img src={c.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-amber-300 font-bold">
                            {c.name ? c.name.slice(0, 2).toUpperCase() : initials}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-stone-200 group-hover:text-amber-300">
                        {c.name}
                      </span>
                    </div>
                    <ArrowRight size={13} className="text-stone-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
                <div className="border-t border-white/10 pt-2 px-1">
                  <Link
                    href="/shop"
                    onClick={() => setCatDropdownOpen(false)}
                    className="block text-center py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md"
                  >
                    View Entire Wardrobe &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/#about"
            className="hover:text-amber-400 transition-colors py-2 text-stone-300"
          >
            About Us
          </Link>
        </nav>

        {/* Right: Search, WhatsApp Order & Shopping Bag */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search Trigger */}
          <div className="relative">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5 animate-fade-in">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search outfits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-36 sm:w-60 px-3.5 py-1.5 text-xs bg-[#03130e] border border-amber-500/40 rounded-full focus:bg-black focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-100 font-medium placeholder:text-stone-500"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 sm:p-2.5 rounded-full text-stone-200 hover:bg-white/10 transition-colors"
                title="Search Products"
              >
                <Search size={18} />
              </button>
            )}
          </div>

          {/* Direct WhatsApp Order Pill */}
          <a
            href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(businessName)},%20I%20want%20to%20place%20an%20order.`}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat & Order directly on WhatsApp"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full text-xs font-bold transition-all shadow-xs"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Phone size={13} className="text-emerald-400" />
            <span>WhatsApp</span>
          </a>

          {/* Luxury Shopping Bag */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative p-2.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold transition-all shadow-lg shadow-black/40 flex items-center gap-2 group"
            aria-label="View Shopping Bag"
          >
            <ShoppingBag size={17} className="group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline text-xs font-black">Bag</span>
            {totalCount > 0 && (
              <span className="w-5 h-5 bg-slate-950 text-amber-300 font-black text-[10px] rounded-full flex items-center justify-center border border-amber-300">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Mobile Slide-Down Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-amber-500/20 bg-[#041a13] p-5 space-y-4 animate-fade-in shadow-2xl text-stone-100">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by outfit, fabric, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#02130e] border border-amber-500/30 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder:text-stone-500"
            />
          </form>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1 text-sm font-bold">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 hover:bg-white/5 rounded-xl text-stone-200"
            >
              Home
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 hover:bg-white/5 rounded-xl text-amber-300 font-extrabold flex items-center justify-between"
            >
              <span>Shop All Outfits</span>
              <span>&rarr;</span>
            </Link>

            <div className="pt-3 pb-1 border-t border-white/10 text-[10px] font-bold uppercase tracking-wider text-amber-400/80 px-2.5 flex items-center justify-between">
              <span>Collections</span>
              <Crown size={12} />
            </div>

            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 hover:bg-white/5 rounded-xl text-stone-300 flex items-center justify-between"
              >
                <span>{c.name}</span>
                <span className="text-xs text-stone-500">&rarr;</span>
              </Link>
            ))}

            <Link
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 hover:bg-white/5 rounded-xl text-stone-300 border-t border-white/10 pt-3"
            >
              About The Premiums Society
            </Link>
          </nav>

          {/* Mobile WhatsApp Quick Call Banner */}
          <a
            href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(businessName)},%20I%20have%20an%20order%20inquiry.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md"
          >
            <Phone size={14} />
            <span>WhatsApp Helpline ({waPhone})</span>
          </a>
        </div>
      )}
    </header>
  );
}
