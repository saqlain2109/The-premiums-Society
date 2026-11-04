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
  Navigation,
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

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setSettings((prev) => ({ ...prev, storeLogo: data.url }));
        showToast('Logo uploaded! Click "Save" below to apply changes.');
      } else {
        alert(data.error || 'Failed to upload logo');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading file');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        showToast('Store settings & map coordinates saved successfully!');
      } else {
        setErrorMessage(data.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error while saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 size={36} className="animate-spin text-emerald-600 mb-2" />
        <p className="text-xs font-semibold">Loading Store Configuration...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center">
        <AlertCircle size={36} className="text-rose-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800">Unable to Load Settings</h3>
        <p className="text-xs text-slate-500 mt-1">Please refresh the page to retry.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-slate-800 animate-in slide-in-from-bottom duration-200">
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-serif-luxury">
            Store & Location Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure boutique identity, contact helplines, GPS coordinates, interactive map & social media.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-700/20 disabled:opacity-50"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* 1. Identity & Logo */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building size={18} className="text-emerald-600" />
            <span>Storefront Brand & Logo</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Business Display Name</label>
              <input
                type="text"
                required
                value={settings.businessName || ''}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                placeholder="The Premiums Society"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Business Email</label>
              <input
                type="email"
                required
                value={settings.businessEmail || ''}
                onChange={(e) => setSettings({ ...settings, businessEmail: e.target.value })}
                placeholder="contact@thepremiums.in"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          {/* Logo upload */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
              {settings.storeLogo ? (
                <img src={settings.storeLogo} alt="Logo Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] text-slate-400 font-bold">No Logo</span>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Brand Logo</label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition-colors">
                  <Upload size={13} />
                  <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                </label>
                {settings.storeLogo && (
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, storeLogo: null })}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Contact Phone & WhatsApp */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Phone size={18} className="text-emerald-600" />
            <span>Contact & WhatsApp Helplines</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Primary Phone / WhatsApp</label>
              <input
                type="text"
                required
                value={settings.primaryPhone || ''}
                onChange={(e) => setSettings({ ...settings, primaryPhone: e.target.value })}
                placeholder="+919920517851"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
              <p className="text-[10px] text-slate-400">Include country code (e.g. +91 99205 17851)</p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Secondary Helpline (Optional)</label>
              <input
                type="text"
                value={settings.secondaryPhone || ''}
                onChange={(e) => setSettings({ ...settings, secondaryPhone: e.target.value })}
                placeholder="+91..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-medium"
              />
            </div>
          </div>
        </div>

        {/* 3. Shipping & Currencies */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Truck size={18} className="text-emerald-600" />
            <span>Shipping Policy & Pricing Configuration</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Standard Delivery Charge (₹)</label>
              <input
                type="number"
                min="0"
                value={settings.shippingCharge}
                onChange={(e) => setSettings({ ...settings, shippingCharge: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Free Shipping Order Threshold (₹)</label>
              <input
                type="number"
                min="0"
                value={settings.freeShippingThreshold || ''}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
                placeholder="2000"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
            </div>
          </div>
        </div>

        {/* 4. Footer Physical Address & Store Announcement */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Megaphone size={18} className="text-emerald-600" />
            <span>Store Announcement & Footer Address</span>
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
              <label className="font-bold text-slate-700">Footer Physical Address Text</label>
              <textarea
                rows={2}
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="Shop No. / Building / Street address shown in the footer..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
              <p className="text-[10px] text-slate-400">This address text is displayed cleanly in the website footer.</p>
            </div>
          </div>
        </div>

        {/* 5. DEDICATED GPS COORDINATES & INTERACTIVE GOOGLE MAP */}
        <div className="bg-white rounded-2xl border-2 border-emerald-500/30 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Navigation size={18} className="text-emerald-600" />
              <span>Boutique GPS Coordinates & Google Map Setup</span>
            </h2>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Interactive Store Map
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Enter the exact GPS coordinates for your boutique. Customers will see your shop directly on the embedded Google Map and can tap <strong>"Get Driving Directions"</strong> on their phone to navigate to your physical boutique!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                <span>Latitude</span>
                <span className="text-slate-400 font-normal">(e.g. 19.0760)</span>
              </label>
              <input
                type="number"
                step="any"
                value={settings.latitude !== null && settings.latitude !== undefined ? settings.latitude : ''}
                onChange={(e) => setSettings({ ...settings, latitude: e.target.value })}
                placeholder="19.0760"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                <span>Longitude</span>
                <span className="text-slate-400 font-normal">(e.g. 72.8777)</span>
              </label>
              <input
                type="number"
                step="any"
                value={settings.longitude !== null && settings.longitude !== undefined ? settings.longitude : ''}
                onChange={(e) => setSettings({ ...settings, longitude: e.target.value })}
                placeholder="72.8777"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
              <span>Google Maps Link or Direction URL</span>
              <span className="text-slate-400 font-normal">(Optional Custom Link)</span>
            </label>
            <input
              type="text"
              value={settings.mapEmbedUrl || ''}
              onChange={(e) => setSettings({ ...settings, mapEmbedUrl: e.target.value })}
              placeholder="https://maps.app.goo.gl/... or https://maps.google.com/?q=..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[10px] text-slate-400">
              Tip: Open Google Maps, search your boutique, click <strong>Share</strong>, and paste the link here.
            </p>
          </div>
        </div>

        {/* 6. Social Media Links */}
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
