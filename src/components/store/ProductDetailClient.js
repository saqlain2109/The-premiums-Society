'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from './CartContext';
import {
  ShoppingBag,
  Check,
  Phone,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Minus,
  Plus,
  Share2,
  AlertCircle,
  Camera,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function ProductDetailClient({ product, settings }) {
  const { addToCart, setDrawerOpen } = useCart();

  // 1. Raw image objects with optional colour tags: [{ url, colour }, ...]
  const rawImages = useMemo(() => {
    const list = (product.images || []).map((img) => ({
      url: typeof img === 'string' ? img : img.url,
      colour: typeof img === 'object' ? img.colour || '' : '',
    }));
    if (product.mainImage && !list.some((i) => i.url === product.mainImage)) {
      list.unshift({ url: product.mainImage, colour: '' });
    }
    return list.length > 0
      ? list
      : [{ url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80', colour: '' }];
  }, [product]);

  // 2. Extract all unique colour variants
  const availableColours = useMemo(() => {
    const map = new Map();
    (product.variants || []).forEach((v) => {
      if (!map.has(v.colour)) {
        // Find if any image is specifically tagged for this colour
        const colourImg = rawImages.find(
          (img) => img.colour && img.colour.toLowerCase() === v.colour.toLowerCase()
        );
        map.set(v.colour, {
          name: v.colour,
          code: v.colourCode || '#1E293B',
          imageUrl: colourImg ? colourImg.url : rawImages[0]?.url,
        });
      }
    });
    return Array.from(map.values());
  }, [product.variants, rawImages]);

  // Active colour selection
  const [selectedColour, setSelectedColour] = useState(
    availableColours[0]?.name || ''
  );

  // 3. Dynamically filter displayed images based on selectedColour!
  // If images exist specifically tagged for this colour, show those colour images!
  // Otherwise show all general images.
  const displayedImages = useMemo(() => {
    if (!selectedColour) return rawImages.map((i) => i.url);
    const colourSpecific = rawImages.filter(
      (img) => img.colour && img.colour.toLowerCase() === selectedColour.toLowerCase()
    );
    if (colourSpecific.length > 0) {
      // Return images tagged for this colour, followed by untagged general photos
      const general = rawImages.filter((img) => !img.colour);
      return [...colourSpecific, ...general].map((i) => i.url);
    }
    return rawImages.map((i) => i.url);
  }, [rawImages, selectedColour]);

  // Active display image (switches when colour or thumbnail clicked)
  const [activeImage, setActiveImage] = useState(
    displayedImages[0] || rawImages[0]?.url
  );

  // Available sizes under the selected colour
  const sizesForColour = useMemo(() => {
    return (product.variants || []).filter((v) => v.colour === selectedColour);
  }, [product.variants, selectedColour]);

  // Selected Variant ID
  const [selectedVariantId, setSelectedVariantId] = useState(
    sizesForColour[0]?.id || ''
  );

  // Quantity state
  const [quantity, setQuantity] = useState(1);

  // When selectedColour changes:
  // 1. Switch the main image to the color's first photo
  // 2. Filter the thumbnail carousel to photos for this color
  // 3. Select the first available size in that color
  // 4. Reset quantity to 1
  const handleColourChange = (colourObj) => {
    setSelectedColour(colourObj.name);

    // Find first photo specifically for this colour
    const matchImg = rawImages.find(
      (img) => img.colour && img.colour.toLowerCase() === colourObj.name.toLowerCase()
    );

    if (matchImg) {
      setActiveImage(matchImg.url);
    } else if (colourObj.imageUrl) {
      setActiveImage(colourObj.imageUrl);
    }

    const availableVariants = (product.variants || []).filter((v) => v.colour === colourObj.name);
    if (availableVariants.length > 0) {
      const inStockOne = availableVariants.find((v) => v.stock > 0) || availableVariants[0];
      setSelectedVariantId(inStockOne.id);
      setQuantity(1);
    }
  };

  // Currently active variant object
  const activeVariant = useMemo(() => {
    return (
      (product.variants || []).find((v) => v.id === selectedVariantId) ||
      sizesForColour[0] ||
      null
    );
  }, [product.variants, selectedVariantId, sizesForColour]);

  // Pricing calculation
  const effectivePrice =
    activeVariant?.price !== null && activeVariant?.price !== undefined
      ? activeVariant.price
      : product.sellingPrice;

  const isOutOfStock = !activeVariant || activeVariant.stock <= 0;
  const maxStock = activeVariant?.stock || 0;

  // Add to cart handler
  const handleAddToCart = () => {
    if (isOutOfStock || !activeVariant) return;
    addToCart(product, activeVariant, quantity);
  };

  const currencySymbol = settings?.currencySymbol || '₹';
  const waPhone = settings?.primaryPhone || '+919920517851';
  const cleanPhone = waPhone.replace(/[^0-9]/g, '');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
      {/* 1. High-Resolution Photographs Showcase with Dynamic Colour Filter */}
      <div className="space-y-4">
        {/* Main Display Image */}
        <div className="aspect-[3/4] w-full rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/90 shadow-md relative group">
          <img
            key={activeImage} // Key triggers smooth transition on colour switch
            src={activeImage}
            alt={`${product.name} in ${selectedColour}`}
            className="w-full h-full object-cover transition-all duration-500 animate-fade-in group-hover:scale-105"
          />

          {/* Active Colour Indicator Badge on Photo */}
          <div className="absolute bottom-4 left-4 bg-slate-950/85 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-lg border border-white/10">
            <span
              className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-xs"
              style={{
                backgroundColor:
                  availableColours.find((c) => c.name === selectedColour)?.code || '#1E293B',
              }}
            />
            <span className="font-bold">{selectedColour}</span>
            {displayedImages.length > 1 && (
              <span className="text-[10px] text-slate-300 border-l border-slate-600 pl-2">
                {displayedImages.length} photos
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            {product.isNewArrival && (
              <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                New Arrival
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-rose-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Thumbnails list filtered for this specific colour */}
        {displayedImages.length > 1 ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
              <span className="flex items-center gap-1.5">
                <Camera size={13} className="text-emerald-700" />
                <span>Photographs in {selectedColour}</span>
              </span>
              <span className="text-[10px] text-slate-400">Click photo to zoom</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {displayedImages.map((img, idx) => (
                <button
                  key={img + idx}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-24 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImage === img
                      ? 'border-emerald-700 ring-2 ring-emerald-600/30 scale-105 shadow-md'
                      : 'border-stone-200 opacity-70 hover:opacity-100 hover:border-slate-400'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Primary view for {selectedColour}</span>
          </div>
        )}
      </div>

      {/* 2. Interactive Product Details & Variant Selectors */}
      <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm">
        <div>
          <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            {product.category?.name || 'Exclusive Attire'}
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight mt-3 leading-snug">
            {product.name}
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1.5">
            SKU: <strong className="text-slate-700">{activeVariant?.sku || product.sku}</strong>
          </p>
        </div>

        {/* Price Display */}
        <div className="flex items-baseline gap-3 pb-4 border-b border-stone-100">
          <span className="text-3xl sm:text-4xl font-black text-slate-950 font-serif-luxury">
            {formatPrice(effectivePrice, currencySymbol)}
          </span>
          {product.originalPrice && product.originalPrice > effectivePrice && (
            <>
              <span className="text-lg text-slate-400 line-through">
                {formatPrice(product.originalPrice, currencySymbol)}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200">
                Save {formatPrice(product.originalPrice - effectivePrice, currencySymbol)}
              </span>
            </>
          )}
        </div>

        {/* 1. Interactive Colour Switcher (Switches photo & sizes!) */}
        {availableColours.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <span>Select Colour:</span>
                <strong className="text-emerald-800">{selectedColour}</strong>
              </span>
              <span className="text-slate-400 font-normal">
                ({availableColours.length} options available)
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {availableColours.map((c) => {
                const isSelected = selectedColour === c.name;
                const colourStock = (product.variants || [])
                  .filter((v) => v.colour === c.name)
                  .reduce((sum, v) => sum + v.stock, 0);

                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleColourChange(c)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50/50 text-emerald-950 font-bold shadow-xs'
                        : 'border-stone-200 hover:border-stone-400 text-slate-700'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-2xs"
                      style={{ backgroundColor: c.code }}
                    />
                    <span className="text-xs">{c.name}</span>
                    {colourStock <= 0 ? (
                      <span className="text-[10px] text-rose-500 font-bold">(Sold Out)</span>
                    ) : isSelected ? (
                      <Check size={13} className="text-emerald-700" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Interactive Size Selector */}
        {sizesForColour.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Select Size:</span>
              {activeVariant && (
                <span className="text-slate-500 font-medium">
                  {activeVariant.stock > 0 ? (
                    <span className="text-emerald-700 font-bold">
                      {activeVariant.stock <= 5
                        ? `Only ${activeVariant.stock} left in stock!`
                        : `In Stock (${activeVariant.stock} units)`}
                    </span>
                  ) : (
                    <span className="text-rose-600 font-bold">Out of stock in this size</span>
                  )}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {sizesForColour.map((v) => {
                const isSelected = selectedVariantId === v.id;
                const outOfStock = v.stock <= 0;

                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={outOfStock}
                    onClick={() => {
                      setSelectedVariantId(v.id);
                      setQuantity(1);
                    }}
                    className={`py-3 px-2 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-600 text-white font-black shadow-md'
                        : outOfStock
                        ? 'border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed line-through'
                        : 'border-stone-200 bg-white hover:border-emerald-600 text-slate-800 font-bold'
                    }`}
                  >
                    <span className="text-xs font-mono">{v.size}</span>
                    {v.price && v.price !== product.sellingPrice && (
                      <span
                        className={`text-[10px] ${
                          isSelected ? 'text-emerald-100' : 'text-slate-400'
                        }`}
                      >
                        {formatPrice(v.price, currencySymbol)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Quantity Counter */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-slate-800 block">Quantity:</label>
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-stone-300 rounded-2xl overflow-hidden bg-stone-50">
              <button
                type="button"
                disabled={quantity <= 1 || isOutOfStock}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2.5 hover:bg-stone-200 text-slate-700 disabled:opacity-40 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={15} />
              </button>
              <span className="w-12 text-center text-sm font-bold text-slate-900 font-mono">
                {quantity}
              </span>
              <button
                type="button"
                disabled={quantity >= maxStock || isOutOfStock}
                onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                className="p-2.5 hover:bg-stone-200 text-slate-700 disabled:opacity-40 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={15} />
              </button>
            </div>
            <div className="text-xs text-slate-600">
              Total: <strong className="text-slate-900 font-black text-sm">{formatPrice(effectivePrice * quantity, currencySymbol)}</strong>
            </div>
          </div>
        </div>

        {/* 4. Action Buttons */}
        <div className="space-y-3 pt-3">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2.5 shadow-lg ${
              isOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/25 active:scale-[0.99] cursor-pointer'
            }`}
          >
            <ShoppingBag size={18} />
            <span>{isOutOfStock ? 'Sold Out in this Combination' : 'Add to Bag'}</span>
          </button>

          {/* Quick WhatsApp Inquiry for this outfit */}
          <a
            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `Hello The Premiums Society, I want to inquire about "${product.name}" in Colour: ${selectedColour}, Size: ${activeVariant?.size || 'Standard'}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-2xl font-bold text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300/80 flex items-center justify-center gap-2 transition-all"
          >
            <Phone size={15} className="text-emerald-700" />
            <span>Chat on WhatsApp about this piece</span>
          </a>
        </div>

        {/* 5. Trust & Delivery Guarantees */}
        <div className="pt-4 border-t border-stone-200 grid grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <Truck size={17} className="text-emerald-700 shrink-0" />
            <span>Nationwide Express Delivery</span>
          </div>
          <div className="flex items-center gap-2.5">
            <RotateCcw size={17} className="text-emerald-700 shrink-0" />
            <span>7-Day Easy Size Exchange</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={17} className="text-emerald-700 shrink-0" />
            <span>100% Authentic Handloom & Silks</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Sparkles size={17} className="text-emerald-700 shrink-0" />
            <span>Handcrafted Embroidery</span>
          </div>
        </div>

        {/* 6. Product Description */}
        <div className="pt-4 border-t border-stone-200 space-y-2">
          <h3 className="font-bold text-slate-900 text-sm">Product Description & Care:</h3>
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      </div>
    </div>
  );
}
