import { prisma } from '@/lib/prisma';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CheckCircle,
  ShoppingBag,
  MessageSquare,
  Truck,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OrderSuccessPage({ params, searchParams }) {
  const { orderNumber } = params;
  const waUrl = searchParams?.wa;

  const [settings, order] = await Promise.all([
    prisma.storeSettings.findUnique({ where: { id: 'default' } }),
    prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    }),
  ]);

  if (!order) {
    notFound();
  }

  const cleanPhone = (settings?.primaryPhone || '+919920517851').replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <StoreHeader settings={settings} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-xl space-y-8 text-center">
          {/* Success Checkmark */}
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-200">
            <CheckCircle size={36} />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Order Recorded Successfully
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
              Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Your order number is <strong className="text-slate-900 font-mono text-sm">{order.orderNumber}</strong>
            </p>
          </div>

          {/* WhatsApp Direct Action Banner */}
          <div className="p-6 rounded-3xl bg-emerald-50/80 border border-emerald-200 text-left space-y-3">
            <div className="flex items-center gap-2.5">
              <MessageSquare size={20} className="text-[#25D366]" />
              <h3 className="font-extrabold text-emerald-950 text-sm">
                Next Step: Send Message on WhatsApp
              </h3>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              If your WhatsApp window didn't open automatically, click the button below to send your pre-formatted order details directly to our sales concierge team.
            </p>

            <a
              href={waUrl || `https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs rounded-xl shadow-md transition-colors"
            >
              <MessageSquare size={16} />
              <span>Open WhatsApp to Confirm Order</span>
            </a>
          </div>

          {/* Order Snapshot Card */}
          <div className="border border-slate-200 rounded-2xl p-5 text-left text-xs space-y-4 bg-slate-50/50">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-800 text-sm">Order Summary</span>
              <span className="text-slate-400 font-mono">{formatDate(order.createdAt)}</span>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block">Customer Name:</span>
                  <strong className="text-slate-800">{order.customerName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Phone:</span>
                  <strong className="text-slate-800 font-mono">{order.customerPhone}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Delivery Address:</span>
                  <span className="text-slate-800 font-medium">
                    {order.deliveryAddress}{order.city ? `, ${order.city}` : ''}{order.postalCode ? ` (PIN: ${order.postalCode})` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="border-t border-slate-200 pt-3 space-y-2">
              <span className="font-bold text-slate-800 block">Items Ordered:</span>
              <div className="divide-y divide-slate-100">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-2 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">{item.productName}</p>
                      <p className="text-[10px] text-slate-500">
                        {item.colour} &bull; {item.size} &bull; Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-black text-slate-900">{formatPrice(item.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm font-black text-slate-900">
              <span>Grand Total:</span>
              <span className="text-emerald-700 text-base">{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-center gap-4">
            <Link
              href="/"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href="/shop"
              className="px-6 py-3 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl transition-colors"
            >
              Continue Browsing
            </Link>
          </div>
        </div>
      </main>

      <StoreFooter settings={settings} />
    </div>
  );
}
