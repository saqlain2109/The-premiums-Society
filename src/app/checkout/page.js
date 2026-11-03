'use client';
import { useState } from 'react';
import { useCart } from '@/components/store/CartContext';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Truck,
  MessageSquare,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, subtotal, totalCount, clearCart, settings, currencySymbol, formatPrice } = useCart();
  const router = useRouter();

  // Delivery Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');

  // Processing state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Shipping calculation (Flat All-India Express Delivery or Free Shipping above threshold)
  const freeThreshold = settings?.freeShippingThreshold ?? 2000;
  const isFreeShipping = subtotal >= freeThreshold;
  const shippingCharge = isFreeShipping ? 0 : (settings?.shippingCharge ?? 100);
  const grandTotal = subtotal + shippingCharge;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (cart.length === 0) {
      setErrorMessage('Your shopping bag is empty. Please add items before placing order.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMessage('Please enter your WhatsApp / mobile phone number.');
      return;
    }

    if (!deliveryAddress.trim()) {
      setErrorMessage('Please enter your full delivery address.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        city: '',
        postalCode: postalCode.trim() || null,
        notes: notes.trim() || null,
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          variantId: item.variantId,
          colour: item.colour,
          size: item.size,
          quantity: item.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process order.');
      }

      // Clear the client-side cart
      clearCart();

      // Launch WhatsApp direct order window
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank');
      }

      // Redirect customer to order success confirmation page
      router.push(`/order-success/${data.order.orderNumber}?wa=${encodeURIComponent(data.whatsappUrl || '')}`);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred during order submission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 overflow-x-hidden">
      <StoreHeader settings={settings} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Secure WhatsApp Checkout
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mt-2">
            Delivery & Order Confirmation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provide your recipient information to generate your verified database order and connect with our concierge.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl flex items-center gap-2.5 animate-shake">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3 max-w-md mx-auto my-8">
            <h3 className="font-serif-luxury font-bold text-slate-900 text-lg">Your shopping bag is empty</h3>
            <p className="text-xs text-slate-500">Please choose your outfits before proceeding to checkout.</p>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800"
            >
              Browse Collections
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Delivery Form Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-sm space-y-5">
                <h2 className="font-serif-luxury text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-stone-100 pb-3">
                  <Truck size={19} className="text-emerald-700" />
                  <span>1. Recipient & Delivery Information</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-bold text-slate-700">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-bold text-slate-700">
                      WhatsApp / Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9920517851 or +91 9876543210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <p className="text-[11px] text-slate-400">
                      Order status and dispatch confirmation will be shared on this WhatsApp number.
                    </p>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-bold text-slate-700">
                      Full Delivery Address (Flat/House No, Building, Street, Area, Landmark) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g. Flat 402, Sunshine Heights, MG Road, Near City Mall, Landmark: Next to HDFC Bank..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-bold text-slate-700">Postal / PIN Code (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 400001 or 110001"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-bold text-slate-700">Order Instructions (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Gift wrapping requested, deliver after 5 PM, call upon arrival..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary & Place Button Column */}
            <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-sm space-y-5">
              <h3 className="font-serif-luxury font-bold text-slate-900 text-base border-b border-stone-100 pb-3 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-mono text-slate-400 font-normal">{totalCount} item(s)</span>
              </h3>

              {/* Items mini list */}
              <div className="max-h-56 overflow-y-auto space-y-2.5 divide-y divide-stone-100 pr-1 scrollbar-thin text-xs">
                {cart.map((item) => (
                  <div key={item.id} className="pt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-stone-100 overflow-hidden border border-stone-200 shrink-0">
                        {item.productImage && (
                          <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate max-w-[150px]">
                          {item.productName}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {item.colour} &bull; {item.size} &bull; Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 shrink-0">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Breakdown */}
              <div className="border-t border-stone-200 pt-3 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span className="font-bold text-slate-900">
                    {isFreeShipping ? (
                      <span className="text-emerald-700 uppercase font-black">
                        Free (Over {formatPrice(freeThreshold, currencySymbol)})
                      </span>
                    ) : (
                      formatPrice(shippingCharge, currencySymbol)
                    )}
                  </span>
                </div>
                <div className="border-t border-stone-100 pt-3 flex justify-between text-base font-black text-slate-950 font-serif-luxury">
                  <span>Total Payable:</span>
                  <span className="text-emerald-800 text-lg">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* WhatsApp Checkout Primary Action */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-white font-black text-sm rounded-2xl shadow-xl shadow-green-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Confirming Order...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare size={18} />
                    <span>Confirm Order via WhatsApp</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
                <p className="flex items-center gap-1.5 text-slate-600 font-semibold">
                  <CheckCircle2 size={13} className="text-emerald-700 shrink-0" />
                  <span>Real database order created with unique tracking ID.</span>
                </p>
                <p className="flex items-center gap-1.5 text-slate-600 font-semibold">
                  <ShieldCheck size={13} className="text-emerald-700 shrink-0" />
                  <span>Cash on Delivery upon parcel handover.</span>
                </p>
              </div>
            </div>
          </form>
        )}
      </main>

      <StoreFooter settings={settings} />
    </div>
  );
}
