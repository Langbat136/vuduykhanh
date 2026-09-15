import React from 'react';
import { ValidationSummary } from '../../types/hydraulic';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  FileDown,
  BookOpen,
  RotateCcw,
  Sparkles,
  Save,
  Check,
} from 'lucide-react';

interface HydraulicHeaderProps {
  projectName: string;
  onChangeProjectName: (name: string) => void;
  validation: ValidationSummary;
  onOpenValidation: () => void;
  onOpenISO: () => void;
  onOpenBlueprint: () => void;
  onOpenExport: () => void;
  onResetDiagram: () => void;
  hasSavedChanges: boolean;
  onSaveProject: () => void;
}

export const HydraulicHeader: React.FC<HydraulicHeaderProps> = ({
  projectName,
  onChangeProjectName,
  validation,
  onOpenValidation,
  onOpenISO,
  onOpenBlueprint,
  onOpenExport,
  onResetDiagram,
  hasSavedChanges,
  onSaveProject,
}) => {
  return (
    <header className="w-full h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-slate-100 z-20 select-none shadow-md">
      {/* Left: Branding and Project Title */}
      <div className="flex items-center gap-3">
        {/* Hydraulic Icon Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-slate-950 font-bold font-tech shadow-lg shadow-rose-500/20">
            H4
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 font-tech uppercase tracking-wider">
                Giáo Cụ Trực Quan Thủy Lực
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ISO 1219
              </span>
            </div>
            <input
              type="text"
              value={projectName}
              onChange={(e) => onChangeProjectName(e.target.value)}
              className="bg-transparent hover:bg-slate-800/60 focus:bg-slate-950 px-1 py-0.5 rounded text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-tech truncate max-w-sm"
              title="Nhấp để đổi tên bài học"
            />
          </div>
        </div>
      </div>

      {/* Middle: Color Coding Legend */}
      <div className="hidden lg:flex items-center gap-4 bg-slate-950/80 px-3.5 py-1.5 rounded-full border border-slate-800 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]" />
          <span className="text-slate-300 font-medium">Đường dầu vào (Áp lực)</span>
        </div>
        <div className="w-px h-3 bg-slate-800" />
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.7)]" />
          <span className="text-slate-300 font-medium">Đường dầu ra (Hồi bể)</span>
        </div>
      </div>

      {/* Right: Validation Status Badge & Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Validation Status Toggle */}
        <button
          onClick={onOpenValidation}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-tech transition-all border shadow-sm ${
            validation.errorCount > 0
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30 animate-pulse'
              : validation.warningCount > 0
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
          }`}
        >
          {validation.errorCount > 0 ? (
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          ) : validation.warningCount > 0 ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>
            {validation.errorCount > 0
              ? `${validation.errorCount} Lỗi`
              : validation.warningCount > 0
              ? `${validation.warningCount} Cảnh báo`
              : 'Sơ đồ Hợp Lệ'}
          </span>
        </button>

        {/* Save to LocalStorage */}
        <button
          onClick={onSaveProject}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          title="Lưu bài học vào trình duyệt"
        >
          {hasSavedChanges ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Đã lưu</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span>Lưu</span>
            </>
          )}
        </button>

        {/* Original Blueprint Reference */}
        <button
          onClick={onOpenBlueprint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold font-tech border border-amber-500/40 transition-colors shadow-sm"
          title="Xem bảng đối chiếu 17 linh kiện theo sơ đồ đề bài"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Đối chiếu sơ đồ gốc</span>
        </button>

        {/* ISO Reference Guide */}
        <button
          onClick={onOpenISO}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          title="Bảng tra cứu ký hiệu ISO 1219"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        {/* Export / Report */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-tech shadow transition-all"
          title="Xuất tệp JSON hoặc in giáo trình"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Xuất / Báo cáo</span>
        </button>
      </div>
    </header>
  );
};
