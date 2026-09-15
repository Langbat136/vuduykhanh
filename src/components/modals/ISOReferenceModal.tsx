import React from 'react';
import { X, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';
import { COMPONENT_CATALOG } from '../../data/defaultCatalog';

interface ISOReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ISOReferenceModal: React.FC<ISOReferenceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white font-tech">
                PHỤ LỤC TRA CỨU KÝ HIỆU THỦY LỰC TIÊU CHUẨN ISO 1219
              </h2>
              <p className="text-xs text-slate-400">
                Quy ước biểu diễn sơ đồ mạch thủy lực công nghiệp quốc tế
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Color Convention Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]" />
              <div>
                <h4 className="text-xs font-bold text-rose-400 font-tech">
                  ĐƯỜNG DẦU VÀO / ÁP LỰC (MÀU ĐỎ)
                </h4>
                <p className="text-[11px] text-slate-300">
                  Dầu có áp suất cao được bơm đẩy đi cấp cho các van và đẩy xi lanh làm việc.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
              <div>
                <h4 className="text-xs font-bold text-cyan-400 font-tech">
                  ĐƯỜNG DẦU RA / HỒI (MÀU XANH)
                </h4>
                <p className="text-[11px] text-slate-300">
                  Dầu sau khi sinh công ở buồng đối diện hồi qua van về bể chứa ở áp suất thấp.
                </p>
              </div>
            </div>
          </div>

          {/* Components Reference Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-tech uppercase text-[11px] bg-slate-950/60">
                  <th className="py-2.5 px-3">Số hiệu</th>
                  <th className="py-2.5 px-3">Tên linh kiện</th>
                  <th className="py-2.5 px-3">Ký hiệu ISO 1219</th>
                  <th className="py-2.5 px-3">Chức năng trong mạch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {COMPONENT_CATALOG.map((item) => (
                  <tr key={item.type} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-rose-400 whitespace-nowrap">
                      {item.referenceNumber}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-100">
                      {item.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-amber-300 whitespace-nowrap">
                      {item.isoSymbolCode}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 text-[11px] leading-relaxed">
                      {item.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Principle of Overcenter & 4/3 Valve */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-amber-400 font-tech uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Nguyên lý khóa tải an toàn của Van Cân Bằng Kép (17):
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Khi van 4/3 (16) ở vị trí <b>Trung tâm (NEUTRAL)</b>, đường P bị khóa. Lúc này van cân bằng kép (17) lập tức đóng chặt cả 2 cổng C1 và C2. Dầu trong buồng xi lanh không thể rò rỉ ra ngoài, giúp <b>chân kích đứng im tuyệt đối</b>, không bị tụt lún kể cả khi cẩu xe tải nặng. Khi muốn thu chân kích về, áp suất pilot từ buồng bên kia sẽ mở hé van cân bằng, giúp hạ tải êm ái mà không bị rơi tự do do trọng lực.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
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
