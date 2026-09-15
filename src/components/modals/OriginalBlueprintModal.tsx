import React from 'react';
import { X, CheckCircle, Info, ShieldCheck, Zap, Layers } from 'lucide-react';

interface OriginalBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OriginalBlueprintModal: React.FC<OriginalBlueprintModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold font-tech">
              ISO
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-tech tracking-wide">
                ĐỐI CHIẾU SƠ ĐỒ NGUYÊN LÝ GỐC (BẢN VẼ CHUẨN KỸ THUẬT)
              </h2>
              <p className="text-xs text-slate-400">
                Hệ thống thủy lực 4 nhánh chân kích khóa tải an toàn bằng van cân bằng kép (17)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Rule Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-300 font-tech">
                  ĐIỀU KHIỂN ĐIỆN 24V & 220V
                </h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Tủ điều khiển (trên cùng bên phải) cấp <b>+24V DC</b> chạy dọc thanh bus trên cùng điều khiển Cuộn A, Cuộn B của van (16) và van điện từ 2/2 (5). Bảng điều khiển (dưới) cấp nguồn động lực <b>~220V-50Hz</b> cho Động cơ (2).
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-300 font-tech">
                  KHÓA TẢI AN TOÀN (17)
                </h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  4 cụm van cân bằng kép <b>(17)</b> đặt trong khung nét đứt màu xanh với các cổng V2, V1, C2, C1. Có 2 đường trích áp pilot bắt chéo nhau đảm bảo chân kích không bị rơi tự do và đứng im khi cẩu hàng nặng.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start gap-3">
              <Layers className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-300 font-tech">
                  QUY ƯỚC ĐƯỜNG DẦU ĐỎ & XANH
                </h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  <b>Đường Đỏ (P)</b>: Dầu áp suất cao từ bơm (13) qua van 1 chiều (14), van an toàn (4) tới các cổng P và đẩy xi lanh.<br />
                  <b>Đường Xanh (T)</b>: Dầu hồi từ các cổng T và C2 qua van lưu lượng bù áp (6) về cổ lọc (11) của bể (1).
                </p>
              </div>
            </div>
          </div>

          {/* Component Number Mapping Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
            <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs font-bold text-slate-300 font-tech uppercase">
              Bảng đối chiếu 17 ký hiệu số trên sơ đồ nguyên lý
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 text-xs">
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold flex items-center justify-center text-[11px]">
                    (1)
                  </span>
                  <span className="text-slate-200 font-semibold">Bể chứa dầu</span>
                  <span className="text-slate-400 text-[11px]">— Thùng dầu 3D màu xanh lá đáy bên phải</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold flex items-center justify-center text-[11px]">
                    (2)
                  </span>
                  <span className="text-slate-200 font-semibold">Động cơ điện (M)</span>
                  <span className="text-slate-400 text-[11px]">— Vòng tròn chữ M nối nguồn ~220V</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold flex items-center justify-center text-[11px]">
                    (4)
                  </span>
                  <span className="text-slate-200 font-semibold">Van an toàn / xả áp</span>
                  <span className="text-slate-400 text-[11px]">— Chống quá áp bảo vệ bơm và đường ống</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold flex items-center justify-center text-[11px]">
                    (5)
                  </span>
                  <span className="text-slate-200 font-semibold">Van điện từ 2/2 xả tải</span>
                  <span className="text-slate-400 text-[11px]">— Điều khiển bởi cuộn hút +24V DC</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold flex items-center justify-center text-[11px]">
                    (6)
                  </span>
                  <span className="text-slate-200 font-semibold">Van lưu lượng bù áp</span>
                  <span className="text-slate-400 text-[11px]">— Ổn định lưu lượng dầu hồi về bể chứa</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold flex items-center justify-center text-[11px]">
                    (11)
                  </span>
                  <span className="text-slate-200 font-semibold">Cổ lọc dầu / đường hồi</span>
                  <span className="text-slate-400 text-[11px]">— Lọc cặn bẩn dầu trước khi vào bể (1)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold flex items-center justify-center text-[11px]">
                    (12)
                  </span>
                  <span className="text-slate-200 font-semibold">Khớp nối trục đàn hồi</span>
                  <span className="text-slate-400 text-[11px]">— Truyền động từ động cơ (2) sang bơm (13)</span>
                </div>
              </div>

              <div className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold flex items-center justify-center text-[11px]">
                    (13)
                  </span>
                  <span className="text-slate-200 font-semibold">Bơm bánh răng</span>
                  <span className="text-slate-400 text-[11px]">— Cặp bánh răng ăn khớp hút dầu áp cao</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold flex items-center justify-center text-[11px]">
                    (14)
                  </span>
                  <span className="text-slate-200 font-semibold">Van 1 chiều chính</span>
                  <span className="text-slate-400 text-[11px]">— Chống dầu dội ngược làm hỏng bơm (13)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold flex items-center justify-center text-[11px]">
                    (16)
                  </span>
                  <span className="text-slate-200 font-semibold">4 × Van 4/3 điện từ</span>
                  <span className="text-slate-400 text-[11px]">— Cuộn A (trái), Cuộn B (phải), P/T/A/B</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold flex items-center justify-center text-[11px]">
                    (17)
                  </span>
                  <span className="text-slate-200 font-semibold">4 × Van cân bằng kép</span>
                  <span className="text-slate-400 text-[11px]">— Khóa giữ tải V1/V2 và C1/C2</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold flex items-center justify-center text-[11px]">
                    (18)
                  </span>
                  <span className="text-slate-200 font-semibold">4 × Chân kích thủy lực</span>
                  <span className="text-slate-400 text-[11px]">— Xi lanh tác động kép nâng hạ xe/máy</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold flex items-center justify-center text-[11px]">
                    TỦ
                  </span>
                  <span className="text-slate-200 font-semibold">Tủ điều khiển 24V</span>
                  <span className="text-slate-400 text-[11px]">— Khối xanh lục trên cùng bên phải (+24V)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold flex items-center justify-center text-[11px]">
                    BẢNG
                  </span>
                  <span className="text-slate-200 font-semibold">Bảng điều khiển động lực</span>
                  <span className="text-slate-400 text-[11px]">— 3 pha A, B, C tiếp điểm 1-2, 3-4, 5-6</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Ứng dụng đã chuẩn hóa 100% đồ họa theo tiêu chuẩn ISO 1219-1/2 và sơ đồ kỹ thuật
          </span>
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
