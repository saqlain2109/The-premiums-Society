'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from './ImageUploader';
import VariantManager from './VariantManager';
import Portal from '@/components/ui/Portal';
import {
  Save,
  CheckCircle,
  Eye,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  Tag,
  HelpCircle,
  X,
} from 'lucide-react';

export default function ProductForm({ initialData = null, isEdit = false }) {
  const router = useRouter();

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [sellingPrice, setSellingPrice] = useState(initialData?.sellingPrice ?? '');
  const [originalPrice, setOriginalPrice] = useState(initialData?.originalPrice ?? '');
  const [status, setStatus] = useState(initialData?.status || 'PUBLISHED');
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [isNewArrival, setIsNewArrival] = useState(initialData?.isNewArrival || false);

  // Photos state
  const [images, setImages] = useState(
    initialData?.images?.map((img) => ({
      url: typeof img === 'string' ? img : img.url,
      colour: typeof img === 'object' ? img.colour || '' : '',
    })) || (initialData?.mainImage ? [{ url: initialData.mainImage, colour: '' }] : [])
  );
  const [mainImage, setMainImage] = useState(initialData?.mainImage || '');

  // Variants state
  const [variants, setVariants] = useState(
    initialData?.variants?.map((v) => ({
      colour: v.colour,
      colourCode: v.colourCode || '#1E293B',
      size: v.size,
      stock: v.stock,
      price: v.price,
      sku: v.sku,
    })) || []
  );

  // Categories list
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState(
    (typeof window !== 'undefined' && (window.__STORE_CURRENCY_SYMBOL__ || localStorage.getItem('ar_currency_symbol'))) || '₹'
  );

  // Submission & Preview state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewActiveImage, setPreviewActiveImage] = useState('');
  const [previewSelectedColour, setPreviewSelectedColour] = useState('');

  // Sync preview active image and colour when preview opens
  useEffect(() => {
    if (previewOpen) {
      const firstImgUrl = mainImage || (images.length > 0 ? (typeof images[0] === 'string' ? images[0] : images[0]?.url) : '');
      setPreviewActiveImage(firstImgUrl);
      if (variants.length > 0) {
        setPreviewSelectedColour(variants[0].colour);
      }
    }
  }, [previewOpen, mainImage, images, variants]);

  const handlePreviewColourClick = (colourName) => {
    setPreviewSelectedColour(colourName);
    const matched = images.find((img) => {
      const c = typeof img === 'object' ? img.colour : '';
      return c && c.toLowerCase() === colourName.toLowerCase();
    });
    if (matched) {
      setPreviewActiveImage(typeof matched === 'string' ? matched : matched.url);
    }
  };

  // Load categories and settings
  useEffect(() => {
    async function loadCats() {
      try {
        const res = await fetch('/api/categories?admin=true');
        const data = await res.json();
        if (data.success && data.categories) {
          setCategories(data.categories);
          if (!categoryId && data.categories.length > 0) {
            setCategoryId(data.categories[0].id);
          }
        }

        const sRes = await fetch('/api/settings');
        const sData = await sRes.json();
        if (sData.success && sData.settings?.currencySymbol) {
          setCurrencySymbol(sData.settings.currencySymbol);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCats();
  }, []);

  // Validation
  const validate = () => {
    if (!name.trim()) return 'Product Name is required.';
    if (!categoryId) return 'Please select a Category.';
    if (!sku.trim()) return 'SKU / Product Code is required.';
    if (sellingPrice === '' || isNaN(Number(sellingPrice)) || Number(sellingPrice) < 0) {
      return 'Please enter a valid Selling Price.';
    }
    if (images.length === 0) {
      return 'Please upload at least one product photograph.';
    }
    if (variants.length === 0) {
      return 'Please configure at least one size & colour variant.';
    }
    return null;
  };

  // Submit Handler
  const handleSubmit = async (targetStatus) => {
    setFormError('');
    const error = validate();
    if (error) {
      setFormError(error);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    const chosenStatus = targetStatus || status;

    const payload = {
      name: name.trim(),
      description: description.trim(),
      categoryId,
      sku: sku.trim().toUpperCase(),
      sellingPrice: parseFloat(sellingPrice),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      status: chosenStatus,
      isFeatured: Boolean(isFeatured),
      isNewArrival: Boolean(isNewArrival),
      mainImage: mainImage || (images.length > 0 ? (typeof images[0] === 'string' ? images[0] : images[0].url) : null),
      images: images.map((img) => ({
        url: typeof img === 'string' ? img : img.url,
        colour: typeof img === 'object' && img.colour ? img.colour.trim() : null,
      })),
      variants,
    };

    try {
      const url = isEdit ? `/api/products/${initialData.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const token = typeof window !== 'undefined' ? localStorage.getItem('ar_admin_token') : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, {
        method,
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save product');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Error saving product');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-xs text-slate-500">
              {isEdit
                ? `Updating details for "${initialData?.name}" (${initialData?.sku})`
                : 'Publish or draft a new clothing piece to The Premiums Society storefront.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            <Eye size={15} />
            <span>Preview Product</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('DRAFT')}
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            <Save size={15} />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <CheckCircle size={15} />
            )}
            <span>Publish Product</span>
          </button>
        </div>
      </div>

      {/* Validation Error Banner */}
      {formError && (
        <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold rounded-2xl animate-shake">
          <AlertCircle size={20} className="shrink-0 text-rose-600" />
          <span className="flex-1">{formError}</span>
          <button onClick={() => setFormError('')} className="text-rose-500 hover:text-rose-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* 1. Basic Information Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Tag size={18} className="text-emerald-600" />
            <span>1. Basic Information</span>
          </h2>
          <span className="text-xs text-slate-400">* Required fields</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Product Name */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Royal Zari Embroidered Silk Panjabi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={loadingCategories}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* SKU / Product Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              SKU / Product Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. AR-PANJ-001"
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
            />
          </div>

          {/* Selling Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Selling Price ({currencySymbol}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 3850"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-800"
            />
          </div>

          {/* Original Price (Compare at) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Original Price ({currencySymbol}) <span className="text-slate-400 font-normal">(Optional Strikethrough)</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 4500"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Product Description */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Product Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe the fabric, threadwork, fit, occasion, wash care instructions, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          {/* Badges & Status toggles */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Publication Status */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Product Status</span>
                <span className="text-[11px] text-slate-500">
                  {status === 'PUBLISHED' ? 'Visible to customers' : 'Hidden from customers'}
                </span>
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`text-xs font-bold py-1.5 px-3 rounded-lg border cursor-pointer ${
                  status === 'PUBLISHED'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>

            {/* Featured Product */}
            <label className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Featured Product</span>
                <span className="text-[11px] text-slate-500">Show in homepage carousel</span>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </label>

            {/* New Arrival */}
            <label className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors">
              <div>
                <span className="text-xs font-bold text-slate-800 block">New Arrival</span>
                <span className="text-[11px] text-slate-500">Tag with "NEW" badge</span>
              </div>
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 2. Product Photographs Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ShoppingBag size={18} className="text-emerald-600" />
              <span>2. Product Photographs</span>
            </h2>
            <p className="text-xs text-slate-500">
              Upload actual photographs directly from your computer or phone. Saved persistently.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
            {images.length} photo(s) selected
          </span>
        </div>

        <ImageUploader
          images={images}
          onChange={setImages}
          mainImage={mainImage}
          onMainImageChange={setMainImage}
          availableColours={[...new Set(variants.map((v) => v.colour).filter(Boolean))]}
        />
      </div>

      {/* 3. Size and Colour Management Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Sparkles size={18} className="text-emerald-600" />
              <span>3. Size & Colour Management</span>
            </h2>
            <p className="text-xs text-slate-500">
              Configure independent stock for every size-colour pair. Support variant-specific pricing.
            </p>
          </div>
        </div>

        <VariantManager
          variants={variants}
          onChange={setVariants}
          basePrice={Number(sellingPrice) || 0}
          baseSku={sku}
          currencySymbol={currencySymbol}
        />
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-20 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-xs text-slate-400 hover:text-white underline font-medium"
          >
            Cancel
          </button>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-300">
            Status:{' '}
            <strong className={status === 'PUBLISHED' ? 'text-emerald-400' : 'text-amber-400'}>
              {status}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold transition-colors"
          >
            Preview Product
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('DRAFT')}
            disabled={submitting}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={submitting}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            <span>Publish Product</span>
          </button>
        </div>
      </div>

      {/* 4. Live Storefront Preview Modal (Portal) */}
      {previewOpen && (
        <Portal>
          <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
              {/* Modal Top Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold text-sm">Customer View Preview</span>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    {sku || 'NO-SKU'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Content simulating Customer PDP */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Photo Showcase */}
                  <div className="space-y-3">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                      {previewActiveImage ? (
                        <img
                          src={previewActiveImage}
                          alt={name || 'Product'}
                          className="w-full h-full object-cover transition-all duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                          No photo uploaded yet
                        </div>
                      )}
                    </div>

                    {images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {images.map((img, i) => {
                          const imgUrl = typeof img === 'string' ? img : img.url;
                          const imgColour = typeof img === 'object' ? img.colour : '';
                          const isSelected = previewActiveImage === imgUrl;
                          return (
                            <button
                              type="button"
                              key={i}
                              onClick={() => setPreviewActiveImage(imgUrl)}
                              className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all relative group ${
                                isSelected ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-slate-200 hover:border-slate-400'
                              }`}
                            >
                              <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                              {imgColour && (
                                <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[8px] text-white font-bold truncate px-1 text-center py-0.5">
                                  {imgColour}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Product Details Simulation */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                        {selectedCategoryObj?.name || 'Category'}
                      </span>
                      <h2 className="text-2xl font-black text-slate-900 mt-1">
                        {name || 'Product Title'}
                      </h2>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {sku || 'SKU'}</p>
                    </div>

                    {/* Price display */}
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-black text-slate-900">
                        {currencySymbol}{sellingPrice || '0'}
                      </span>
                      {originalPrice && Number(originalPrice) > Number(sellingPrice) && (
                        <span className="text-base text-slate-400 line-through">
                          {currencySymbol}{originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Available Colours Swatches */}
                    {variants.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-700">Colours:</label>
                          {previewSelectedColour && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Selected: {previewSelectedColour}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[...new Set(variants.map((v) => v.colour))].map((c) => {
                            const vObj = variants.find((x) => x.colour === c);
                            const isSelected = previewSelectedColour === c;
                            return (
                              <button
                                type="button"
                                key={c}
                                onClick={() => handlePreviewColourClick(c)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                                  isSelected
                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-xs'
                                    : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                                }`}
                              >
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                                  style={{ backgroundColor: vObj?.colourCode || '#1E293B' }}
                                />
                                <span>{c}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Available Sizes */}
                    {variants.length > 0 && (
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">
                          Sizes:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[...new Set(variants.map((v) => v.size))].map((s) => (
                            <span
                              key={s}
                              className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50 text-slate-700"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div className="border-t border-slate-200 pt-4">
                      <h4 className="text-xs font-bold text-slate-700 mb-1">Product Details</h4>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                        {description || 'No description provided.'}
                      </p>
                    </div>

                    {/* WhatsApp CTA Preview */}
                    <div className="pt-2">
                      <div className="w-full py-3 bg-[#25D366] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm">
                        <span>Direct WhatsApp Order Ready</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
