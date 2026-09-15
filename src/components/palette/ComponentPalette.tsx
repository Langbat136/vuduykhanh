import React, { useState } from 'react';
import { ComponentCategory, ComponentType } from '../../types/hydraulic';
import { COMPONENT_CATALOG, CatalogItem } from '../../data/defaultCatalog';
import {
  Search,
  Plus,
  Sparkles,
  SlidersHorizontal,
  BookOpen,
  Layers,
  Zap,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface ComponentPaletteProps {
  onAddComponent: (type: ComponentType) => void;
  onLoadTemplate: (templateType: '4_BRANCH' | '1_BRANCH' | 'BLANK') => void;
  onOpenISOReference: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  onAddComponent,
  onLoadTemplate,
  onOpenISOReference,
  isCollapsed: externalIsCollapsed,
  onToggleCollapse,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'all'>('all');

  const categories: { id: ComponentCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'Tất cả' },
    { id: 'power', label: 'Nguồn động lực' },
    { id: 'valves', label: 'Van điều khiển' },
    { id: 'actuators', label: 'Cơ cấu chấp hành' },
    { id: 'instruments', label: 'Đo lường' },
    { id: 'electrical', label: 'Điện điều khiển' },
  ];

  const filteredItems = COMPONENT_CATALOG.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Collapsed View (Slim bar for maximum workspace)
  if (isCollapsed) {
    return (
      <aside className="w-14 h-full flex flex-col items-center bg-slate-900 border-r border-slate-800 text-slate-200 select-none z-10 py-3 shrink-0 transition-all duration-300">
        <button
          onClick={handleToggle}
          className="flex items-center justify-center p-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg mb-3 hover:scale-105"
          title="Mở rộng Thư viện linh kiện"
        >
          <PanelLeftOpen className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center gap-2 mt-1">
          <button
            onClick={onOpenISOReference}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-400"
            title="Tra cứu chuẩn ISO 1219"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>

        {/* Vertical Text Label */}
        <div
          className="flex-1 flex items-center justify-center my-6 cursor-pointer group"
          onClick={handleToggle}
          title="Bấm để mở rộng Thư viện linh kiện"
        >
          <span className="text-[11px] font-tech font-bold uppercase tracking-widest text-slate-400 group-hover:text-rose-400 rotate-90 whitespace-nowrap transition-colors flex items-center gap-2">
            <span>THƯ VIỆN LINH KIỆN</span>
            <span className="bg-slate-800 text-rose-400 px-1.5 py-0.5 rounded text-[10px]">
              {COMPONENT_CATALOG.length}
            </span>
          </span>
        </div>

        <button
          onClick={handleToggle}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Mở rộng"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-80 h-full flex flex-col bg-slate-900 border-r border-slate-800 text-slate-200 select-none z-10 shrink-0 transition-all duration-300">
      {/* Header */}
      <div className="p-3 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-rose-500" />
            <h2 className="text-sm font-bold tracking-tight text-white font-tech uppercase">
              Thư Viện Linh Kiện
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenISOReference}
              className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors px-1.5 py-1 rounded hover:bg-slate-800"
              title="Tra cứu chuẩn ISO 1219"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ISO 1219</span>
            </button>

            {/* Prominent Collapse Button */}
            <button
              onClick={handleToggle}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/50 transition-all text-xs shadow-sm"
              title="Thu gọn sidebar (mở rộng không gian làm việc)"
            >
              <PanelLeftClose className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[11px] font-tech font-bold">Thu gọn</span>
            </button>
          </div>
        </div>

        {/* Quick Templates Selector */}
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Sơ đồ mẫu bài giảng:
          </span>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => onLoadTemplate('4_BRANCH')}
              className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 hover:text-amber-300 border border-slate-700 transition-all text-center leading-tight"
            >
              4 Chân kích
            </button>
            <button
              onClick={() => onLoadTemplate('1_BRANCH')}
              className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 hover:text-cyan-300 border border-slate-700 transition-all text-center leading-tight"
            >
              1 Chân (Cơ bản)
            </button>
            <button
              onClick={() => onLoadTemplate('BLANK')}
              className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 hover:text-rose-300 border border-slate-700 transition-all text-center leading-tight"
            >
              Tự lắp mới
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative mt-3">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm tên, số hiệu (1), (16)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500/80 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog items list */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {filteredItems.map((item: CatalogItem) => {
          return (
            <div
              key={item.type}
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('componentType', item.type);
                e.dataTransfer.setData('text/plain', item.type);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              className="group relative bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-600 rounded-lg p-2.5 transition-all duration-150 shadow-sm cursor-grab active:cursor-grabbing"
              title="Kéo thả vào bản vẽ hoặc bấm nút (+) để thêm linh kiện"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                      {item.name}
                    </span>
                    {item.referenceNumber && (
                      <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 whitespace-nowrap font-bold">
                        {item.referenceNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-normal">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-mono">
                    <span>Cổng: {item.ports.map((p) => p.label || p.id).join(', ')}</span>
                  </div>
                </div>

                {/* Add to canvas button */}
                <button
                  onClick={() => onAddComponent(item.type)}
                  className="p-1.5 rounded-md bg-slate-800 group-hover:bg-rose-600 text-slate-300 group-hover:text-white transition-all shadow shrink-0 self-center"
                  title="Thêm vào canvas"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-xs">
            Không tìm thấy linh kiện phù hợp với từ khóa "{searchTerm}".
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          ISO 1219 Standard
        </span>
        <span className="text-slate-500 font-mono">{COMPONENT_CATALOG.length} Linh kiện</span>
      </div>
    </aside>
  );
};
