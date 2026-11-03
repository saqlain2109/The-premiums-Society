'use client';
import { useState } from 'react';
import { Plus, Trash2, Sparkles, RefreshCw } from 'lucide-react';

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];
const COMMON_COLOURS = [
  { name: 'Black', code: '#111827' },
  { name: 'White', code: '#FFFFFF' },
  { name: 'Navy Blue', code: '#1E3A8A' },
  { name: 'Royal Blue', code: '#2563EB' },
  { name: 'Maroon', code: '#881337' },
  { name: 'Emerald Green', code: '#047857' },
  { name: 'Crimson Red', code: '#DC2626' },
  { name: 'Mustard Gold', code: '#D97706' },
  { name: 'Olive Green', code: '#4D7C0F' },
  { name: 'Rose Pink', code: '#F43F5E' },
];

export default function VariantManager({
  variants = [], // [{ colour, colourCode, size, stock, price, sku }]
  onChange, // (updatedVariants) => void
  basePrice = 0,
  baseSku = '',
  currencySymbol = '₹',
}) {
  // Matrix Generator helper state
  const [selectedColours, setSelectedColours] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [customColour, setCustomColour] = useState('');
  const [customSize, setCustomSize] = useState('');
  const [defaultBatchStock, setDefaultBatchStock] = useState(10);

  // Toggle selection for generator
  const toggleColour = (colName) => {
    setSelectedColours((prev) =>
      prev.includes(colName) ? prev.filter((c) => c !== colName) : [...prev, colName]
    );
  };

  const toggleSize = (sz) => {
    setSelectedSizes((prev) =>
      prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz]
    );
  };

  // Add custom colour
  const addCustomColour = () => {
    if (customColour.trim() && !selectedColours.includes(customColour.trim())) {
      setSelectedColours([...selectedColours, customColour.trim()]);
      setCustomColour('');
    }
  };

  // Add custom size
  const addCustomSize = () => {
    if (customSize.trim() && !selectedSizes.includes(customSize.trim())) {
      setSelectedSizes([...selectedSizes, customSize.trim()]);
      setCustomSize('');
    }
  };

  // Generate combinations
  const generateMatrix = () => {
    if (selectedColours.length === 0 || selectedSizes.length === 0) {
      alert('Please select at least one colour and one size to generate combinations.');
      return;
    }

    const newVariants = [...variants];

    for (const cName of selectedColours) {
      const matchObj = COMMON_COLOURS.find((c) => c.name === cName);
      const code = matchObj ? matchObj.code : '#1E293B';

      for (const sName of selectedSizes) {
        // Check if combination already exists
        const exists = newVariants.some(
          (v) => v.colour.toLowerCase() === cName.toLowerCase() && v.size.toLowerCase() === sName.toLowerCase()
        );

        if (!exists) {
          newVariants.push({
            colour: cName,
            colourCode: code,
            size: sName,
            stock: Number(defaultBatchStock) || 0,
            price: null, // inherits base price unless overridden
            sku: baseSku ? `${baseSku}-${cName.substring(0, 3).toUpperCase()}-${sName.replace(/\s+/g, '')}` : '',
          });
        }
      }
    }

    onChange(newVariants);
  };

  // Add single manual variant
  const addSingleVariant = () => {
    onChange([
      ...variants,
      {
        colour: 'Black',
        colourCode: '#111827',
        size: 'M',
        stock: 5,
        price: null,
        sku: baseSku ? `${baseSku}-VAR-${Date.now().toString().slice(-4)}` : '',
      },
    ]);
  };

  // Update variant row field
  const updateVariant = (index, field, value) => {
    const copy = [...variants];
    copy[index] = { ...copy[index], [field]: value };
    onChange(copy);
  };

  // Remove variant
  const removeVariant = (index) => {
    const copy = variants.filter((_, idx) => idx !== index);
    onChange(copy);
  };

  // Quick total stock calculation
  const totalStock = variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. Quick Matrix Generator Panel */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4.5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-800">
              Variant Matrix Generator (Quick Setup)
            </h4>
          </div>
          <span className="text-xs text-slate-500">
            Configure specific sizes & colours for The Premiums Society
          </span>
        </div>

        {/* Colours Selection */}
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-2">
            1. Select Available Colours:
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_COLOURS.map((col) => {
              const isSelected = selectedColours.includes(col.name);
              return (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => toggleColour(col.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20"
                    style={{ backgroundColor: col.code }}
                  />
                  <span>{col.name}</span>
                </button>
              );
            })}
          </div>

          {/* Custom colour adder */}
          <div className="flex gap-2 mt-2 max-w-xs">
            <input
              type="text"
              placeholder="Add other colour..."
              value={customColour}
              onChange={(e) => setCustomColour(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg flex-1"
            />
            <button
              type="button"
              onClick={addCustomColour}
              className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded-lg text-xs font-bold hover:bg-slate-300"
            >
              Add
            </button>
          </div>
        </div>

        {/* Sizes Selection */}
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-2">
            2. Select Available Sizes:
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_SIZES.map((sz) => {
              const isSelected = selectedSizes.includes(sz);
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => toggleSize(sz)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>

          {/* Custom size adder */}
          <div className="flex gap-2 mt-2 max-w-xs">
            <input
              type="text"
              placeholder="e.g. 40, 42, 44 or Kids 6Y..."
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg flex-1"
            />
            <button
              type="button"
              onClick={addCustomSize}
              className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded-lg text-xs font-bold hover:bg-slate-300"
            >
              Add
            </button>
          </div>
        </div>

        {/* Generator Action */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span>Default stock per combination:</span>
            <input
              type="number"
              min="0"
              value={defaultBatchStock}
              onChange={(e) => setDefaultBatchStock(e.target.value)}
              className="w-16 px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white"
            />
          </div>

          <button
            type="button"
            onClick={generateMatrix}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <RefreshCw size={14} />
            <span>Generate Size × Colour Matrix</span>
          </button>
        </div>
      </div>

      {/* 2. Variant Inventory Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-800">
              Configured Variants ({variants.length})
            </h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              Total Stock: {totalStock}
            </span>
          </div>

          <button
            type="button"
            onClick={addSingleVariant}
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Plus size={14} />
            <span>Add Single Row</span>
          </button>
        </div>

        {variants.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-400 text-xs">
            No variants configured. Use the matrix generator above or click "Add Single Row" to create sizes and colours.
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto max-h-96 scrollbar-thin">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100 sticky top-0 z-10 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Colour</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3 w-28">Stock Qty</th>
                    <th className="py-2.5 px-3 w-32">
                      Variant Price ({currencySymbol})
                      <span className="text-[10px] text-slate-400 font-normal block normal-case">Optional override</span>
                    </th>
                    <th className="py-2.5 px-3 w-36">SKU Code</th>
                    <th className="py-2.5 px-3 text-center w-12">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {variants.map((v, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      {/* Colour */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={v.colourCode || '#1E293B'}
                            onChange={(e) => updateVariant(idx, 'colourCode', e.target.value)}
                            className="w-5 h-5 rounded cursor-pointer border border-slate-200"
                            title="Choose color swatch"
                          />
                          <input
                            type="text"
                            value={v.colour}
                            onChange={(e) => updateVariant(idx, 'colour', e.target.value)}
                            placeholder="Colour"
                            className="w-28 px-2 py-1 text-xs border border-slate-200 rounded-lg font-medium"
                          />
                        </div>
                      </td>

                      {/* Size */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={v.size}
                          onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                          placeholder="Size (e.g. M)"
                          className="w-24 px-2 py-1 text-xs border border-slate-200 rounded-lg font-medium"
                        />
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          value={v.stock}
                          onChange={(e) => updateVariant(idx, 'stock', Math.max(0, parseInt(e.target.value, 10) || 0))}
                          className={`w-20 px-2 py-1 text-xs border rounded-lg font-bold ${
                            v.stock === 0
                              ? 'border-rose-300 bg-rose-50 text-rose-700'
                              : v.stock <= 5
                              ? 'border-amber-300 bg-amber-50 text-amber-700'
                              : 'border-slate-200 text-emerald-800'
                          }`}
                        />
                      </td>

                      {/* Optional Price Override */}
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          value={v.price !== null && v.price !== undefined ? v.price : ''}
                          onChange={(e) =>
                            updateVariant(idx, 'price', e.target.value === '' ? null : parseFloat(e.target.value))
                          }
                          placeholder={`Base: ${currencySymbol}${basePrice || 0}`}
                          className="w-28 px-2 py-1 text-xs border border-slate-200 rounded-lg"
                        />
                      </td>

                      {/* SKU */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={v.sku || ''}
                          onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                          placeholder="Variant SKU"
                          className="w-32 px-2 py-1 text-xs border border-slate-200 rounded-lg font-mono text-[11px]"
                        />
                      </td>

                      {/* Delete */}
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
