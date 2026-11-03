'use client';
import { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Building,
  Phone,
  Mail,
  Truck,
  DollarSign,
  Share2,
  MapPin,
  Megaphone,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const body = new FormData();
    body.append('files', file);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('ar_admin_token') : null;
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers,
        credentials: 'include',
        body,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');
      setSettings((prev) => ({ ...prev, storeLogo: data.urls[0] }));
      showToast('Logo uploaded!');
    } catch (err) {
      setErrorMessage(err.message || 'Logo upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('ar_admin_token') : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save settings');

      setSettings(data.settings);
      if (typeof window !== 'undefined') {
        const sym = data.settings.currencySymbol || '₹';
        window.__STORE_CURRENCY_SYMBOL__ = sym;
        localStorage.setItem('ar_currency_symbol', sym);
        localStorage.setItem('ar_currency_code', data.settings.currency || 'INR');
        window.dispatchEvent(new CustomEvent('store_settings_updated', { detail: data.settings }));
      }
      showToast(`Settings saved! Currency updated to ${data.settings.currencySymbol || '₹'} (${data.settings.currency || 'INR'})`);
    } catch (err) {
      setErrorMessage(err.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 size={32} className="animate-spin text-emerald-600 mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-semibold">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Store Settings</h1>
          <p className="text-xs text-slate-500">
            Configure contact information, WhatsApp recipients, delivery charges, and store policies.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          <span>Save Settings</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* 1. General & Brand */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building size={18} className="text-emerald-600" />
            <span>Store Identity & Logo</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Business Name</label>
              <input
                type="text"
                required
                value={settings.businessName || ''}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Business Support Email</label>
              <input
                type="email"
                required
                value={settings.businessEmail || ''}
                onChange={(e) => setSettings({ ...settings, businessEmail: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
              />
            </div>

            {/* Store Logo */}
            <div className="md:col-span-2 space-y-2 pt-2">
              <label className="font-bold text-slate-700 block">Store Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 relative group">
                  {settings.storeLogo ? (
                    <>
                      <img src={settings.storeLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                      <button
                        type="button"
                        onClick={() => setSettings((prev) => ({ ...prev, storeLogo: null }))}
                        className="absolute inset-0 bg-black/60 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold">No Logo</span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors text-xs">
                      <Upload size={14} />
                      <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo File'}</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                    {settings.storeLogo && (
                      <span className="text-[11px] text-emerald-600 font-semibold">Custom logo active</span>
                    )}
                  </div>
                  <input
                    type="url"
                    placeholder="Or enter logo URL (e.g. https://... or /uploads/...)..."
                    value={settings.storeLogo || ''}
                    onChange={(e) => setSettings({ ...settings, storeLogo: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. WhatsApp Numbers & Recipient Routing */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Phone size={18} className="text-emerald-600" />
            <span>WhatsApp Order Routing</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Primary WhatsApp Number *</label>
              <input
                type="text"
                required
                placeholder="+919920517851"
                value={settings.primaryPhone || ''}
                onChange={(e) => setSettings({ ...settings, primaryPhone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
              <p className="text-[10px] text-slate-400">Include country code (e.g. +91 9920517851)</p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Secondary WhatsApp Number</label>
              <input
                type="text"
                placeholder="+919920517851"
                value={settings.secondaryPhone || ''}
                onChange={(e) => setSettings({ ...settings, secondaryPhone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
              <p className="text-[10px] text-slate-400">Backup recipient line (e.g. +91 9920517851)</p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Default WhatsApp Recipient</label>
              <select
                value={settings.defaultRecipient || 'primary'}
                onChange={(e) => setSettings({ ...settings, defaultRecipient: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
              >
                <option value="primary">Primary WhatsApp Number</option>
                <option value="secondary">Secondary WhatsApp Number</option>
              </select>
              <p className="text-[10px] text-slate-400">Where customer checkout chats open</p>
            </div>
          </div>
        </div>

        {/* 3. Currency & Delivery Fees */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Truck size={18} className="text-emerald-600" />
            <span>Shipping & Currency Settings</span>
          </h2>

          {/* Quick Currency Selector Presets */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="font-bold text-slate-700 block text-xs">
              Quick Currency Presets (Click to switch store currency)
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { code: 'INR', symbol: '₹', label: '₹ INR (Indian Rupee)' },
                { code: 'USD', symbol: '$', label: '$ USD (US Dollar)' },
                { code: 'AED', symbol: 'AED ', label: 'AED (UAE Dirham)' },
                { code: 'GBP', symbol: '£', label: '£ GBP (British Pound)' },
                { code: 'EUR', symbol: '€', label: '€ EUR (Euro)' },
                { code: 'CAD', symbol: 'C$', label: 'C$ CAD (Canadian Dollar)' },
                { code: 'AUD', symbol: 'A$', label: 'A$ AUD (Australian Dollar)' },
              ].map((preset) => {
                const isSelected =
                  settings?.currency === preset.code && settings?.currencySymbol === preset.symbol;
                return (
                  <button
                    key={preset.code}
                    type="button"
                    onClick={() => {
                      setSettings({
                        ...settings,
                        currency: preset.code,
                        currencySymbol: preset.symbol,
                      });
                      showToast(`Switched currency to ${preset.symbol} (${preset.code}) - Click "Save Settings" to apply!`);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Currency Code</label>
              <input
                type="text"
                value={settings?.currency ?? ''}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                placeholder="e.g. INR, BDT, USD"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Currency Symbol</label>
              <input
                type="text"
                value={settings?.currencySymbol ?? ''}
                onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                placeholder="e.g. ₹, $, AED, £"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">
                Standard Delivery Fee ({settings?.currencySymbol || '₹'})
              </label>
              <input
                type="number"
                min="0"
                value={settings?.shippingCharge ?? 100}
                onChange={(e) => setSettings({ ...settings, shippingCharge: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">
                Free Shipping Threshold ({settings?.currencySymbol || '₹'})
              </label>
              <input
                type="number"
                min="0"
                value={settings?.freeShippingThreshold ?? 2000}
                onChange={(e) =>
                  setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
            </div>
          </div>
        </div>

        {/* 4. Store Announcement & Physical Address */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Megaphone size={18} className="text-emerald-600" />
            <span>Store Announcement & Address</span>
          </h2>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">Storewide Announcement Bar Text</label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.announcementActive}
                    onChange={(e) => setSettings({ ...settings, announcementActive: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-emerald-600"
                  />
                  <span className="font-semibold text-slate-600 text-[11px]">Show on Website</span>
                </label>
              </div>
              <input
                type="text"
                value={settings.storeAnnouncement || ''}
                onChange={(e) => setSettings({ ...settings, storeAnnouncement: e.target.value })}
                placeholder="e.g. Free Delivery on orders above ₹2000 across India!"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Physical Store Address & Location</label>
              <textarea
                rows={2}
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="Outlet / Head office address..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* 5. Social Media Links */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Share2 size={18} className="text-emerald-600" />
            <span>Social Media Channels</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Facebook Page URL</label>
              <input
                type="url"
                value={settings.facebookUrl || ''}
                onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Instagram Profile URL</label>
              <input
                type="url"
                value={settings.instagramUrl || ''}
                onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save CTA */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-emerald-700/20 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Save All Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
