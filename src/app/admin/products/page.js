'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UniversalDataTable from '@/components/admin/UniversalDataTable';
import Portal from '@/components/ui/Portal';
import {
  Package,
  PlusCircle,
  Copy,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [inspectProduct, setInspectProduct] = useState(null);
  const [currencySymbol, setCurrencySymbol] = useState(
    (typeof window !== 'undefined' && (window.__STORE_CURRENCY_SYMBOL__ || localStorage.getItem('ar_currency_symbol'))) || '₹'
  );

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products?admin=true');
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      }

      const sRes = await fetch('/api/settings');
      const sData = await sRes.json();
      if (sData.success && sData.settings?.currencySymbol) {
        setCurrencySymbol(sData.settings.currencySymbol);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Toggle publish/unpublish
  const handleToggleStatus = async (product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toggleStatusOnly: true }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Status updated for "${product.name}"`);
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  // Duplicate Product
  const handleDuplicate = async (product) => {
    try {
      const res = await fetch(`/api/products/${product.id}/duplicate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Duplicated "${product.name}" successfully!`);
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
      alert('Failed to duplicate product');
    }
  };

  // Delete Product (Preserving order history)
  const handleDelete = async (product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Product deleted successfully (Order records preserved).`);
        fetchProducts();
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to delete product');
    }
  };

  // Universal Table Columns Definition
  const columns = [
    {
      key: 'thumbnail',
      label: 'Photo',
      sortable: false,
      render: (_, row) => (
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
          {row.mainImage ? (
            <img src={row.mainImage} alt={row.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
              No Img
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Product Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-bold text-slate-900 leading-snug">{val}</p>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">SKU: {row.sku}</p>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      getRawValue: (row) => row.category?.name || 'Uncategorized',
      render: (_, row) => (
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
          {row.category?.name || 'Uncategorized'}
        </span>
      ),
    },
    {
      key: 'sellingPrice',
      label: 'Selling Price',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-extrabold text-slate-900">{formatPrice(val, currencySymbol)}</span>
          {row.originalPrice && (
            <span className="text-[11px] text-slate-400 line-through ml-1.5">
              {formatPrice(row.originalPrice, currencySymbol)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'totalStock',
      label: 'Available Stock',
      sortable: true,
      render: (val, row) => {
        let badge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        if (val === 0) badge = 'bg-rose-50 text-rose-800 border-rose-200';
        else if (val <= 5) badge = 'bg-amber-50 text-amber-800 border-amber-200';

        return (
          <div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge}`}>
              {val} in stock
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {row.variants?.length || 0} variant(s)
            </p>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Publication Status',
      sortable: true,
      render: (val, row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          title="Click to toggle Draft / Published"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
            val === 'PUBLISHED'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
              : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
          }`}
        >
          {val === 'PUBLISHED' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          <span>{val}</span>
        </button>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date Created',
      sortable: true,
      isDate: true, // Chronological sort rule 3!
      render: (val) => formatDate(val),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Title & Stats bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Products Management</h1>
          <p className="text-xs text-slate-500">
            Create, edit, duplicate, and toggle publications across The Premiums Society catalog.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-white border border-slate-200 rounded-xl text-slate-700">
            Total in Database: <strong className="text-slate-900">{products.length}</strong>
          </span>
        </div>
      </div>

      {/* Universal Data Table Engine with full Actions Mega-Menu */}
      <UniversalDataTable
        title="Products"
        data={products}
        columns={columns}
        defaultSortKey="createdAt"
        defaultSortDir="desc"
        primaryAction={{
          label: 'Add Product',
          onClick: () => router.push('/admin/products/new'),
          icon: <PlusCircle size={16} />,
        }}
        onView={(prod) => setInspectProduct(prod)}
        onEdit={(prod) => router.push(`/admin/products/${prod.id}/edit`)}
        onDelete={(prod) => handleDelete(prod)}
        customRowActions={(prod) => (
          <>
            {/* Duplicate Button */}
            <button
              onClick={() => handleDuplicate(prod)}
              title="Duplicate Product"
              className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
            >
              <Copy size={15} />
            </button>
          </>
        )}
      />

      {/* Inspect Detail Modal (Portal) */}
      {inspectProduct && (
        <Portal>
          <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-emerald-600" />
                  <span className="font-bold text-slate-800">Product Inspector</span>
                </div>
                <button
                  onClick={() => setInspectProduct(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
                <div className="flex gap-4 items-start">
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden border shrink-0">
                    {inspectProduct.mainImage && (
                      <img
                        src={inspectProduct.mainImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{inspectProduct.name}</h3>
                    <p className="font-mono text-slate-400 text-xs">SKU: {inspectProduct.sku}</p>
                    <p className="mt-1 text-slate-500">
                      Category: <strong>{inspectProduct.category?.name}</strong>
                    </p>
                    <p className="text-base font-extrabold text-emerald-700 mt-1">
                      {formatPrice(inspectProduct.sellingPrice, currencySymbol)}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Description:</h4>
                  <p className="leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-line">
                    {inspectProduct.description || 'No description provided.'}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 mb-2">
                    Configured Variants ({inspectProduct.variants?.length || 0}):
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Colour</th>
                          <th className="py-2 px-3">Size</th>
                          <th className="py-2 px-3">Stock</th>
                          <th className="py-2 px-3">SKU</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inspectProduct.variants?.map((v) => (
                          <tr key={v.id}>
                            <td className="py-2 px-3 font-semibold">{v.colour}</td>
                            <td className="py-2 px-3">{v.size}</td>
                            <td className="py-2 px-3 font-bold text-emerald-800">{v.stock}</td>
                            <td className="py-2 px-3 font-mono text-[11px] text-slate-400">{v.sku}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <Link
                  href={`/product/${inspectProduct.slug}`}
                  target="_blank"
                  className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold hover:underline"
                >
                  <ExternalLink size={14} />
                  <span>View on Customer Storefront</span>
                </Link>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const id = inspectProduct.id;
                      setInspectProduct(null);
                      router.push(`/admin/products/${id}/edit`);
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    Edit Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
