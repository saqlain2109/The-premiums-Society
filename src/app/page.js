import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Truck,
  MessageSquare,
  Star,
  CheckCircle2,
  Crown,
  Instagram,
  Phone,
  Flame,
  ArrowUpRight,
  MapPin,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const [settings, content, categories, featuredProducts, newArrivals] = await Promise.all([
    prisma.storeSettings.findUnique({ where: { id: 'default' } }),
    prisma.websiteContent.findUnique({ where: { id: 'default' } }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: { _count: { select: { products: { where: { status: 'PUBLISHED' } } } } },
    }),
    prisma.product.findMany({
      where: { status: 'PUBLISHED', isFeatured: true },
      take: 8,
      include: { category: true, variants: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({
      where: { status: 'PUBLISHED', isNewArrival: true },
      take: 8,
      include: { category: true, variants: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const currencySymbol = settings?.currencySymbol || '₹';
  const waPhone = settings?.primaryPhone || '+919920517851';
  const cleanPhone = waPhone.replace(/[^0-9]/g, '');
  const instaUrl = settings?.instagramUrl || 'https://www.instagram.com/the_premiumss?xtok=MXBtOTNoc2tiM3RxMg==';

  return (
    <div className="min-h-screen flex flex-col bg-[#071712] text-stone-100 overflow-x-hidden selection:bg-amber-400/20 selection:text-amber-200">
      <StoreHeader categories={categories} settings={settings} content={content} />

      <main className="flex-1">
        {/* 1. Ultra Luxury Royalty Hero Section */}
        <section className="relative min-h-[640px] sm:min-h-[720px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#02130e] via-[#052219] to-[#071712] border-b border-amber-500/20">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-emerald-500/10 via-amber-500/15 to-transparent blur-[120px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-emerald-600/10 blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 text-amber-300 text-xs font-semibold tracking-wider shadow-lg shadow-black/40">
                <Crown size={15} className="text-amber-400 drop-shadow animate-pulse" />
                <span className="uppercase tracking-[0.2em] font-brand-title text-[11px]">The Royal Couture Collection 2026</span>
              </div>

              <h1 className="font-serif-luxury text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
                Where <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">Royalty</span> Meets Modern Elegance.
              </h1>

              <p className="text-sm sm:text-lg text-emerald-100/80 leading-relaxed max-w-2xl font-light">
                Discover handcrafted luxury Panjabis, celebratory silhouettes, and custom couture designed exclusively for the discerning gentlemen & ladies of <span className="text-amber-300 font-medium">The Premiums Society</span>.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/shop"
                  className="px-8 py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2.5 group"
                >
                  <ShoppingBag size={18} />
                  <span>Explore Society Wardrobe</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                </Link>

                <a
                  href={`https://wa.me/${cleanPhone}?text=Hello%20The%20Premiums%20Society,%20I%20am%20interested%20in%20your%20exclusive%20couture%20collection.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-7 py-4 bg-white/5 hover:bg-white/10 text-emerald-200 hover:text-white font-bold rounded-2xl text-xs sm:text-sm backdrop-blur-md transition-all border border-emerald-500/30 hover:border-amber-400/50 flex items-center gap-2 shadow-sm"
                >
                  <MessageSquare size={17} className="text-emerald-400" />
                  <span>WhatsApp Concierge</span>
                </a>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-stone-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-stone-300 font-medium">Handcrafted in India</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-stone-700" />
                <div className="flex items-center gap-1.5 text-amber-300/90 font-medium">
                  <ShieldCheck size={15} />
                  <span>100% Supreme Organic Fabrics</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-stone-700" />
                <div className="flex items-center gap-1.5 text-emerald-300/90 font-medium">
                  <Truck size={15} />
                  <span>Express Nationwide Shipping</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative group w-72 sm:w-84 md:w-96 aspect-square rounded-full p-2 bg-gradient-to-tr from-amber-500/40 via-emerald-400/20 to-amber-300/40 shadow-2xl shadow-emerald-950/80">
                <div className="absolute inset-0 rounded-full border border-amber-400/40 animate-pulse" />
                <div className="w-full h-full rounded-full overflow-hidden bg-[#041a13] p-6 flex flex-col items-center justify-center text-center relative border border-amber-500/30">
                  <img
                    src="/images/logo.png"
                    alt="The Premiums Society Crown Logo"
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  <a
                    href={instaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-900/60 via-pink-900/60 to-amber-900/60 border border-pink-400/40 hover:border-amber-300 text-[11px] font-bold text-white flex items-center gap-2 backdrop-blur-md shadow-lg hover:scale-105 transition-all"
                  >
                    <Instagram size={14} className="text-pink-400" />
                    <span>@the_premiumss</span>
                    <ArrowUpRight size={13} className="text-amber-400" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 2. Floating Luxury Society Highlights Bar */}
        <section className="bg-[#041d15] border-b border-amber-500/15 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Crown size={22} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">Royal Needlework</h4>
                <p className="text-[11px] text-emerald-200/60">Zari, Resham & hand embroidery</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Truck size={22} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">Nationwide Express</h4>
                <p className="text-[11px] text-emerald-200/60">
                  Free over {formatPrice(settings?.freeShippingThreshold ?? 2000, currencySymbol)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
                <MessageSquare size={22} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">WhatsApp Order Desk</h4>
                <p className="text-[11px] text-emerald-200/60">Direct instant personal support</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">Guaranteed Fit</h4>
                <p className="text-[11px] text-emerald-200/60">7-Day complimentary exchange</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Society Boutique Categories */}
        <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-px bg-amber-400" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-[0.25em] font-brand-title">
                  Signature Wardrobe
                </span>
              </div>
              <h2 className="font-serif-luxury text-3xl sm:text-5xl font-black text-white tracking-tight">
                Curated Collections
              </h2>
            </div>
            <Link
              href="/shop"
              className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider py-2"
            >
              <span>Explore Entire Catalog</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative rounded-3xl overflow-hidden bg-[#052018] border border-amber-500/20 shadow-lg hover:shadow-2xl hover:border-amber-400/60 hover:-translate-y-2 transition-all duration-500 flex flex-col"
              >
                <div className="aspect-[4/5] w-full overflow-hidden bg-[#041a13] relative">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-900 text-stone-500 text-xs font-bold">
                      {cat.name}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#02140e] via-[#02140e]/30 to-transparent" />
                </div>

                <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                  <h3 className="font-serif-luxury font-bold text-sm sm:text-base leading-snug drop-shadow-md text-amber-100 group-hover:text-amber-300 transition-colors">
                    {cat.name}
                  </h3>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-emerald-300 font-semibold">
                    <span>{cat._count?.products || 0} Outfits</span>
                    <ArrowRight size={13} className="text-amber-400 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. Featured Masterpieces Section */}
        {featuredProducts.length > 0 && (
          <section className="bg-gradient-to-b from-[#052018] via-[#041a13] to-[#071712] py-20 sm:py-24 border-y border-amber-500/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Flame size={15} className="text-amber-400" />
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-[0.25em] font-brand-title">
                      Most Coveted
                    </span>
                  </div>
                  <h2 className="font-serif-luxury text-3xl sm:text-5xl font-black text-white tracking-tight">
                    Featured Masterpieces
                  </h2>
                </div>
                <Link
                  href="/shop?filter=featured"
                  className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider"
                >
                  <span>View All Featured</span>
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {featuredProducts.map((prod) => {
                  const totalStock = prod.variants.reduce((s, v) => s + (v.stock || 0), 0);
                  const isOutOfStock = totalStock <= 0;
                  const uniqueColours = [...new Set(prod.variants.map((v) => v.colourCode || '#1E293B'))].slice(0, 4);

                  return (
                    <Link
                      key={prod.id}
                      href={`/product/${prod.slug}`}
                      className="group bg-[#041a13] rounded-3xl overflow-hidden border border-amber-500/20 shadow-md hover:shadow-2xl hover:border-amber-400/50 hover:-translate-y-2 transition-all duration-300 flex flex-col"
                    >
                      <div className="aspect-[3/4] w-full overflow-hidden bg-stone-900 relative">
                        {prod.mainImage ? (
                          <img
                            src={prod.mainImage}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-500 text-xs">
                            No Photo
                          </div>
                        )}

                        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                          <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                            Featured
                          </span>
                          {isOutOfStock && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-600/90 text-white font-bold text-[10px] uppercase tracking-wider backdrop-blur-xs">
                              Out of Stock
                            </span>
                          )}
                        </div>

                        {prod.category && (
                          <div className="absolute bottom-3 left-3">
                            <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-amber-200 text-[10px] font-medium border border-white/10">
                              {prod.category.name}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <h3 className="font-serif-luxury font-bold text-sm sm:text-base text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                            {prod.name}
                          </h3>
                          <p className="text-[11px] text-emerald-200/60 line-clamp-1 mt-1 font-normal">
                            SKU: {prod.sku}
                          </p>
                        </div>

                        {uniqueColours.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            {uniqueColours.map((col, idx) => (
                              <span
                                key={idx}
                                className="w-3.5 h-3.5 rounded-full border border-amber-500/40 shadow-xs"
                                style={{ backgroundColor: col }}
                              />
                            ))}
                            {prod.variants.length > 4 && (
                              <span className="text-[10px] text-stone-400 font-bold ml-1">
                                +{prod.variants.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-1.5">
                          <div className="flex items-baseline flex-wrap gap-1">
                            <span className="text-sm sm:text-base lg:text-lg font-black text-amber-300">
                              {formatPrice(prod.sellingPrice, currencySymbol)}
                            </span>
                            {prod.originalPrice && prod.originalPrice > prod.sellingPrice && (
                              <span className="text-[10px] sm:text-xs text-stone-500 line-through">
                                {formatPrice(prod.originalPrice, currencySymbol)}
                              </span>
                            )}
                          </div>

                          <span className="text-[10px] sm:text-[11px] font-bold text-slate-950 bg-amber-400 group-hover:bg-amber-300 px-2 sm:px-2.5 py-1 rounded-lg transition-all shadow-md flex items-center gap-1 shrink-0">
                            <span>View</span>
                            <ArrowRight size={11} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 5. New Arrivals Showcase */}
        {newArrivals.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-[0.25em] font-brand-title">
                    Fresh Off The Loom
                  </span>
                </div>
                <h2 className="font-serif-luxury text-3xl sm:text-5xl font-black text-white tracking-tight">
                  New Arrivals
                </h2>
              </div>
              <Link
                href="/shop?filter=new"
                className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider"
              >
                <span>View All New Additions</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {newArrivals.map((prod) => {
                return (
                  <Link
                    key={prod.id}
                    href={`/product/${prod.slug}`}
                    className="group bg-[#041a13] rounded-3xl overflow-hidden border border-amber-500/20 shadow-md hover:shadow-2xl hover:border-amber-400/50 hover:-translate-y-2 transition-all duration-300 flex flex-col"
                  >
                    <div className="aspect-[3/4] w-full overflow-hidden bg-stone-900 relative">
                      {prod.mainImage ? (
                        <img
                          src={prod.mainImage}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-500 text-xs">
                          No Photo
                        </div>
                      )}

                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-600/90 text-white font-black text-[10px] uppercase tracking-wider shadow-md backdrop-blur-xs">
                          New
                        </span>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h3 className="font-serif-luxury font-bold text-sm sm:text-base text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                          {prod.name}
                        </h3>
                        <p className="text-[11px] text-emerald-200/60 line-clamp-1 mt-1 font-normal">
                          {prod.category?.name || 'Exclusive Outfit'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-1.5">
                        <div>
                          <span className="text-sm sm:text-base lg:text-lg font-black text-amber-300">
                            {formatPrice(prod.sellingPrice, currencySymbol)}
                          </span>
                        </div>

                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-950 bg-amber-400 group-hover:bg-amber-300 px-2 sm:px-2.5 py-1 rounded-lg transition-all shadow-md flex items-center gap-1 shrink-0">
                          <span>View</span>
                          <ArrowRight size={11} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 6. Instagram & Society Atelier Story Section */}
        <section id="about" className="bg-[#02130e] text-white py-24 border-t border-amber-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2">
                <Crown size={15} className="text-amber-400" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-[0.25em] font-brand-title">
                  The Society Atelier
                </span>
              </div>

              <h2 className="font-serif-luxury text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {content?.brandStoryTitle || 'Preserving Royal Heritage with Haute Couture Tailoring'}
              </h2>

              <p className="text-sm sm:text-base text-emerald-100/80 leading-relaxed font-light">
                {content?.brandStoryText ||
                  `At ${settings?.businessName || 'The Premiums Society'}, every garment is born from a reverence for timeless regal needlework blended with modern bespoke silhouettes. Designed for celebrations, wedding soirees, and discerning everyday elegance.`}
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/shop"
                  className="px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-2xl text-xs transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2"
                >
                  <ShoppingBag size={15} />
                  <span>Shop The Boutique</span>
                </Link>

                <a
                  href={instaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-4 border border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20 text-pink-200 hover:text-white rounded-2xl text-xs transition-all flex items-center gap-2"
                >
                  <Instagram size={15} className="text-pink-400" />
                  <span>Follow @the_premiumss</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 relative flex justify-center">
              <div className="w-full max-w-md rounded-3xl overflow-hidden border border-amber-500/30 bg-[#052219] p-8 shadow-2xl relative">
                <div className="absolute top-0 right-0 p-4">
                  <Crown size={24} className="text-amber-400/40" />
                </div>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-400 to-emerald-400 shadow-xl">
                    <img
                      src="/images/logo.png"
                      alt="The Premiums Society Logo"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif-luxury text-2xl font-bold text-white tracking-wide">
                      The Premiums Society
                    </h3>
                    <p className="text-xs text-amber-300 font-semibold tracking-widest uppercase mt-1">
                      Couture & Festive Boutique
                    </p>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed font-normal">
                    Experience luxury ethnic craftsmanship. Directly connected with our personal styling desk via WhatsApp.
                  </p>
                  <div className="w-full pt-4 border-t border-white/10 flex items-center justify-between text-xs text-stone-300">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <Phone size={13} />
                      <span>{waPhone}</span>
                    </span>
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 font-bold hover:underline"
                    >
                      Chat Now &rarr;
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Store Location & Interactive Google Map Section */}
        <section id="visit-store" className="bg-[#041a13] text-white py-16 sm:py-20 border-t border-amber-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
                <MapPin size={13} className="text-amber-400" />
                <span>Visit Our Boutique</span>
              </div>
              <h2 className="font-serif-luxury text-2xl sm:text-4xl font-black text-white tracking-tight">
                Experience The Collection In Person
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/70">
                {settings?.address || 'Come visit The Premiums Society flagship boutique studio.'}
              </p>
            </div>

            <div className="rounded-3xl overflow-hidden border border-amber-500/30 bg-[#02130e] shadow-2xl grid grid-cols-1 lg:grid-cols-12">
              <div className="p-6 sm:p-10 lg:col-span-5 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="font-serif-luxury text-lg font-bold text-white">Store Address</h3>
                      <p className="text-xs text-amber-300 font-semibold uppercase tracking-wider">The Premiums Society</p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
                    {settings?.address || 'Mumbai, Maharashtra, India'}
                  </p>

                  <div className="pt-2 space-y-2 text-xs text-emerald-100/80">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-amber-400 shrink-0" />
                      <span>Helpline: <strong>{waPhone}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-amber-400 shrink-0" />
                      <span>Store Hours: {settings?.storeHours || "11:00 AM - 9:30 PM (All Days Open)"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-wrap gap-3">
                  {(() => {
                    const dirLink = settings?.mapEmbedUrl
                      ? settings.mapEmbedUrl
                      : (settings?.latitude && settings?.longitude)
                      ? `https://www.google.com/maps/dir/?api=1&destination=${settings.latitude},${settings.longitude}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('The Premiums Society ' + (settings?.address || ''))}`;
                    return (
                      <a
                        href={dirLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg flex items-center gap-2"
                      >
                        <MapPin size={15} />
                        <span>Get Turn-by-Turn Directions &rarr;</span>
                      </a>
                    );
                  })()}
                </div>
              </div>

              {/* Interactive Map Iframe */}
              <div className="lg:col-span-7 min-h-[300px] sm:min-h-[380px] bg-stone-900 relative">
                {(() => {
                  const embedSrc = (settings?.latitude && settings?.longitude)
                    ? `https://maps.google.com/maps?q=${settings.latitude},${settings.longitude}&hl=en&z=15&output=embed`
                    : (settings?.address)
                    ? `https://maps.google.com/maps?q=${encodeURIComponent(settings.address)}&hl=en&z=15&output=embed`
                    : `https://maps.google.com/maps?q=Mumbai&hl=en&z=13&output=embed`;

                  return (
                    <iframe
                      title="The Premiums Society Location"
                      src={embedSrc}
                      className="w-full h-full min-h-[300px] border-0 filter contrast-[1.05]"
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  );
                })()}
              </div>
            </div>
          </div>
        </section>
      </main>

      <StoreFooter settings={settings} />
    </div>
  );
}
