'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import Link from 'next/link';
import { ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';

export default function AdminLayoutClient({ children, serverUser = null, categoryCount = 0 }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';

  const [user, setUser] = useState(serverUser);
  const [checkingAuth, setCheckingAuth] = useState(!serverUser && !isLoginPage);
  const [storeName, setStoreName] = useState('The Premiums Society');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings?.businessName) {
          setStoreName(data.settings.businessName);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isLoginPage) {
      setCheckingAuth(false);
      return;
    }

    // Check token from localStorage if not available from server cookie
    const token = typeof window !== 'undefined' ? localStorage.getItem('ar_admin_token') : null;
    if (!token && !serverUser) {
      // Not authenticated: redirect to login page
      router.replace('/admin/login');
      return;
    }

    if (!user) {
      // Fetch current authenticated user profile
      fetch('/api/auth/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            localStorage.removeItem('ar_admin_token');
            router.replace('/admin/login');
          }
        })
        .catch(() => {
          localStorage.removeItem('ar_admin_token');
          router.replace('/admin/login');
        })
        .finally(() => {
          setCheckingAuth(false);
        });
    } else {
      setCheckingAuth(false);
    }
  }, [pathname, isLoginPage, serverUser]);

  // If on login page, render child directly without sidebar
  if (isLoginPage) {
    return <div className="w-full">{children}</div>;
  }

  // If checking authentication, show clean loader
  if (checkingAuth) {
    return (
      <div className="min-h-screen w-full bg-[#0F172A] flex flex-col items-center justify-center text-slate-300">
        <Loader2 size={36} className="animate-spin text-emerald-500 mb-3" />
        <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">
          Verifying Administrator Session...
        </p>
      </div>
    );
  }

  const currentUser = user || serverUser || { name: 'Store Owner', email: 'admin@thepremiums.in', role: 'ADMIN' };

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-800">
      {/* Collapsible Accordion Sidebar */}
      <AdminSidebar userRole={currentUser.role || 'ADMIN'} categoryCount={categoryCount} />

      {/* Main Area Offset by Sidebar */}
      <div className="flex-1 flex flex-col min-w-0 pl-16 sm:pl-20 lg:pl-64 transition-all duration-300">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-600" />
              <span className="font-extrabold text-slate-900 text-sm tracking-tight hidden sm:inline">
                {storeName}
              </span>
            </div>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Store Administration
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* View Live Storefront Button */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors"
            >
              <ExternalLink size={14} />
              <span>View Public Store</span>
            </Link>

            {/* Administrator Profile Pill */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-emerald-400 font-bold text-xs flex items-center justify-center">
                {currentUser.name ? currentUser.name[0].toUpperCase() : 'A'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.name || 'Store Owner'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">{currentUser.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
