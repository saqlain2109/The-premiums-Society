import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import ProductDetailClient from '@/components/store/ProductDetailClient';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export async function generateMetadata({ params }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true, mainImage: true },
  });

  if (!product) return { title: 'Product Not Found | The Premiums Society' };

  return {
    title: `${product.name} | The Premiums Society`,
    description: product.description?.slice(0, 160) || 'Shop online at The Premiums Society.',
    openGraph: {
      images: product.mainImage ? [product.mainImage] : [],
    },
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductDetailPage({ params }) {
  const [settings, content, product, categories] = await Promise.all([
    prisma.storeSettings.findUnique({ where: { id: 'default' } }),
    prisma.websiteContent.findUnique({ where: { id: 'default' } }),
    prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
        variants: { orderBy: { size: 'asc' } },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    }),
  ]);

  // Draft products must remain hidden from customers!
  if (!product || product.status !== 'PUBLISHED') {
    notFound();
  }

  // Related products from same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      status: 'PUBLISHED',
      id: { not: product.id },
    },
    take: 4,
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <StoreHeader categories={categories} settings={settings} content={content} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-emerald-700">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-emerald-700">
            Shop
          </Link>
          <span>/</span>
          <Link
            href={`/shop?category=${product.category?.slug}`}
            className="hover:text-emerald-700 capitalize"
          >
            {product.category?.name}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-bold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Interactive Client PDP */}
        <ProductDetailClient product={product} settings={settings} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-slate-200/90 pt-12">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-6">
              You Might Also Like
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-slate-100">
                    {p.mainImage && (
                      <img
                        src={p.mainImage}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-1 group-hover:text-emerald-700">
                      {p.name}
                    </h4>
                    <p className="font-black text-slate-900 text-sm mt-2">
                      {formatPrice(p.sellingPrice)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <StoreFooter settings={settings} />
    </div>
  );
}
