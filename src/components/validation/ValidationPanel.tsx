import React from 'react';
import { ValidationSummary } from '../../types/hydraulic';
import { ShieldAlert, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface ValidationPanelProps {
  validation: ValidationSummary;
  isOpen: boolean;
  onClose: () => void;
  onHighlightComponents: (componentIds: string[]) => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  validation,
  isOpen,
  onClose,
  onHighlightComponents,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-4 z-40 w-96 max-h-[80vh] bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-2">
          {validation.errorCount > 0 ? (
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          ) : validation.warningCount > 0 ? (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          )}
          <div>
            <h3 className="text-sm font-bold text-white font-tech">
              KIỂM TRA HỢP LỆ SƠ ĐỒ
            </h3>
            <p className="text-[11px] text-slate-400">
              {validation.errorCount > 0
                ? `${validation.errorCount} lỗi cần xử lý trước khi chạy mô phỏng`
                : validation.warningCount > 0
                ? `${validation.warningCount} cảnh báo có thể ảnh hưởng vận hành`
                : 'Sơ đồ hoàn hảo, sẵn sàng vận hành!'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {validation.issues.map((issue) => {
          const isError = issue.severity === 'error';
          const isWarn = issue.severity === 'warning';
          const isSuccess = issue.severity === 'success';

          return (
            <div
              key={issue.id}
              onClick={() => {
                if (issue.componentIds && issue.componentIds.length > 0) {
                  onHighlightComponents(issue.componentIds);
                }
              }}
              className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                isError
                  ? 'bg-rose-950/40 border-rose-600/50 hover:border-rose-400 text-rose-200'
                  : isWarn
                  ? 'bg-amber-950/30 border-amber-600/50 hover:border-amber-400 text-amber-200'
                  : 'bg-emerald-950/30 border-emerald-600/50 text-emerald-200'
              }`}
            >
              <div className="flex items-start gap-2">
                {isError ? (
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                ) : isWarn ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold font-tech text-white">
                      {issue.title}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-900/60 border border-slate-700">
                      {issue.ruleName}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                    {issue.message}
                  </p>
                  {issue.componentIds && issue.componentIds.length > 0 && (
                    <span className="inline-block mt-1.5 text-[10px] text-amber-400 hover:underline">
                      → Nhấp để định vị linh kiện trên sơ đồ
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Quy chuẩn kỹ thuật: ISO 1219-1/2</span>
        <span className={validation.isValid ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
          {validation.isValid ? 'SẴN SÀNG CHẠY' : 'BỊ KHÓA DO LỖI'}
        </span>
      </div>
    </div>
  );
};
