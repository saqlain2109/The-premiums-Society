'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  Boxes,
  ShoppingBag,
  Settings,
  Globe,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  ExternalLink,
} from 'lucide-react';

export default function AdminSidebar({ userRole = 'ADMIN', categoryCount = 0, mobileOpen = false, onCloseMobile = () => {} }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mastersOpen, setMastersOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('ar_admin_sidebar_collapsed');
    if (saved !== null) {
      setCollapsed(saved === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('ar_admin_sidebar_collapsed', String(next));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
      router.push('/admin/login');
    }
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Add New Product', href: '/admin/products/new', icon: PlusCircle },
    { label: 'Inventory / Stock', href: '/admin/inventory', icon: Boxes },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  ];

  const adminOnlyItems = [
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
    { label: 'Website Content', href: '/admin/content', icon: Globe },
    { label: 'Policies', href: '/admin/policies', icon: FileText },
  ];

  const isActive = (href) => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin/dashboard' || pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 h-screen z-50 transition-all duration-300 ease-in-out flex flex-col bg-[#0F172A] border-r border-[#1E293B] text-slate-300 shadow-2xl ${
          /* Desktop behavior */
          collapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          /* Mobile behavior: off-canvas drawer */
          mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header & Brand */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#1E293B] bg-[#0B132B]">
          <Link
            href="/admin/dashboard"
            onClick={onCloseMobile}
            className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'lg:hidden' : ''}`}
          >
            <img
              src="/images/logo.png"
              alt="The Premiums Society"
              className="w-9 h-9 rounded-full object-cover border border-amber-500/40 shadow-md shrink-0"
            />
            <div className="truncate">
              <span className="font-bold text-white tracking-wide text-sm block">THE PREMIUMS</span>
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">
                Admin Portal
              </span>
            </div>
          </Link>

          {collapsed && (
            <img
              src="/images/logo.png"
              alt="Logo"
              className="hidden lg:block mx-auto w-9 h-9 rounded-full object-cover border border-amber-500/40 shrink-0"
            />
          )}

          {/* Desktop Collapse Toggle Button */}
          <button
            onClick={toggleCollapse}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className={`hidden lg:block p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
              collapsed ? 'hidden' : ''
            }`}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {collapsed && (
          <div className="hidden lg:flex pt-2 justify-center">
            <button
              onClick={toggleCollapse}
              title="Expand Sidebar"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          {/* Core Operational Workflows */}
          <div className="space-y-1">
            <p className={`px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ${collapsed ? 'lg:hidden' : ''}`}>
              Core Operations
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#059669] text-white shadow-md shadow-emerald-900/30 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  } ${collapsed ? 'lg:justify-center' : ''}`}
                >
                  <Icon size={19} className={active ? 'text-white' : 'text-slate-400'} />
                  <span className={collapsed ? 'lg:hidden' : ''}>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Nested Accordion: Masters */}
          <div className="pt-3">
            <div className={collapsed ? 'lg:hidden' : ''}>
              <button
                onClick={() => setMastersOpen(!mastersOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-wider"
              >
                <span>Masters</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    mastersOpen ? 'rotate-180 text-emerald-400' : ''
                  }`}
                />
              </button>

              {mastersOpen && (
                <div className="mt-1 space-y-1 pl-1">
                  <Link
                    href="/admin/categories"
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                      pathname === '/admin/categories'
                        ? 'bg-[#059669] text-white font-bold'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FolderTree size={17} />
                      <span>Categories</span>
                    </div>
                    {categoryCount > 0 && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-slate-700">
                        {categoryCount}
                      </span>
                    )}
                  </Link>
                </div>
              )}
            </div>

            {/* Collapsed icon on desktop */}
            {collapsed && (
              <div className="hidden lg:block">
                <Link
                  href="/admin/categories"
                  title="Categories Master"
                  className={`flex justify-center p-2.5 rounded-xl transition-all ${
                    pathname === '/admin/categories'
                      ? 'bg-[#059669] text-white font-bold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <FolderTree size={19} />
                </Link>
              </div>
            )}
          </div>

          {/* Admin Management Section */}
          {userRole === 'ADMIN' && (
            <div className="pt-3 border-t border-[#1E293B]/80 space-y-1">
              <p className={`px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ${collapsed ? 'lg:hidden' : ''}`}>
                Administration
              </p>

              {adminOnlyItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-[#059669] text-white shadow-md shadow-emerald-900/30 font-bold'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    } ${collapsed ? 'lg:justify-center' : ''}`}
                  >
                    <Icon size={19} className={active ? 'text-white' : 'text-slate-400'} />
                    <span className={collapsed ? 'lg:hidden' : ''}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#1E293B] bg-[#0B132B] space-y-1">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/70 rounded-xl transition-colors"
          >
            <ExternalLink size={16} className="text-emerald-400 shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>View Public Store</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors"
          >
            <LogOut size={16} className="shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
