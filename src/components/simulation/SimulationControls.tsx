import React from 'react';
import { SimulationStep, ValveState } from '../../types/hydraulic';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Zap,
  Lock,
  ArrowUp,
  ArrowDown,
  Edit3,
} from 'lucide-react';

interface SimulationControlsProps {
  steps: SimulationStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSelectStep: (index: number) => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  // Manual override controls
  activeBranch: number | 'ALL';
  onSelectBranch: (branch: number | 'ALL') => void;
  manualValveState: ValveState;
  onSetManualValveState: (state: ValveState) => void;
  onOpenStepEditor?: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  steps,
  currentStepIndex,
  isPlaying,
  onPlay,
  onPause,
  onReset,
  onPrevStep,
  onNextStep,
  onSelectStep,
  speed,
  onChangeSpeed,
  activeBranch,
  onSelectBranch,
  manualValveState,
  onSetManualValveState,
  onOpenStepEditor,
}) => {
  const currentStep = steps[currentStepIndex] || steps[0];

  return (
    <footer className="w-full bg-slate-900/95 border-t border-slate-800 text-slate-100 z-20 backdrop-blur-md shadow-2xl flex flex-col">
      {/* Top Bar: Timeline Scrubber & Step Navigation */}
      <div className="px-4 py-2 border-b border-slate-800/80 flex items-center justify-between gap-4 overflow-x-auto">
        {/* Step dots scrubber */}
        <div className="flex items-center gap-1.5 flex-1 min-w-[300px]">
          {steps.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            return (
              <button
                key={step.stepId || idx}
                onClick={() => onSelectStep(idx)}
                title={`Bước ${idx + 1}: ${step.title}`}
                className={`relative group flex items-center justify-center rounded-full transition-all ${
                  isActive
                    ? 'w-7 h-7 bg-amber-400 text-slate-950 font-bold text-xs shadow-md ring-2 ring-amber-300/60 scale-110'
                    : idx < currentStepIndex
                    ? 'w-5 h-5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px]'
                    : 'w-5 h-5 bg-slate-800 hover:bg-slate-700 text-slate-500 text-[10px]'
                }`}
              >
                <span>{idx + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Edit Comments Button */}
        {onOpenStepEditor && (
          <button
            onClick={onOpenStepEditor}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 text-xs font-semibold transition-all shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Sửa chú thích ({steps.length} bước)</span>
          </button>
        )}
      </div>

      {/* Main Controls Row */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Playback Controls Group */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
            title="Đặt lại từ đầu (Reset)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onPrevStep}
            disabled={currentStepIndex === 0}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-300 hover:text-white transition-colors border border-slate-700"
            title="Bước trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Primary Play/Pause Button */}
          <button
            onClick={isPlaying ? onPause : onPlay}
            className={`px-4 py-2 rounded-lg font-bold font-tech text-xs tracking-wider flex items-center gap-2 transition-all shadow-lg ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>TẠM DỪNG</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>CHẠY MÔ PHỎNG</span>
              </>
            )}
          </button>

          <button
            onClick={onNextStep}
            disabled={currentStepIndex >= steps.length - 1}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-300 hover:text-white transition-colors border border-slate-700"
            title="Bước tiếp theo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Speed selector */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg ml-2 text-xs">
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`px-2 py-0.5 rounded font-mono font-bold transition-colors ${
                  speed === s
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Current Step Subtitle Description Display */}
        <div className="flex-1 max-w-xl px-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 font-tech uppercase tracking-wide">
              Bước {currentStepIndex + 1}/{steps.length}: {currentStep?.title}
            </span>
          </div>
          <p className="text-xs text-slate-300 line-clamp-1 mt-0.5 font-sans">
            {currentStep?.comment}
          </p>
        </div>

        {/* Manual Interactive Valve & Actuator Controls */}
        <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
          {/* Branch selector */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold">Nhánh:</span>
            <button
              onClick={() => onSelectBranch('ALL')}
              className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                activeBranch === 'ALL'
                  ? 'bg-amber-400 text-slate-950 shadow-md ring-1 ring-amber-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="Điều khiển đồng thời cả 4 chân kích"
            >
              CẢ 4
            </button>
            {[1, 2, 3, 4].map((b) => (
              <button
                key={b}
                onClick={() => onSelectBranch(b)}
                className={`w-6 h-6 rounded text-xs font-bold transition-all ${
                  activeBranch === b
                    ? 'bg-amber-400 text-slate-950 shadow-md ring-1 ring-amber-300'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                #{b}
              </button>
            ))}
          </div>

          {/* Solenoid States Toggle with Animations */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => onSetManualValveState('COIL_A')}
              className={`relative px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 transition-all select-none ${
                manualValveState === 'COIL_A'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 ring-2 ring-rose-400'
                  : 'text-slate-400 hover:text-rose-400 hover:bg-slate-900'
              }`}
              title="Cấp điện Cuộn A (+24V): Dầu C1 đẩy chân kích duỗi ra"
            >
              <span className={`w-2 h-2 rounded-full ${manualValveState === 'COIL_A' ? 'bg-amber-300 animate-ping' : 'bg-rose-500/60'}`} />
              <ArrowUp className={`w-3.5 h-3.5 ${manualValveState === 'COIL_A' ? 'animate-bounce' : ''}`} />
              <span>Cuộn A (Ra)</span>
            </button>

            <button
              onClick={() => onSetManualValveState('NEUTRAL')}
              className={`relative px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 transition-all select-none ${
                manualValveState === 'NEUTRAL'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 ring-2 ring-emerald-400'
                  : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900'
              }`}
              title="Vị trí trung tâm: Van cân bằng kép (17) khóa tải an toàn tuyệt đối"
            >
              <span className={`w-2 h-2 rounded-full ${manualValveState === 'NEUTRAL' ? 'bg-amber-300 animate-ping' : 'bg-emerald-500/60'}`} />
              <Lock className="w-3.5 h-3.5" />
              <span>Khóa Tải</span>
            </button>

            <button
              onClick={() => onSetManualValveState('COIL_B')}
              className={`relative px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 transition-all select-none ${
                manualValveState === 'COIL_B'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/40 ring-2 ring-sky-400'
                  : 'text-slate-400 hover:text-sky-400 hover:bg-slate-900'
              }`}
              title="Cấp điện Cuộn B (+24V): Dầu C2 thu chân kích về"
            >
              <span className={`w-2 h-2 rounded-full ${manualValveState === 'COIL_B' ? 'bg-amber-300 animate-ping' : 'bg-sky-500/60'}`} />
              <ArrowDown className={`w-3.5 h-3.5 ${manualValveState === 'COIL_B' ? 'animate-bounce' : ''}`} />
              <span>Cuộn B (Vào)</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
