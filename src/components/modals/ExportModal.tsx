import React, { useState } from 'react';
import { ProjectData } from '../../types/hydraulic';
import { X, Download, Upload, Copy, Check, FileText, Printer } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectData: ProjectData;
  onImportProject: (data: ProjectData) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  projectData,
  onImportProject,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'report'>('export');
  const [copied, setCopied] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(projectData, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectData.projectId || 'hydraulic-system'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    try {
      setImportError(null);
      const parsed = JSON.parse(importJsonText);
      if (!parsed.components || !Array.isArray(parsed.components)) {
        throw new Error('Định dạng JSON không hợp lệ: thiếu mảng components.');
      }
      onImportProject(parsed);
      onClose();
    } catch (err: any) {
      setImportError(err.message || 'Lỗi phân tích cú pháp JSON.');
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-rose-500" />
            <div>
              <h2 className="text-base font-bold text-white font-tech">
                XUẤT / NHẬP DỮ LIỆU & BÁO CÁO BÀI GIẢNG
              </h2>
              <p className="text-xs text-slate-400">
                Lưu trữ bài giảng, chia sẻ cấu hình hoặc in báo cáo kỹ thuật
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-5">
          <button
            onClick={() => setActiveTab('export')}
            className={`py-2.5 px-4 text-xs font-bold font-tech border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'border-rose-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Xuất File JSON
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`py-2.5 px-4 text-xs font-bold font-tech border-b-2 transition-colors ${
              activeTab === 'import'
                ? 'border-rose-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Nhập File JSON
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`py-2.5 px-4 text-xs font-bold font-tech border-b-2 transition-colors ${
              activeTab === 'report'
                ? 'border-rose-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Báo Cáo Giáo Trình In (Print)
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">
                  Dữ liệu sơ đồ hiện tại ({projectData.components.length} linh kiện, {projectData.pipes.length} đường ống):
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Đã sao chép' : 'Sao chép JSON'}</span>
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className="flex items-center gap-1 px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white font-tech shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải về .json</span>
                  </button>
                </div>
              </div>
              <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 max-h-80 overflow-y-auto">
                {jsonString}
              </pre>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Dán chuỗi JSON của bài học hoặc tải tệp `.json` từ máy tính của bạn:
              </p>
              <textarea
                rows={10}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='Dán nội dung JSON vào đây (e.g. {"projectId": "...", "components": [...]})'
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-500"
              />
              {importError && (
                <div className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded border border-rose-800">
                  {importError}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={handleImportSubmit}
                  disabled={!importJsonText.trim()}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold font-tech flex items-center gap-1.5 shadow"
                >
                  <Upload className="w-4 h-4" />
                  <span>Nạp Sơ Đồ & Chú Thích</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'report' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white font-tech">
                    {projectData.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Bản tổng hợp thuyết minh kỹ thuật và các bước mô phỏng dòng dầu
                  </p>
                </div>
                <button
                  onClick={handlePrintReport}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-tech shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>In / Lưu PDF</span>
                </button>
              </div>

              {/* Step by step summary for printing / study */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-amber-400 font-tech uppercase">
                  Quy trình 13 bước mô phỏng vận hành hệ thống:
                </h4>
                {projectData.simulationSteps.map((step, idx) => (
                  <div
                    key={step.stepId || idx}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-bold text-[10px] flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-white font-tech">
                        {step.title}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed pl-7">
                      {step.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
