import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Shield, Truck, RotateCcw, Scale } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const policy = await prisma.policy.findUnique({
    where: { slug: params.slug },
  });

  if (!policy) return { title: 'Policy | The Premiums Society' };

  return {
    title: `${policy.title} | The Premiums Society`,
  };
}

export default async function PolicyDetailPage({ params }) {
  const [settings, policy, allPolicies] = await Promise.all([
    prisma.storeSettings.findUnique({ where: { id: 'default' } }),
    prisma.policy.findUnique({ where: { slug: params.slug } }),
    prisma.policy.findMany({ orderBy: { title: 'asc' } }),
  ]);

  if (!policy) {
    notFound();
  }

  const icons = {
    'privacy-policy': Shield,
    'shipping-policy': Truck,
    'return-policy': RotateCcw,
    'terms-conditions': Scale,
  };
  const Icon = icons[policy.slug] || Shield;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <StoreHeader settings={settings} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-6">
          <Link href="/" className="hover:text-emerald-700">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Policies</span>
          <span>/</span>
          <span className="text-emerald-700 font-bold">{policy.title}</span>
        </div>

        {/* Policy Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {allPolicies.map((p) => (
            <Link
              key={p.slug}
              href={`/policies/${p.slug}`}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                p.slug === policy.slug
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {p.title}
            </Link>
          ))}
        </div>

        {/* Content Card */}
        <article className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Icon size={24} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {policy.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Last updated on: {formatDate(policy.updatedAt)} &bull; Official The Premiums Society Policy
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-slate-700 whitespace-pre-line space-y-4">
            {policy.content}
          </div>
        </article>
      </main>

      <StoreFooter settings={settings} />
    </div>
  );
}
