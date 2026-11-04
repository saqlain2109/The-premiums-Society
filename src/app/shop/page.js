import { prisma } from '@/lib/prisma';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import ShopClient from '@/components/store/ShopClient';
import Link from 'next/link';
import {
  ShoppingBag,
  Sparkles,
  ArrowRight,
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
  const filterType = searchParams?.filter;

  const [settings, content, categories] = await Promise.all([
    prisma.storeSettings.findUnique({ where: { id: 'default' } }),
    prisma.websiteContent.findUnique({ where: { id: 'default' } }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    }),
  ]);

  const currencySymbol = settings?.currencySymbol || '₹';

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

  const allVariants = await prisma.productVariant.findMany({
    where: { product: { status: 'PUBLISHED' } },
    select: { size: true, colour: true, colourCode: true },
  });

  const availableSizes = [...new Set(allVariants.map((v) => v.size).filter(Boolean))];
  const availableColours = [...new Set(allVariants.map((v) => v.colour).filter(Boolean))];

  return (
    <div className="min-h-screen flex flex-col bg-[#071712] text-stone-100 overflow-x-hidden">
      <StoreHeader categories={categories} settings={settings} content={content} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header Breadcrumb & Title */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-amber-500/20 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-400 font-medium mb-1.5">
              <Link href="/" className="hover:text-amber-300 transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-amber-300 font-bold">Catalog</span>
              {categorySlug && (
                <>
                  <span>/</span>
                  <span className="text-stone-200 capitalize font-medium">
                    {categorySlug.replace(/-/g, ' ')}
                  </span>
                </>
              )}
            </div>

            <h1 className="font-serif-luxury text-2xl sm:text-4xl font-black text-white tracking-tight">
              {categorySlug
                ? categories.find((c) => c.slug === categorySlug)?.name || 'Collection'
                : filterType === 'featured'
                ? 'Featured Highlights'
                : filterType === 'new'
                ? 'New Arrivals 2026'
                : 'All Outfits & Collections'}
            </h1>
          </div>

          <div className="text-xs text-emerald-200/80 font-medium">
            Showing <strong className="text-amber-300 font-black text-sm">{products.length}</strong> masterwork(s)
          </div>
        </div>

        {/* Clean On-Demand Filter Bar & Drawer */}
        <ShopClient
          categories={categories}
          availableSizes={availableSizes}
          availableColours={availableColours}
          allVariants={allVariants}
          totalCount={products.length}
          initialSort={sort}
          currentCategory={categorySlug}
          currentSize={sizeFilter}
          currentColour={colourFilter}
          currentInStock={inStockOnly}
          filterType={filterType}
          searchQuery={searchQuery}
        />

        {/* Full-Width Product Grid (No more tall sidebar pushing products down!) */}
        {products.length === 0 ? (
          <div className="bg-[#041a13] rounded-3xl border border-amber-500/20 p-12 sm:p-16 text-center space-y-4 max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-amber-500/30 text-amber-300 flex items-center justify-center mx-auto">
              <ShoppingBag size={28} />
            </div>
            <h3 className="font-serif-luxury font-bold text-white text-xl">No Matching Outfits Found</h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              We couldn't find any piece matching your active filters. Try resetting your filters to explore our full wardrobe.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 rounded-xl text-xs font-black hover:from-amber-300 hover:to-amber-400 shadow-lg transition-all"
            >
              <span>Reset All Filters</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {products.map((prod) => {
              const totalStock = prod.variants.reduce((s, v) => s + (v.stock || 0), 0);
              const isOutOfStock = totalStock <= 0;
              const uniqueColours = [...new Set(prod.variants.map((v) => v.colourCode || '#1E293B'))].slice(0, 4);

              return (
                <Link
                  key={prod.id}
                  href={`/product/${prod.slug}`}
                  className="group bg-[#041a13] rounded-2xl sm:rounded-3xl overflow-hidden border border-amber-500/20 shadow-md hover:shadow-2xl hover:border-amber-400/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-stone-900 relative">
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
                        <div className="w-full h-full flex items-center justify-center text-stone-500 text-xs">
                          No Photo
                        </div>
                      );
                    })()}

                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                      {prod.isNewArrival && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-md">
                          NEW
                        </span>
                      )}
                      {isOutOfStock && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-md">
                          Sold Out
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-amber-300 uppercase tracking-widest block truncate">
                        {prod.category?.name || 'Outfit'}
                      </span>
                      <h3 className="font-serif-luxury font-bold text-stone-100 text-xs sm:text-sm mt-0.5 line-clamp-1 group-hover:text-amber-300 transition-colors">
                        {prod.name}
                      </h3>

                      {uniqueColours.length > 0 && (
                        <div className="flex items-center gap-1 mt-1.5">
                          {uniqueColours.map((code, idx) => (
                            <span
                              key={idx}
                              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-black/30 shadow-xs"
                              style={{ backgroundColor: code }}
                            />
                          ))}
                          {prod.variants.length > 4 && (
                            <span className="text-[9px] text-stone-400 font-bold ml-1">
                              +{prod.variants.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-baseline justify-between">
                      <div>
                        <span className="text-sm sm:text-base font-black text-amber-300">
                          {formatPrice(prod.sellingPrice, currencySymbol)}
                        </span>
                        {prod.originalPrice && prod.originalPrice > prod.sellingPrice && (
                          <span className="text-[10px] sm:text-xs text-stone-500 line-through ml-1.5">
                            {formatPrice(prod.originalPrice, currencySymbol)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-amber-400 group-hover:text-amber-300">
                        View &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <StoreFooter settings={settings} />
    </div>
  );
}
