'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import Portal from '@/components/ui/Portal';
import {
  Search,
  SlidersHorizontal,
  Download,
  RotateCcw,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  Columns3,
  Filter as FilterIcon,
  Pin,
  Bookmark,
  Type,
  WrapText,
  X,
  Plus,
} from 'lucide-react';

export default function UniversalDataTable({
  title,
  data = [],
  columns = [], // Array of { key, label, sortable?, render?, isDate?, getRawValue? }
  primaryAction, // { label, onClick, icon? }
  onView,
  onEdit,
  onDelete,
  defaultSortKey,
  defaultSortDir = 'desc',
  customRowActions,
  emptyMessage = 'No records found.',
}) {
  // 1. Column configuration state
  const initialColumns = useMemo(() => {
    return columns.map((col, idx) => ({
      ...col,
      visible: col.visible !== false,
      order: idx,
    }));
  }, [columns]);

  const [columnConfig, setColumnConfig] = useState(initialColumns);

  // Sync if columns prop changes
  useEffect(() => {
    setColumnConfig(initialColumns);
  }, [initialColumns]);

  // 2. Search & Pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // 3. Sorting state (Underlying chronological for dates!)
  const [sortConfig, setSortConfig] = useState({
    key: defaultSortKey || (columns[0]?.key || ''),
    direction: defaultSortDir,
  });

  // 4. View Density selector (Rule 2.A.8)
  // 'xs', 'compact', 'normal', 'medium', 'comfortable', 'large', 'xl'
  const [density, setDensity] = useState('normal');

  // 5. Freeze Header & Columns (Rule 2.A.3 & 2.A.4)
  const [freezeHeader, setFreezeHeader] = useState(false);
  const [freezeColumns, setFreezeColumns] = useState(false);

  // 6. Auto-Wrap Long Data (Rule 2.A.7)
  const [autoWrap, setAutoWrap] = useState(false);

  // 7. Multi-column Filter Drawer state (Rule 2.A.2)
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]); // [{ columnKey, operator, value }]
  const [tempFilters, setTempFilters] = useState([]);

  // 8. Actions Mega-Dropdown state
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [columnPopoverOpen, setColumnPopoverOpen] = useState(false);
  const [viewsPopoverOpen, setViewsPopoverOpen] = useState(false);
  const [savedViews, setSavedViews] = useState([]);
  const [newViewName, setNewViewName] = useState('');

  // 9. Delete Confirmation Modal state (Rule 2.C)
  const [deleteModalItem, setDeleteModalItem] = useState(null);

  // Container refs for horizontal scroll controls
  const tableContainerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // Load saved views from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`ar_table_views_${title || 'default'}`);
      if (saved) {
        setSavedViews(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, [title]);

  // Open Actions mega-menu with portal positioning
  const toggleMegaMenu = () => {
    if (!megaMenuOpen && menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 6,
        left: Math.max(10, rect.right + window.scrollX - 260),
      });
    }
    setMegaMenuOpen(!megaMenuOpen);
  };

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target) &&
        !e.target.closest('.mega-dropdown-portal')
      ) {
        setMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Horizontal scroll helpers
  const scrollTable = (direction) => {
    if (tableContainerRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      tableContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Sorting handler (Chronological rule 3!)
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  // Toggle column visibility
  const toggleColumnVisibility = (key) => {
    setColumnConfig((prev) =>
      prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col))
    );
  };

  // Move column order left or right
  const moveColumn = (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= columnConfig.length) return;

    setColumnConfig((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIdx];
      updated[targetIdx] = temp;
      return updated;
    });
  };

  // Save current view preset
  const handleSaveView = () => {
    if (!newViewName.trim()) return;
    const newView = {
      id: Date.now(),
      name: newViewName.trim(),
      columns: columnConfig.map((c) => ({ key: c.key, visible: c.visible })),
      filters: activeFilters,
      density,
      pageSize,
    };
    const updatedViews = [...savedViews, newView];
    setSavedViews(updatedViews);
    localStorage.setItem(`ar_table_views_${title || 'default'}`, JSON.stringify(updatedViews));
    setNewViewName('');
    alert(`View "${newView.name}" saved!`);
  };

  const applyView = (view) => {
    if (view.columns) {
      setColumnConfig((prev) =>
        prev.map((col) => {
          const match = view.columns.find((c) => c.key === col.key);
          return match ? { ...col, visible: match.visible } : col;
        })
      );
    }
    if (view.filters) setActiveFilters(view.filters);
    if (view.density) setDensity(view.density);
    if (view.pageSize) setPageSize(view.pageSize);
    setViewsPopoverOpen(false);
    setMegaMenuOpen(false);
  };

  // Reset All (Columns & Filters) (Rule 2.A.9)
  const handleResetAll = () => {
    setColumnConfig(initialColumns);
    setActiveFilters([]);
    setSearchTerm('');
    setDensity('normal');
    setFreezeHeader(true);
    setFreezeColumns(true);
    setAutoWrap(false);
    setSortConfig({ key: defaultSortKey || columns[0]?.key || '', direction: defaultSortDir });
    setCurrentPage(1);
    setMegaMenuOpen(false);
  };

  // Export to CSV (Rule 2.A.6)
  const exportToCSV = () => {
    const visibleCols = columnConfig.filter((c) => c.visible);
    const headers = visibleCols.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(',');

    const rows = filteredData.map((row) => {
      return visibleCols
        .map((col) => {
          let val = row[col.key];
          if (col.getRawValue) val = col.getRawValue(row);
          else if (val === null || val === undefined) val = '';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${(title || 'export').toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMegaMenuOpen(false);
  };

  // Filter & Search & Sort pipeline
  const filteredData = useMemo(() => {
    let result = [...data];

    // Global Search across searchable fields
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((row) => {
        return columns.some((col) => {
          let val = row[col.key];
          if (col.getRawValue) val = col.getRawValue(row);
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    // Active Multi-Column Filters
    if (activeFilters.length > 0) {
      result = result.filter((row) => {
        return activeFilters.every((f) => {
          let rowVal = row[f.columnKey];
          const colDef = columns.find((c) => c.key === f.columnKey);
          if (colDef && colDef.getRawValue) {
            rowVal = colDef.getRawValue(row);
          }
          if (rowVal === null || rowVal === undefined) return false;

          const filterVal = f.value?.toLowerCase() || '';
          const strRowVal = String(rowVal).toLowerCase();

          if (f.operator === 'contains') return strRowVal.includes(filterVal);
          if (f.operator === 'equals') return strRowVal === filterVal;
          if (f.operator === 'starts_with') return strRowVal.startsWith(filterVal);
          if (f.operator === 'greater_than') return Number(rowVal) > Number(f.value);
          if (f.operator === 'less_than') return Number(rowVal) < Number(f.value);
          return true;
        });
      });
    }

    // Sorting with Chronological enforcement for date/month fields!
    if (sortConfig.key) {
      const colDef = columns.find((c) => c.key === sortConfig.key);
      const isDate = colDef?.isDate;

      result.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (colDef && colDef.getRawValue) {
          valA = colDef.getRawValue(a);
          valB = colDef.getRawValue(b);
        }

        // Chronological sort
        if (isDate) {
          const timeA = new Date(valA).getTime() || 0;
          const timeB = new Date(valB).getTime() || 0;
          return sortConfig.direction === 'asc' ? timeA - timeB : timeB - timeA;
        }

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA || '').toLowerCase();
        const strB = String(valB || '').toLowerCase();
        return sortConfig.direction === 'asc'
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      });
    }

    return result;
  }, [data, searchTerm, activeFilters, sortConfig, columns]);

  // Pagination calculation
  const totalRecords = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Adjust page if out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Density styling map (Rule 2.A.8)
  const densityStyles = {
    xs: 'py-1 px-2.5 text-xs',
    compact: 'py-1.5 px-3 text-xs',
    normal: 'py-2.5 px-3.5 text-sm',
    medium: 'py-3.5 px-4 text-sm',
    comfortable: 'py-4 px-4 text-base',
    large: 'py-5 px-5 text-base',
    xl: 'py-6 px-6 text-lg',
  };

  const visibleColumns = columnConfig.filter((c) => c.visible);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* 1. Table Top Controls Bar (Rule 2.B) */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Search Bar & Rows Selector */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Debounced Search Bar */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${title || 'records'}...`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Rows Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 text-slate-700 py-1.5 px-2.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Active Filters count pill */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg font-medium">
              <span>{activeFilters.length} filter(s) active</span>
              <button
                onClick={() => setActiveFilters([])}
                className="hover:text-emerald-900"
                title="Clear filters"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Right: Horizontal Scroll Controls, Actions Mega-Menu, and Primary CTA */}
        <div className="flex items-center gap-2">
          {/* Horizontal Scroll Navigation Helper Buttons */}
          <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs">
            <button
              onClick={() => scrollTable('left')}
              title="Scroll Left"
              className="p-2 hover:bg-slate-100 text-slate-600 border-r border-slate-200 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scrollTable('right')}
              title="Scroll Right"
              className="p-2 hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Actions Mega-Dropdown Menu Trigger */}
          <div className="relative">
            <button
              ref={menuButtonRef}
              onClick={toggleMegaMenu}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl border transition-all ${
                megaMenuOpen
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal size={15} />
              <span>Actions</span>
            </button>
          </div>

          {/* Primary CTA (Rule 2.B) */}
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold rounded-xl shadow-sm transition-all"
            >
              {primaryAction.icon || <Plus size={16} />}
              <span>{primaryAction.label}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Actions Mega-Menu Popover (Rendered in Portal to prevent clipping - Rule 4) */}
      {megaMenuOpen && (
        <Portal>
          <div
            className="mega-dropdown-portal fixed z-[9999] w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl py-2 text-sm text-slate-700 animate-in fade-in zoom-in-95 duration-150"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            <div className="px-3 py-1.5 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Table Engine Actions
            </div>

            {/* 1. Columns (x/y) */}
            <button
              onClick={() => {
                setColumnPopoverOpen(true);
                setMegaMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Columns3 size={16} className="text-emerald-600" />
                <span>Columns ({visibleColumns.length}/{columnConfig.length})</span>
              </div>
              <ChevronRight size={14} className="text-slate-400" />
            </button>

            {/* 2. Advanced Filter */}
            <button
              onClick={() => {
                setTempFilters(activeFilters.length > 0 ? activeFilters : [{ columnKey: columns[0]?.key, operator: 'contains', value: '' }]);
                setFilterModalOpen(true);
                setMegaMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <FilterIcon size={16} className="text-indigo-600" />
                <span>Filter Rules</span>
              </div>
              {activeFilters.length > 0 && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {/* 3. Freeze Header Row */}
            <button
              onClick={() => setFreezeHeader(!freezeHeader)}
              className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Pin size={16} className="text-amber-600" />
                <span>Freeze Header Row</span>
              </div>
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${freezeHeader ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'}`}>
                {freezeHeader && <Check size={12} />}
              </div>
            </button>

            {/* 4. Freeze Columns */}
            <button
              onClick={() => setFreezeColumns(!freezeColumns)}
              className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Pin size={16} className="text-amber-600" />
                <span>Freeze Key Columns</span>
              </div>
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${freezeColumns ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'}`}>
                {freezeColumns && <Check size={12} />}
              </div>
            </button>

            {/* 5. Reports / Saved Views */}
            <button
              onClick={() => {
                setViewsPopoverOpen(true);
                setMegaMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Bookmark size={16} className="text-blue-600" />
                <span>Report / Views</span>
              </div>
              <ChevronRight size={14} className="text-slate-400" />
            </button>

            {/* 6. Download / Export Filtered to CSV */}
            <button
              onClick={exportToCSV}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 transition-colors text-left"
            >
              <Download size={16} className="text-teal-600" />
              <span>Download Filtered CSV</span>
            </button>

            {/* 7. Auto-Wrap Long Data */}
            <button
              onClick={() => setAutoWrap(!autoWrap)}
              className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <WrapText size={16} className="text-purple-600" />
                <span>Auto-Wrap Long Data</span>
              </div>
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${autoWrap ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'}`}>
                {autoWrap && <Check size={12} />}
              </div>
            </button>

            {/* 8. Font Size / Density Selector */}
            <div className="px-3.5 py-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1.5">
                <Type size={14} />
                <span>Row Density ({density})</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-[11px] font-semibold">
                {['xs', 'compact', 'normal', 'medium', 'comfortable', 'large', 'xl'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDensity(d)}
                    className={`py-1 px-1.5 rounded text-center capitalize transition-colors ${
                      density === d ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {d === 'normal' ? 'Norm' : d}
                  </button>
                ))}
              </div>
            </div>

            {/* 9. Reset All (Columns & Filters) */}
            <div className="border-t border-slate-100 pt-1 mt-1">
              <button
                onClick={handleResetAll}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium"
              >
                <RotateCcw size={15} />
                <span>Reset All (Columns & Filters)</span>
              </button>
            </div>
          </div>
        </Portal>
      )}

      {/* 3. Column Visibility & Reorder Popover Modal (Portal) */}
      {columnPopoverOpen && (
        <Portal>
          <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Columns3 size={18} className="text-emerald-600" />
                  <span>Customize Columns ({visibleColumns.length}/{columnConfig.length})</span>
                </div>
                <button
                  onClick={() => setColumnPopoverOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 max-h-80 overflow-y-auto space-y-2">
                <p className="text-xs text-slate-500 mb-2">
                  Toggle checkboxes to show or hide fields. Use arrows to reorder left to right.
                </p>
                {columnConfig.map((col, idx) => (
                  <div
                    key={col.key}
                    className="flex items-center justify-between p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700 flex-1">
                      <input
                        type="checkbox"
                        checked={col.visible}
                        onChange={() => toggleColumnVisibility(col.key)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span>{col.label}</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveColumn(idx, 'up')}
                        disabled={idx === 0}
                        title="Move Left"
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveColumn(idx, 'down')}
                        disabled={idx === columnConfig.length - 1}
                        title="Move Right"
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <button
                  onClick={() => setColumnConfig((prev) => prev.map((c) => ({ ...c, visible: true })))}
                  className="text-xs text-emerald-600 font-bold hover:underline"
                >
                  Show All Fields
                </button>
                <button
                  onClick={() => setColumnPopoverOpen(false)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* 4. Filter Drawer / Modal (Portal) */}
      {filterModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <FilterIcon size={18} className="text-indigo-600" />
                  <span>Advanced Multi-Column Filter</span>
                </div>
                <button
                  onClick={() => setFilterModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 max-h-96 overflow-y-auto space-y-3">
                {tempFilters.map((flt, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <select
                      value={flt.columnKey}
                      onChange={(e) => {
                        const copy = [...tempFilters];
                        copy[idx].columnKey = e.target.value;
                        setTempFilters(copy);
                      }}
                      className="text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium"
                    >
                      {columns.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={flt.operator}
                      onChange={(e) => {
                        const copy = [...tempFilters];
                        copy[idx].operator = e.target.value;
                        setTempFilters(copy);
                      }}
                      className="text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium"
                    >
                      <option value="contains">contains</option>
                      <option value="equals">equals</option>
                      <option value="starts_with">starts with</option>
                      <option value="greater_than">&gt; greater than</option>
                      <option value="less_than">&lt; less than</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Value..."
                      value={flt.value}
                      onChange={(e) => {
                        const copy = [...tempFilters];
                        copy[idx].value = e.target.value;
                        setTempFilters(copy);
                      }}
                      className="flex-1 text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium"
                    />

                    <button
                      onClick={() => {
                        const copy = tempFilters.filter((_, i) => i !== idx);
                        setTempFilters(copy);
                      }}
                      className="p-1 text-rose-500 hover:text-rose-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() =>
                    setTempFilters([
                      ...tempFilters,
                      { columnKey: columns[0]?.key, operator: 'contains', value: '' },
                    ])
                  }
                  className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:underline pt-1"
                >
                  <Plus size={14} />
                  <span>Add Filter Condition</span>
                </button>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <button
                  onClick={() => {
                    setTempFilters([]);
                    setActiveFilters([]);
                    setFilterModalOpen(false);
                  }}
                  className="text-xs text-rose-600 font-bold hover:underline"
                >
                  Clear All Filters
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterModalOpen(false)}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setActiveFilters(tempFilters.filter((f) => f.value.trim() !== ''));
                      setFilterModalOpen(false);
                    }}
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* 5. Saved Views Modal (Portal) */}
      {viewsPopoverOpen && (
        <Portal>
          <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Bookmark size={18} className="text-blue-600" />
                  <span>Report & Views Presets</span>
                </div>
                <button
                  onClick={() => setViewsPopoverOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Save current view */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Save Current Preset</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. My Custom View"
                      value={newViewName}
                      onChange={(e) => setNewViewName(e.target.value)}
                      className="flex-1 text-xs border border-slate-300 rounded-lg p-2"
                    />
                    <button
                      onClick={handleSaveView}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* List saved views */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                    Saved Presets
                  </label>
                  {savedViews.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No saved views yet.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {savedViews.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                        >
                          <span className="text-xs font-bold text-slate-700">{v.name}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => applyView(v)}
                              className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded"
                            >
                              Apply
                            </button>
                            <button
                              onClick={() => {
                                const updated = savedViews.filter((x) => x.id !== v.id);
                                setSavedViews(updated);
                                localStorage.setItem(`ar_table_views_${title || 'default'}`, JSON.stringify(updated));
                              }}
                              className="p-1 text-rose-500 hover:text-rose-700"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* 6. Delete Confirmation Modal (Rule 2.C Mandatory safety prompt) */}
      {deleteModalItem && (
        <Portal>
          <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-5 text-center animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <Trash2 size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Confirm Deletion</h3>
              <p className="text-xs text-slate-500 mb-4">
                Are you sure you want to delete this record? This action cannot be reversed.
              </p>
              <div className="flex justify-center gap-2.5">
                <button
                  onClick={() => setDeleteModalItem(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete(deleteModalItem);
                    setDeleteModalItem(null);
                  }}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* 7. Actual Table Grid */}
      <div
        ref={tableContainerRef}
        className="flex-1 overflow-x-auto overflow-y-auto max-h-[68vh] scrollbar-thin relative"
      >
        <table className="w-full border-collapse text-left">
          {/* Table Header */}
          <thead className={freezeHeader ? 'sticky top-0 z-20 bg-slate-100/95 backdrop-blur-xs shadow-xs' : 'bg-slate-100'}>
            <tr className="border-b border-slate-200 text-slate-600 text-xs font-bold tracking-wider uppercase">
              {/* Index Column (optional pinned) */}
              <th className={`py-3 px-3 text-center w-12 ${freezeColumns ? 'sticky left-0 z-30 bg-slate-100' : ''}`}>
                #
              </th>

              {/* Dynamic Visible Columns */}
              {visibleColumns.map((col, idx) => {
                const isSorted = sortConfig.key === col.key;
                const isFirstCol = idx === 0 && freezeColumns;

                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    className={`py-3 px-3.5 select-none transition-colors ${
                      col.sortable !== false ? 'cursor-pointer hover:bg-slate-200/70' : ''
                    } ${isFirstCol ? 'sticky left-12 z-30 bg-slate-100 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.label}</span>
                      {col.sortable !== false && (
                        <span className="text-slate-400">
                          {isSorted ? (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUp size={13} className="text-emerald-600 font-bold" />
                            ) : (
                              <ArrowDown size={13} className="text-emerald-600 font-bold" />
                            )
                          ) : (
                            <ArrowUpDown size={12} className="opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}

              {/* Mandatory Dedicated Actions Column (Rule 2.C) */}
              <th
                className={`py-3 px-4 text-center w-36 ${
                  freezeColumns ? 'sticky right-0 z-30 bg-slate-100 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]' : ''
                }`}
              >
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200/70 bg-white">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + 2}
                  className="py-12 text-center text-slate-400 text-sm font-medium"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => {
                const absoluteIdx = (currentPage - 1) * pageSize + rowIdx + 1;

                return (
                  <tr
                    key={row.id || rowIdx}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Index */}
                    <td
                      className={`text-center font-mono text-xs text-slate-400 font-semibold ${
                        densityStyles[density]
                      } ${freezeColumns ? 'sticky left-0 z-10 bg-white group-hover:bg-slate-50' : ''}`}
                    >
                      {absoluteIdx}
                    </td>

                    {/* Columns */}
                    {visibleColumns.map((col, cIdx) => {
                      const isFirstCol = cIdx === 0 && freezeColumns;
                      return (
                        <td
                          key={col.key}
                          className={`${densityStyles[density]} ${
                            autoWrap ? 'whitespace-normal break-words' : 'truncate max-w-[260px]'
                          } ${
                            isFirstCol
                              ? 'sticky left-12 z-10 bg-white group-hover:bg-slate-50 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)] font-semibold text-slate-800'
                              : 'text-slate-600'
                          }`}
                        >
                          {col.render ? col.render(row[col.key], row) : row[col.key] ?? '-'}
                        </td>
                      );
                    })}

                    {/* Mandatory Row Actions (Rule 2.C: View, Edit, Delete) */}
                    <td
                      className={`text-center ${densityStyles[density]} ${
                        freezeColumns
                          ? 'sticky right-0 z-10 bg-white group-hover:bg-slate-50 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.06)]'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Custom additional buttons */}
                        {customRowActions && customRowActions(row)}

                        {/* View Button */}
                        {onView && (
                          <button
                            onClick={() => onView(row)}
                            title="View Details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          >
                            <Eye size={15} />
                          </button>
                        )}

                        {/* Edit Button */}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            title="Edit Record"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                          >
                            <Edit size={15} />
                          </button>
                        )}

                        {/* Delete Button */}
                        {onDelete && (
                          <button
                            onClick={() => setDeleteModalItem(row)}
                            title="Delete Record"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 8. Table Footer & Pagination */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Showing{' '}
          <span className="font-bold text-slate-700">
            {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-bold text-slate-700">
            {Math.min(currentPage * pageSize, totalRecords)}
          </span>{' '}
          of <span className="font-bold text-slate-700">{totalRecords}</span> entries
        </div>

        {/* Pagination Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft size={15} />
          </button>

          <span className="px-2 font-semibold text-slate-700">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
