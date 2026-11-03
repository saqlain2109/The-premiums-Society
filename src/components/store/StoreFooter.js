import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck, Heart, Sparkles, MessageCircle } from 'lucide-react';

export default function StoreFooter({ settings = null }) {
  const businessName = settings?.businessName || 'The Premiums Society';
  const primaryPhone = settings?.primaryPhone || '+919920517851';
  const secondaryPhone = settings?.secondaryPhone || '+919920517851';
  const email = settings?.businessEmail || 'contact@thepremiums.in';
  const address = settings?.address;
  const storeLogo = settings?.storeLogo;
  const facebookUrl = settings?.facebookUrl;
  const instagramUrl = settings?.instagramUrl;
  const whatsappUrl = settings?.whatsappUrl;

  const initials = businessName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AR';

  const cleanPrimary = primaryPhone.replace(/[^0-9]/g, '');
  const cleanSecondary = secondaryPhone ? secondaryPhone.replace(/[^0-9]/g, '') : null;

  return (
    <footer className="bg-[#02130e] text-emerald-100/70 text-xs border-t border-amber-500/20">
      {/* Upper Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand Col */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            {storeLogo ? (
              <img
                src={storeLogo}
                alt={businessName}
                className="w-10 h-10 object-cover rounded-full border border-amber-500/40 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 to-emerald-950 border border-amber-500/40 text-amber-300 font-serif-luxury font-bold text-base flex items-center justify-center">
                {initials}
              </div>
            )}
            <div>
              <span className="font-serif-luxury font-bold text-white text-base block tracking-tight">
                {businessName}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-amber-400 font-bold block">
                Society &bull; Luxury Couture
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-normal">
            Handcrafted traditional & contemporary ethnic luxury clothing tailored for supreme perfection.
          </p>
          <div className="pt-2 text-[11px] text-amber-400 font-semibold flex items-center gap-1.5">
            <ShieldCheck size={14} />
            <span>100% Quality Fabrics & Handcraft</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-white font-serif-luxury font-bold text-sm tracking-wider uppercase">
            Quick Links
          </h4>
          <ul className="space-y-2 text-xs font-medium">
            <li>
              <Link href="/" className="hover:text-amber-400 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-amber-400 transition-colors">
                Complete Catalog
              </Link>
            </li>
            <li>
              <Link href="/shop?filter=featured" className="hover:text-amber-400 transition-colors">
                Featured Highlights
              </Link>
            </li>
            <li>
              <Link href="/shop?filter=new" className="hover:text-amber-400 transition-colors">
                New Arrivals
              </Link>
            </li>
            <li>
              <Link href="/#about" className="hover:text-amber-400 transition-colors">
                Brand Heritage
              </Link>
            </li>
          </ul>
        </div>

        {/* Store Policies */}
        <div className="space-y-3">
          <h4 className="text-white font-serif-luxury font-bold text-sm tracking-wider uppercase">
            Store Policies
          </h4>
          <ul className="space-y-2 text-xs font-medium">
            <li>
              <Link href="/policies/shipping-policy" className="hover:text-amber-400 transition-colors">
                Shipping & Express Delivery
              </Link>
            </li>
            <li>
              <Link href="/policies/return-policy" className="hover:text-amber-400 transition-colors">
                Return & Size Exchange
              </Link>
            </li>
            <li>
              <Link href="/policies/privacy-policy" className="hover:text-amber-400 transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/policies/terms-conditions" className="hover:text-amber-400 transition-colors">
                Terms and Conditions
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact info & WhatsApp order */}
        <div className="space-y-3">
          <h4 className="text-white font-serif-luxury font-bold text-sm tracking-wider uppercase">
            Contact & WhatsApp
          </h4>
          <div className="space-y-3 text-xs">
            {/* Primary Phone / WhatsApp */}
            <div className="flex items-start gap-2.5">
              <Phone size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <a
                  href={`https://wa.me/${cleanPrimary}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-slate-100 font-mono font-bold hover:text-amber-400 transition-colors"
                >
                  {primaryPhone}
                </a>
                <span className="text-[10px] text-amber-400/90 font-medium flex items-center gap-1">
                  <MessageCircle size={10} />
                  <span>Primary WhatsApp Helpline</span>
                </span>
              </div>
            </div>

            {/* Secondary Phone if available */}
            {secondaryPhone && (
              <div className="flex items-start gap-2.5">
                <Phone size={14} className="text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <a
                    href={`https://wa.me/${cleanSecondary}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-slate-100 font-mono font-bold hover:text-teal-400 transition-colors"
                  >
                    {secondaryPhone}
                  </a>
                  <span className="text-[10px] text-slate-400 font-medium">Secondary Line & WhatsApp</span>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="flex items-center gap-2.5">
              <Mail size={14} className="text-amber-400 shrink-0" />
              <a
                href={`mailto:${email}`}
                className="text-slate-300 hover:text-white transition-colors"
              >
                {email}
              </a>
            </div>

            {/* Physical address only if owner configured it in settings */}
            {address && address.trim() !== '' && (
              <div className="flex items-start gap-2.5 pt-1">
                <MapPin size={14} className="text-amber-400 shrink-0 mt-0.5" />
                <span className="text-slate-400 leading-relaxed">{address}</span>
              </div>
            )}

            {/* Social Media Links */}
            {(facebookUrl || instagramUrl || whatsappUrl) && (
              <div className="pt-2 flex items-center gap-3">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-amber-400 hover:text-white hover:bg-emerald-900 transition-colors"
                    title="WhatsApp"
                  >
                    <MessageCircle size={13} />
                  </a>
                )}
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-blue-900/50 transition-colors"
                    title="Facebook"
                  >
                    <span className="font-bold text-[10px] px-0.5">fb</span>
                  </a>
                )}
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-pink-900/50 transition-colors"
                    title="Instagram"
                  >
                    <span className="font-bold text-[10px] px-0.5">ig</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800/80 bg-[#070D1E] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>&copy; {new Date().getFullYear()} {businessName}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Handcrafted with <Heart size={12} className="text-rose-500 fill-rose-500 inline" /> for fashion connoisseurs.
          </p>
        </div>
      </div>
    </footer>
  );
}
