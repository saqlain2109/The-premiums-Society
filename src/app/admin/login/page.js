'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldCheck, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@thepremiums.in');
  const [password, setPassword] = useState('Admin@12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please check credentials.');
      }

      // Successful login
      if (data.token && typeof window !== 'undefined') {
        localStorage.setItem('ar_admin_token', data.token);
      }
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#0F172A] border border-[#1E293B] rounded-3xl p-8 shadow-2xl text-slate-100">
        {/* Brand Crest */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 mx-auto flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-emerald-900/50 mb-3">
            AR
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">THE PREMIUMS SOCIETY</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
            Separate Store Management Portal
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-2.5 animate-shake">
            <AlertCircle size={16} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Administrator Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@thepremiums.in"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Pre-seeded credentials helper box */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-xl text-left">
            <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
              <Sparkles size={13} />
              <span>Default Owner Credentials (Pre-seeded):</span>
            </p>
            <div className="text-[11px] text-slate-400 space-y-0.5 font-mono">
              <div>Email: <strong className="text-slate-200">admin@thepremiums.in</strong></div>
              <div>Password: <strong className="text-slate-200">Admin@12345</strong></div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-4">
            Security Notice: Public user registration is disabled for administrator roles.
          </p>
        </div>
      </div>
    </div>
  );
}
