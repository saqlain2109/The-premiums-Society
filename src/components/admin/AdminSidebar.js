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
  Layers,
  Sparkles,
} from 'lucide-react';

export default function AdminSidebar({ userRole = 'ADMIN', categoryCount = 0 }) {
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
    <aside
      className={`fixed top-0 left-0 h-screen z-40 transition-all duration-300 ease-in-out flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      } bg-[#0F172A] border-r border-[#1E293B] text-slate-300 shadow-xl`}
    >
      {/* Sidebar Header & Brand */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#1E293B] bg-[#0B132B]">
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex items-center gap-2 overflow-hidden">
            <img src="/images/logo.png" alt="Logo" className="w-9 h-9 rounded-full object-cover border border-amber-500/40 shadow-md shrink-0" />
            <div className="truncate">
              <span className="font-bold text-white tracking-wide text-sm block">THE PREMIUMS</span>
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">Admin Portal</span>
            </div>
          </Link>
        )}
        {collapsed && (
          <img src="/images/logo.png" alt="Logo" className="mx-auto w-9 h-9 rounded-full object-cover border border-amber-500/40 shrink-0" />
        )}

        {/* Collapse Toggle Button */}
        <button
          onClick={toggleCollapse}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
            collapsed ? 'mx-auto mt-1 hidden' : ''
          }`}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {collapsed && (
        <div className="pt-2 flex justify-center">
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
          {!collapsed && (
            <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Core Operations
            </p>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#059669] text-white shadow-md shadow-emerald-900/30 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon size={19} className={active ? 'text-white' : 'text-slate-400'} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Nested Accordion: Masters */}
        <div className="pt-3">
          {!collapsed ? (
            <div>
              <button
                onClick={() => setMastersOpen(!mastersOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-wider"
              >
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-slate-500" />
                  <span>Masters</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-emerald-400 font-mono">
                    {categoryCount || 5}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${mastersOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {mastersOpen && (
                <div className="pl-3 mt-1 space-y-1 border-l border-slate-800 ml-3">
                  <Link
                    href="/admin/categories"
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                      pathname.startsWith('/admin/categories')
                        ? 'bg-[#059669] text-white font-bold'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FolderTree size={16} />
                      <span>Categories</span>
                    </div>
                    <span className="text-xs px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-300">
                      {categoryCount || 5}
                    </span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/admin/categories"
              title="Categories (Masters)"
              className={`flex items-center justify-center p-2.5 rounded-xl transition-all ${
                pathname.startsWith('/admin/categories')
                  ? 'bg-[#059669] text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FolderTree size={19} />
            </Link>
          )}
        </div>

        {/* Administration Section */}
        {userRole === 'ADMIN' && (
          <div className="pt-3 space-y-1">
            {!collapsed && (
              <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Store Administration
              </p>
            )}
            {adminOnlyItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#059669] text-white shadow-md shadow-emerald-900/30 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <Icon size={19} className={active ? 'text-white' : 'text-slate-400'} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Sidebar Footer with Role indicator & Logout */}
      <div className="p-3 border-t border-[#1E293B] bg-[#0B132B]/80">
        {!collapsed && (
          <div className="mb-2 px-2 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-xs font-semibold text-slate-300 truncate">Owner Account</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded">
              {userRole}
            </span>
          </div>
        )}

        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
