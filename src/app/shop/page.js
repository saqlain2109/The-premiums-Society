import { prisma } from '@/lib/prisma';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import Link from 'next/link';
import {
  Search,
  Filter,
  ArrowUpDown,
  ShoppingBag,
  Star,
  Check,
  X,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ShopPage({ searchParams }) {
  const categorySlug = searchParams?.category;
  const searchQuery = searchParams?.search || '';
  const sort = searchParams?.sort || 'newest';
  const sizeFilter = searchParams?.size;
  const colourFilter = searchParams?.colour;
  const inStockOnly = searchParams?.inStock === 'true';
  const filterType = searchParams?.filter; // 'featured', 'new'

  // Fetch settings & content
  const [settings, content, categories] = await Promise.all([
    prisma.storeSettings.findUnique({ where: { id: 'default' } }),
    prisma.websiteContent.findUnique({ where: { id: 'default' } }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    }),
  ]);

  const currencySymbol = settings?.currencySymbol || '₹';

  // Build Prisma where
  const where = {
    status: 'PUBLISHED',
  };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (filterType === 'featured') {
    where.isFeatured = true;
  } else if (filterType === 'new') {
    where.isNewArrival = true;
  }

  if (searchQuery.trim()) {
    where.OR = [
      { name: { contains: searchQuery.trim() } },
      { description: { contains: searchQuery.trim() } },
      { sku: { contains: searchQuery.trim() } },
    ];
  }

  if (sizeFilter || colourFilter || inStockOnly) {
    const variantWhere = {};
    if (sizeFilter) variantWhere.size = sizeFilter;
    if (colourFilter) variantWhere.colour = colourFilter;
    if (inStockOnly) variantWhere.stock = { gt: 0 };
    where.variants = { some: variantWhere };
  }

  let orderBy = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { sellingPrice: 'asc' };
  else if (sort === 'price_desc') orderBy = { sellingPrice: 'desc' };
  else if (sort === 'oldest') orderBy = { createdAt: 'asc' };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: {
      category: true,
      variants: true,
      images: true,
    },
  });

  // Extract all unique sizes and colours from categories for filter sidebar
  const allVariants = await prisma.productVariant.findMany({
    where: { product: { status: 'PUBLISHED' } },
    select: { size: true, colour: true, colourCode: true },
  });

  const availableSizes = [...new Set(allVariants.map((v) => v.size).filter(Boolean))];
  const availableColours = [...new Set(allVariants.map((v) => v.colour).filter(Boolean))];

  return (
    <div className="min-h-screen flex flex-col bg-[#071712] text-stone-100 overflow-x-hidden">
      <StoreHeader categories={categories} settings={settings} content={content} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-stone-400 font-medium mb-2">
            <Link href="/" className="hover:text-emerald-800">
              Home
            </Link>
            <span>/</span>
            <span className="text-stone-200 font-bold">Catalog</span>
            {categorySlug && (
              <>
                <span>/</span>
                <span className="text-emerald-800 font-bold capitalize">
                  {categorySlug.replace(/-/g, ' ')}
                </span>
              </>
            )}
          </div>

          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-black text-white tracking-tight">
            {categorySlug
              ? categories.find((c) => c.slug === categorySlug)?.name || 'Collection'
              : filterType === 'featured'
              ? 'Featured Highlights'
              : filterType === 'new'
              ? 'New Arrivals 2026'
              : 'All Outfits & Collections'}
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Displaying <strong className="text-white font-bold">{products.length}</strong> available masterwork(s)
          </p>
        </div>

        {/* Layout with Filters Sidebar & Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-[#041a13] text-stone-100 rounded-3xl border border-amber-500/20/90 p-5 sm:p-6 shadow-sm space-y-6">
              {/* Header with Clear button */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-emerald-800" />
                  <h3 className="font-bold text-white text-sm">Filter Catalogue</h3>
                </div>
                {(categorySlug || searchQuery || sizeFilter || colourFilter || inStockOnly) && (
                  <Link
                    href="/shop"
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    Reset All
                  </Link>
                )}
              </div>

              {/* Categories Filter */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider">
                  Category
                </h4>
                <div className="space-y-1">
                  <Link
                    href="/shop"
                    className={`block px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      !categorySlug
                        ? 'bg-emerald-50 text-emerald-900 font-extrabold border border-emerald-200'
                        : 'text-stone-400 hover:bg-[#071712] text-stone-100'
                    }`}
                  >
                    All Outfits ({categories.length})
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${cat.slug}${sort ? `&sort=${sort}` : ''}`}
                      className={`block px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        categorySlug === cat.slug
                          ? 'bg-emerald-50 text-emerald-900 font-extrabold border border-emerald-200'
                          : 'text-stone-400 hover:bg-[#071712] text-stone-100'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* In-Stock Only Toggle */}
              <div className="border-t border-stone-100 pt-4">
                <Link
                  href={`/shop?${new URLSearchParams({
                    ...(categorySlug ? { category: categorySlug } : {}),
                    ...(searchQuery ? { search: searchQuery } : {}),
                    ...(sort ? { sort } : {}),
                    ...(sizeFilter ? { size: sizeFilter } : {}),
                    ...(colourFilter ? { colour: colourFilter } : {}),
                    inStock: inStockOnly ? 'false' : 'true',
                  }).toString()}`}
                  className="flex items-center justify-between text-xs font-bold text-stone-200 cursor-pointer p-1"
                >
                  <span>In-Stock Items Only</span>
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      inStockOnly
                        ? 'bg-emerald-700 border-emerald-700 text-white'
                        : 'border-stone-300 bg-[#041a13] text-stone-100'
                    }`}
                  >
                    {inStockOnly && <Check size={13} />}
                  </div>
                </Link>
              </div>

              {/* Size Filter */}
              {availableSizes.length > 0 && (
                <div className="border-t border-stone-100 pt-4 space-y-2">
                  <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider">
                    Size
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((sz) => {
                      const isSelected = sizeFilter === sz;
                      const nextParams = new URLSearchParams({
                        ...(categorySlug ? { category: categorySlug } : {}),
                        ...(searchQuery ? { search: searchQuery } : {}),
                        ...(sort ? { sort } : {}),
                        ...(colourFilter ? { colour: colourFilter } : {}),
                        ...(inStockOnly ? { inStock: 'true' } : {}),
                        ...(isSelected ? {} : { size: sz }),
                      });

                      return (
                        <Link
                          key={sz}
                          href={`/shop?${nextParams.toString()}`}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                              : 'bg-[#071712] text-stone-100 text-stone-300 border-amber-500/20 hover:bg-stone-100'
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
                <div className="border-t border-stone-100 pt-4 space-y-2">
                  <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider">
                    Colour Palette
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {availableColours.map((cl) => {
                      const isSelected = colourFilter === cl;
                      const matchVar = allVariants.find((v) => v.colour === cl);
                      const nextParams = new URLSearchParams({
                        ...(categorySlug ? { category: categorySlug } : {}),
                        ...(searchQuery ? { search: searchQuery } : {}),
                        ...(sort ? { sort } : {}),
                        ...(sizeFilter ? { size: sizeFilter } : {}),
                        ...(inStockOnly ? { inStock: 'true' } : {}),
                        ...(isSelected ? {} : { colour: cl }),
                      });

                      return (
                        <Link
                          key={cl}
                          href={`/shop?${nextParams.toString()}`}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                              : 'bg-[#041a13] text-stone-100 text-stone-300 border-amber-500/20 hover:bg-stone-100'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/20"
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
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Toolbar: Sorting */}
            <div className="bg-[#041a13] text-stone-100 rounded-2xl border border-amber-500/20 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-stone-400">
                <ArrowUpDown size={15} />
                <span className="font-bold">Sort By:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Newest First', key: 'newest' },
                    { label: 'Price: Low to High', key: 'price_asc' },
                    { label: 'Price: High to Low', key: 'price_desc' },
                  ].map((s) => (
                    <Link
                      key={s.key}
                      href={`/shop?${new URLSearchParams({
                        ...(categorySlug ? { category: categorySlug } : {}),
                        ...(searchQuery ? { search: searchQuery } : {}),
                        ...(sizeFilter ? { size: sizeFilter } : {}),
                        ...(colourFilter ? { colour: colourFilter } : {}),
                        ...(inStockOnly ? { inStock: 'true' } : {}),
                        sort: s.key,
                      }).toString()}`}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                        sort === s.key
                          ? 'bg-slate-950 text-white'
                          : 'bg-stone-100 text-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="bg-[#041a13] text-stone-100 rounded-3xl border border-amber-500/20 p-12 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="font-serif-luxury font-bold text-white text-lg">No Outfits Found</h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  Try clearing your search terms or picking another category from the sidebar.
                </p>
                <Link
                  href="/shop"
                  className="inline-block px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800"
                >
                  Reset All Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
                {products.map((prod) => {
                  const totalStock = prod.variants.reduce((s, v) => s + (v.stock || 0), 0);
                  const isOutOfStock = totalStock <= 0;
                  const uniqueColours = [...new Set(prod.variants.map((v) => v.colourCode || '#1E293B'))].slice(0, 4);

                  return (
                    <Link
                      key={prod.id}
                      href={`/product/${prod.slug}`}
                      className="group bg-[#041a13] text-stone-100 rounded-3xl overflow-hidden border border-amber-500/20/90 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                    >
                      <div className="aspect-[3/4] w-full overflow-hidden bg-stone-100 relative">
                        {(() => {
                          const colourSpecific = colourFilter
                            ? prod.images?.find((img) => img.colour && img.colour.toLowerCase() === colourFilter.toLowerCase())?.url
                            : null;
                          const cardImage = colourSpecific || prod.mainImage;
                          return cardImage ? (
                            <img
                              src={cardImage}
                              alt={prod.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                              No Photo
                            </div>
                          );
                        })()}

                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                          {prod.isNewArrival && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white shadow-xs">
                              NEW
                            </span>
                          )}
                          {isOutOfStock && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                              Sold Out
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                            {prod.category?.name}
                          </span>
                          <h3 className="font-serif-luxury font-bold text-white text-sm sm:text-base mt-1 line-clamp-2 leading-snug group-hover:text-emerald-800 transition-colors">
                            {prod.name}
                          </h3>

                          {/* Colour dots indicator on card */}
                          {uniqueColours.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2">
                              {uniqueColours.map((code, idx) => (
                                <span
                                  key={idx}
                                  className="w-3 h-3 rounded-full border border-black/20"
                                  style={{ backgroundColor: code }}
                                />
                              ))}
                              {prod.variants.length > 4 && (
                                <span className="text-[10px] text-slate-400 font-semibold">
                                  +{prod.variants.length - 4} shades
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="pt-3 mt-3 border-t border-stone-100 flex items-baseline justify-between">
                          <div>
                            <span className="text-base sm:text-lg font-black text-white font-serif-luxury">
                              {formatPrice(prod.sellingPrice, currencySymbol)}
                            </span>
                            {prod.originalPrice && prod.originalPrice > prod.sellingPrice && (
                              <span className="text-xs text-slate-400 line-through ml-1.5">
                                {formatPrice(prod.originalPrice, currencySymbol)}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-emerald-700 group-hover:underline">
                            Select Size &rarr;
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <StoreFooter settings={settings} />
    </div>
  );
}
