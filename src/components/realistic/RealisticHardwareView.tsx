import React, { useState } from 'react';
import { ComponentNode, PipeConnection, SimulationStep, ValveState } from '../../types/hydraulic';
import {
  Activity,
  Gauge,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Info,
  ArrowUp,
  ArrowDown,
  Lock,
  Shield,
  CheckCircle2,
} from 'lucide-react';

interface RealisticHardwareViewProps {
  components: ComponentNode[];
  pipes: PipeConnection[];
  isSimulating: boolean;
  activeStep?: SimulationStep;
  activeBranch?: number | 'ALL';
  onSelectBranch?: (branch: number | 'ALL') => void;
  manualValveState?: ValveState;
  onSetManualValveState?: (state: ValveState) => void;
}

export const RealisticHardwareView: React.FC<RealisticHardwareViewProps> = ({
  components,
  pipes,
  isSimulating,
  activeStep,
  activeBranch = 'ALL',
  onSelectBranch,
  manualValveState = 'COIL_A',
  onSetManualValveState,
}) => {
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 20, y: 10 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedHardwareId, setSelectedHardwareId] = useState<string | null>(null);

  // Extract actuator dynamic state from simulation or components
  const gaugeComponent = components.find((c) => c.type === 'PRESSURE_GAUGE');
  const currentPressure = activeStep?.actuatorState?.pressureGauge ?? gaugeComponent?.properties?.pressureBar ?? 145;

  // Active valve state for a specific branch (1, 2, 3, 4)
  const getBranchValveState = (b: number): ValveState => {
    if (isSimulating) {
      const stepBranch = activeStep?.actuatorState?.branchIndex;
      if (stepBranch !== undefined && stepBranch !== 'ALL' && stepBranch !== b) {
        return 'NEUTRAL';
      }
      return activeStep?.actuatorState?.valveState ?? 'NEUTRAL';
    }
    const branchMatched = activeBranch === 'ALL' || (activeBranch as unknown as number) === b;
    if (branchMatched) {
      return (manualValveState as ValveState) || 'NEUTRAL';
    }
    const comp = components.find((c) => c.type === 'DIRECTIONAL_VALVE_4_3' && c.branchIndex === b);
    return comp?.properties?.state ?? 'NEUTRAL';
  };

  // Cylinder stroke percentage (0 - 100%) for each individual branch (1, 2, 3, 4)
  const getCylinderStroke = (b: number): number => {
    if (isSimulating && activeStep?.actuatorState?.cylinderStrokes && activeStep.actuatorState.cylinderStrokes[b - 1] !== undefined) {
      return activeStep.actuatorState.cylinderStrokes[b - 1];
    }
    const comp = components.find((c) => c.type === 'HYDRAULIC_CYLINDER' && c.branchIndex === b);
    if (comp?.properties?.cylinderStroke !== undefined) {
      return comp.properties.cylinderStroke;
    }
    const vState = getBranchValveState(b);
    if (vState === 'COIL_A') return 75;
    if (vState === 'COIL_B') return 15;
    return 45;
  };

  // Check if a branch is currently active/energized
  const isBranchActive = (b: number): boolean => {
    if (isSimulating) {
      const stepBranch = activeStep?.actuatorState?.branchIndex;
      return !stepBranch || stepBranch === 'ALL' || stepBranch === b;
    }
    return activeBranch === 'ALL' || (activeBranch as unknown as number) === b;
  };

  // General valve state for display
  const currentValveState: ValveState = isSimulating ? (activeStep?.actuatorState?.valveState ?? 'COIL_A') : manualValveState;
  const tankCylinderAction = currentValveState === 'COIL_A' ? 'extend' : currentValveState === 'COIL_B' ? 'retract' : 'locked';

  // Motor & pump rotation state
  const isMotorRunning = isSimulating || manualValveState !== 'NEUTRAL';

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.hardware-interactive') || target.closest('.inspector-drawer')) {
      return;
    }
    if (e.button === 0 || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  // Mouse wheel zoom centered on cursor
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newZoom = Math.min(2.5, Math.max(0.25, Number((zoom * zoomFactor).toFixed(3))));

    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 select-none ${
        isPanning ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Industrial Metallic Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, #334155 1px, transparent 1px),
            linear-gradient(to bottom, #334155 1px, transparent 1px)
          `,
          backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      {/* Floating Status / Hardware Telemetry Bar */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 p-1.5 rounded-lg shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/80 rounded border border-slate-800">
          <span className={`w-2.5 h-2.5 rounded-full ${isMotorRunning ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]' : 'bg-slate-600'}`} />
          <span className="text-[11px] font-tech font-bold text-slate-200">
            {isMotorRunning ? 'ĐỘNG CƠ: ĐANG QUAY' : 'ĐỘNG CƠ: TẮT'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/80 rounded border border-slate-800">
          <Gauge className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-mono font-bold text-amber-300">
            {currentPressure} bar
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/80 rounded border border-slate-800">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-tech font-bold text-cyan-300">
            CHẾ ĐỘ: {currentValveState === 'COIL_A' ? 'CUỘN A (DUỖI TẢI)' : currentValveState === 'COIL_B' ? 'CUỘN B (THU CẦN)' : 'TRUNG TÂM (KHÓA TẢI)'}
          </span>
        </div>

        <div className="w-px h-4 bg-slate-700 mx-0.5" />

        {/* Zoom Controls */}
        <button
          onClick={() => setZoom((z) => Math.min(1.8, z + 0.1))}
          className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
          title="Phóng to"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-[10px] font-mono text-slate-400 px-1">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
          className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
          title="Thu nhỏ"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(0.85);
            setPan({ x: 20, y: 10 });
          }}
          className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
          title="Khôi phục góc nhìn"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Direct Interactive Control Bar for Frame 2: Select all 4 or single cylinder, and control Cuộn A / Khóa tải / Cuộn B */}
      <div className="absolute top-14 left-3 z-20 flex flex-wrap items-center gap-2 bg-slate-900/95 border border-slate-700/80 p-1.5 rounded-lg shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider px-1">Chân kích:</span>
          <button
            onClick={() => onSelectBranch && onSelectBranch('ALL')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
              activeBranch === 'ALL'
                ? 'bg-amber-400 text-slate-950 shadow-md ring-1 ring-amber-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Chọn đồng bộ cả 4 chân kích"
          >
            CẢ 4 (ALL)
          </button>
          {[1, 2, 3, 4].map((b) => (
            <button
              key={b}
              onClick={() => onSelectBranch && onSelectBranch(b)}
              className={`w-6 h-6 rounded text-xs font-bold transition-all ${
                (activeBranch as unknown as number) === b
                  ? 'bg-amber-400 text-slate-950 shadow-md ring-1 ring-amber-300'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              #{b}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-slate-700 mx-1" />

        {/* 3 Animated Action Buttons for Frame 2 */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSetManualValveState && onSetManualValveState('COIL_A')}
            className={`relative px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 transition-all select-none ${
              manualValveState === 'COIL_A'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/50 ring-2 ring-rose-400'
                : 'bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-slate-750'
            }`}
            title="Kích hoạt Cuộn A (Ra): Cấp điện van (16) đẩy pít-tông duỗi chân kích"
          >
            <span className={`w-2 h-2 rounded-full ${manualValveState === 'COIL_A' ? 'bg-amber-300 animate-ping' : 'bg-rose-500/60'}`} />
            <ArrowUp className={`w-3.5 h-3.5 ${manualValveState === 'COIL_A' ? 'animate-bounce' : ''}`} />
            <span>Cuộn A (Ra)</span>
          </button>

          <button
            onClick={() => onSetManualValveState && onSetManualValveState('NEUTRAL')}
            className={`relative px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 transition-all select-none ${
              manualValveState === 'NEUTRAL'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/50 ring-2 ring-emerald-400'
                : 'bg-slate-800 text-slate-300 hover:text-emerald-400 hover:bg-slate-750'
            }`}
            title="Khóa tải (17): Vị trí trung gian, van cân bằng kép khóa chặt pít-tông 100%"
          >
            <span className={`w-2 h-2 rounded-full ${manualValveState === 'NEUTRAL' ? 'bg-amber-300 animate-ping' : 'bg-emerald-500/60'}`} />
            <Lock className="w-3.5 h-3.5" />
            <span>Khóa Tải (17)</span>
          </button>

          <button
            onClick={() => onSetManualValveState && onSetManualValveState('COIL_B')}
            className={`relative px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 transition-all select-none ${
              manualValveState === 'COIL_B'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/50 ring-2 ring-sky-400'
                : 'bg-slate-800 text-slate-300 hover:text-sky-400 hover:bg-slate-750'
            }`}
            title="Kích hoạt Cuộn B (Vào): Cấp điện van (16) mở pilot van cân bằng thu pít-tông"
          >
            <span className={`w-2 h-2 rounded-full ${manualValveState === 'COIL_B' ? 'bg-amber-300 animate-ping' : 'bg-sky-500/60'}`} />
            <ArrowDown className={`w-3.5 h-3.5 ${manualValveState === 'COIL_B' ? 'animate-bounce' : ''}`} />
            <span>Cuộn B (Vào)</span>
          </button>
        </div>
      </div>

      {/* Main Scaled Canvas of Realistic Physical Machinery */}
      <div
        className="absolute origin-top-left transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          width: '1800px',
          height: '1300px',
        }}
      >
        <svg
          className="w-full h-full overflow-visible pointer-events-auto"
          viewBox="0 0 1800 1300"
        >
          <defs>
            {/* Gradients for Photorealistic Materials */}
            {/* 1. Chrome Finish for Cylinder Piston Rod */}
            <linearGradient id="chromeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="20%" stopColor="#e2e8f0" />
              <stop offset="45%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#cbd5e1" />
              <stop offset="85%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            {/* 2. Cast Iron Texture for Valve Bodies */}
            <linearGradient id="castIronGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="40%" stopColor="#1e293b" />
              <stop offset="80%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* 3. Anodized Aluminum Blue for Valve Body */}
            <linearGradient id="anodizedBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="35%" stopColor="#2563eb" />
              <stop offset="70%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#172554" />
            </linearGradient>

            {/* 4. Brass Gold for Counterbalance Cartridges */}
            <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="30%" stopColor="#f59e0b" />
              <stop offset="60%" stopColor="#fef08a" />
              <stop offset="90%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            {/* 5. Motor Stator Teal/Green Industrial Paint */}
            <linearGradient id="motorTeal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="30%" stopColor="#047857" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="85%" stopColor="#059669" />
              <stop offset="100%" stopColor="#022c22" />
            </linearGradient>

            {/* 6. Hydraulic Oil Tank Steel Green */}
            <linearGradient id="tankSteel" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1f2937" />
              <stop offset="25%" stopColor="#374151" />
              <stop offset="60%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>

            {/* 7. Hydraulic Fluid Glow */}
            <filter id="oilGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* 8. Flexible Hydraulic Wire-Braid Hose Pattern */}
            <pattern id="hoseBraid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M0 0 L8 8 M8 0 L0 8" stroke="#334155" strokeWidth="1" />
            </pattern>

            {/* 9. High-Pressure Mineral Oil (Red) */}
            <linearGradient id="highPressureOilGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#991b1b" />
              <stop offset="25%" stopColor="#ef4444" />
              <stop offset="60%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>

            {/* 10. Low-Pressure Return Oil (Blue) */}
            <linearGradient id="returnOilGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#075985" />
              <stop offset="30%" stopColor="#0284c7" />
              <stop offset="70%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>

            {/* 11. Cylindrical Glass/Sleeve Reflection */}
            <linearGradient id="glassChamberGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="20%" stopColor="#ffffff" stopOpacity="0.06" />
              <stop offset="80%" stopColor="#000000" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.18" />
            </linearGradient>
          </defs>

          {/* ========================================================================= */}
          {/* 1. TOP ROW: 4 REALISTIC 4/3 SOLENOID DIRECTIONAL CONTROL VALVES (16)      */}
          {/* ========================================================================= */}
          {[1, 2, 3, 4].map((branch) => {
            const bx = 60 + (branch - 1) * 250;
            const by = 80;
            const isCoilAActive = isSimulating && currentValveState === 'COIL_A';
            const isCoilBActive = isSimulating && currentValveState === 'COIL_B';

            return (
              <g
                key={`real_valve_${branch}`}
                className="cursor-pointer group"
                onClick={() => setSelectedHardwareId(`valve_${branch}`)}
              >
                {/* Branch Heading */}
                <rect x={bx} y={by - 26} width={200} height={20} rx={4} fill="#0f172a" stroke="#334155" />
                <text x={bx + 100} y={by - 12} textAnchor="middle" className="text-[11px] font-tech font-bold fill-amber-400">
                  VAN ĐIỆN TỪ (16) - NHÁNH #{branch}
                </text>

                {/* Main Valve Body (Machined Anodized Heavy Metal Block) */}
                <rect
                  x={bx + 30}
                  y={by}
                  width={140}
                  height={86}
                  rx={6}
                  fill="url(#castIronGrad)"
                  stroke="#475569"
                  strokeWidth="2.5"
                  className="filter drop-shadow-lg"
                />

                {/* Subplate Mounting Screws (4 hex bolts) */}
                <circle cx={bx + 40} cy={by + 10} r={4} fill="#0f172a" stroke="#94a3b8" strokeWidth="1" />
                <circle cx={bx + 160} cy={by + 10} r={4} fill="#0f172a" stroke="#94a3b8" strokeWidth="1" />
                <circle cx={bx + 40} cy={by + 76} r={4} fill="#0f172a" stroke="#94a3b8" strokeWidth="1" />
                <circle cx={bx + 160} cy={by + 76} r={4} fill="#0f172a" stroke="#94a3b8" strokeWidth="1" />

                {/* Valve Nameplate */}
                <rect x={bx + 52} y={by + 12} width={96} height={22} rx={2} fill="#020617" stroke="#334155" />
                <text x={bx + 100} y={by + 26} textAnchor="middle" className="text-[10px] font-mono font-bold fill-cyan-400">
                  DSG-03-3C2-A240
                </text>

                {/* Spool Position Window (Con trượt dịch chuyển trực quan) */}
                <rect x={bx + 55} y={by + 40} width={90} height={20} rx={3} fill="#090d16" stroke="#1e293b" />
                {/* Moving Spool core */}
                <rect
                  x={bx + 55 + (isCoilAActive ? 5 : isCoilBActive ? 35 : 20)}
                  y={by + 43}
                  width={50}
                  height={14}
                  rx={2}
                  fill="url(#chromeGrad)"
                  stroke="#38bdf8"
                  strokeWidth="1"
                  className="transition-all duration-300"
                />
                <circle cx={bx + 75} cy={by + 50} r={2} fill={isCoilAActive ? '#f43f5e' : '#334155'} />
                <circle cx={bx + 100} cy={by + 50} r={2} fill="#334155" />
                <circle cx={bx + 125} cy={by + 50} r={2} fill={isCoilBActive ? '#38bdf8' : '#334155'} />

                {/* LEFT SOLENOID: COIL A */}
                <g>
                  {/* Armature tube */}
                  <rect x={bx - 4} y={by + 18} width={34} height={50} rx={4} fill="#0f172a" stroke="#64748b" strokeWidth="2" />
                  {/* Manual override emergency pin */}
                  <circle cx={bx - 8} cy={by + 43} r={3.5} fill="#f59e0b" stroke="#000" />
                  {/* DIN 43650 Connector Plug with LED */}
                  <path d={`M ${bx} ${by + 8} L ${bx + 24} ${by + 8} L ${bx + 20} ${by + 22} L ${bx + 4} ${by + 22} Z`} fill="#1e293b" stroke="#475569" />
                  {/* Illuminated Indicator LED A */}
                  <circle
                    cx={bx + 12}
                    cy={by + 15}
                    r={3.5}
                    fill={isCoilAActive ? '#22c55e' : '#334155'}
                    className={isCoilAActive ? 'animate-ping' : ''}
                  />
                  <circle
                    cx={bx + 12}
                    cy={by + 15}
                    r={3.5}
                    fill={isCoilAActive ? '#22c55e' : '#334155'}
                    filter={isCoilAActive ? 'url(#oilGlow)' : undefined}
                  />
                  <text x={bx + 8} y={by + 47} className="text-[9px] font-tech font-bold fill-slate-300">
                    A
                  </text>
                </g>

                {/* RIGHT SOLENOID: COIL B */}
                <g>
                  {/* Armature tube */}
                  <rect x={bx + 170} y={by + 18} width={34} height={50} rx={4} fill="#0f172a" stroke="#64748b" strokeWidth="2" />
                  {/* Manual override emergency pin */}
                  <circle cx={bx + 208} cy={by + 43} r={3.5} fill="#f59e0b" stroke="#000" />
                  {/* DIN 43650 Connector Plug with LED */}
                  <path d={`M ${bx + 176} ${by + 8} L ${bx + 200} ${by + 8} L ${bx + 196} ${by + 22} L ${bx + 180} ${by + 22} Z`} fill="#1e293b" stroke="#475569" />
                  {/* Illuminated Indicator LED B */}
                  <circle
                    cx={bx + 188}
                    cy={by + 15}
                    r={3.5}
                    fill={isCoilBActive ? '#22c55e' : '#334155'}
                    className={isCoilBActive ? 'animate-ping' : ''}
                  />
                  <circle
                    cx={bx + 188}
                    cy={by + 15}
                    r={3.5}
                    fill={isCoilBActive ? '#22c55e' : '#334155'}
                    filter={isCoilBActive ? 'url(#oilGlow)' : undefined}
                  />
                  <text x={bx + 184} y={by + 47} className="text-[9px] font-tech font-bold fill-slate-300">
                    B
                  </text>
                </g>

                {/* Steel Hydraulic Hose Couplings at Bottom (P, T, A, B) */}
                <rect x={bx + 62} y={by + 86} width={14} height={12} fill="#94a3b8" stroke="#334155" />
                <text x={bx + 69} y={by + 82} textAnchor="middle" className="text-[9px] font-mono font-bold fill-rose-400">P</text>

                <rect x={bx + 124} y={by + 86} width={14} height={12} fill="#94a3b8" stroke="#334155" />
                <text x={bx + 131} y={by + 82} textAnchor="middle" className="text-[9px] font-mono font-bold fill-cyan-400">T</text>

                <rect x={bx + 42} y={by + 86} width={14} height={12} fill="#94a3b8" stroke="#334155" />
                <text x={bx + 49} y={by + 82} textAnchor="middle" className="text-[9px] font-mono font-bold fill-rose-400">A</text>

                <rect x={bx + 144} y={by + 86} width={14} height={12} fill="#94a3b8" stroke="#334155" />
                <text x={bx + 151} y={by + 82} textAnchor="middle" className="text-[9px] font-mono font-bold fill-cyan-400">B</text>
              </g>
            );
          })}

          {/* ========================================================================= */}
          {/* 2. MIDDLE ROW: 4 REALISTIC DUAL COUNTERBALANCE MANIFOLDS (17)             */}
          {/* ========================================================================= */}
          {[1, 2, 3, 4].map((branch) => {
            const bx = 60 + (branch - 1) * 250;
            const by = 340;

            return (
              <g
                key={`real_cb_${branch}`}
                className="cursor-pointer group"
                onClick={() => setSelectedHardwareId(`cb_${branch}`)}
              >
                {/* Manifold Block - Heavy Golden Anodized Aluminum with Mounting Holes */}
                <rect
                  x={bx + 35}
                  y={by}
                  width={130}
                  height={110}
                  rx={8}
                  fill="url(#brassGrad)"
                  stroke="#78350f"
                  strokeWidth="2"
                  className="filter drop-shadow-xl"
                />

                {/* Subplate Laser Engraved Technical Schema on Manifold Face */}
                <rect x={bx + 43} y={by + 8} width={114} height={94} rx={4} fill="#1e1b18" stroke="#92400e" strokeWidth="1" />
                <text x={bx + 100} y={by + 22} textAnchor="middle" className="text-[9px] font-tech font-bold fill-amber-300">
                  VAN CÂN BẰNG KÉP (17)
                </text>
                <text x={bx + 100} y={by + 33} textAnchor="middle" className="text-[8px] font-mono fill-slate-400">
                  VBCD-3/8-DE-FL
                </text>

                {/* Dual Hex Adjustment Screws (Vít chỉnh áp lò xo pilot 4:1) */}
                <circle cx={bx + 62} cy={by + 52} r={12} fill="#451a03" stroke="#f59e0b" strokeWidth="2" />
                <polygon points={`${bx+62},${by+46} ${bx+67},${by+49} ${bx+67},${by+55} ${bx+62},${by+58} ${bx+57},${by+55} ${bx+57},${by+49}`} fill="#d97706" />
                <text x={bx + 62} y={by + 74} textAnchor="middle" className="text-[8px] font-mono fill-amber-200">V1 ↔ C1</text>

                <circle cx={bx + 138} cy={by + 52} r={12} fill="#451a03" stroke="#f59e0b" strokeWidth="2" />
                <polygon points={`${bx+138},${by+46} ${bx+143},${by+49} ${bx+143},${by+55} ${bx+138},${by+58} ${bx+133},${by+55} ${bx+133},${by+49}`} fill="#d97706" />
                <text x={bx + 138} y={by + 74} textAnchor="middle" className="text-[8px] font-mono fill-amber-200">V2 ↔ C2</text>

                {/* Ports Labeling V1, V2 (top) & C1, C2 (bottom) */}
                <text x={bx + 52} y={by + 96} className="text-[9px] font-mono font-bold fill-rose-400">C1 (Nâng)</text>
                <text x={bx + 115} y={by + 96} className="text-[9px] font-mono font-bold fill-cyan-400">C2 (Hạ)</text>
              </g>
            );
          })}

          {/* ========================================================================= */}
          {/* 3. BOTTOM ROW: 4 HEAVY-DUTY CHROME HYDRAULIC OUTRIGGER CYLINDERS (18)      */}
          {/* ========================================================================= */}
          {[1, 2, 3, 4].map((branch) => {
            const cx = 100 + (branch - 1) * 250;
            const cy = 640;

            // Physical stroke in pixels based on extension
            const maxTravel = 135;
            const strokePercent = getCylinderStroke(branch);
            const currentTravel = (strokePercent / 100) * maxTravel;
            const branchActive = isBranchActive(branch);
            const branchValveState = getBranchValveState(branch);
            const cylinderAction: 'extend' | 'retract' | 'locked' =
              branchValveState === 'COIL_A' ? 'extend' : branchValveState === 'COIL_B' ? 'retract' : 'locked';

            return (
              <g
                key={`real_cyl_${branch}`}
                className="cursor-pointer group hardware-interactive"
                onClick={() => setSelectedHardwareId(`cylinder_${branch}`)}
              >
                {/* Cylinder Title */}
                <text x={cx + 25} y={cy - 14} textAnchor="middle" className="text-[11px] font-tech font-bold fill-slate-200">
                  CHÂN KÍCH THỦY LỰC #{branch} (18)
                </text>

                {/* Live Volumetric Status Badge */}
                <g transform={`translate(${cx - 35}, ${cy - 46})`}>
                  <rect x="0" y="0" width="120" height="26" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
                  <text x="60" y="11" textAnchor="middle" className="text-[8px] font-tech font-bold fill-amber-400">
                    {cylinderAction === 'extend' ? '▲ ĐANG BƠM DUỖI' : cylinderAction === 'retract' ? '▼ ĐANG BƠM THU' : '● KHÓA AN TOÀN'}
                  </text>
                  <text x="60" y="21" textAnchor="middle" className="text-[7.5px] font-mono fill-slate-300">
                    Hành trình: {Math.round((currentTravel / maxTravel) * 200)} mm
                  </text>
                </g>

                {/* Top Cap & C1 Fitting (Cổng cấp dầu đáy buồng đẩy) */}
                <path d={`M ${cx - 4} ${cy} L ${cx + 54} ${cy} L ${cx + 48} ${cy + 18} L ${cx + 2} ${cy + 18} Z`} fill="#334155" stroke="#64748b" strokeWidth="2" />
                <circle cx={cx + 25} cy={cy + 8} r={5.5} fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
                {/* Directional Fluid Arrow on C1 Port */}
                {cylinderAction === 'extend' && branchActive && (
                  <path d={`M ${cx + 25} ${cy + 16} L ${cx + 21} ${cy + 10} L ${cx + 29} ${cy + 10} Z`} fill="#ef4444" className="animate-bounce" />
                )}
                <text x={cx + 64} y={cy + 12} className="text-[9px] font-mono fill-rose-400 font-bold">C1 (Đáy)</text>

                {/* Cylinder Barrel Frame (Khung vỏ xi lanh thép chịu áp 350 bar) */}
                <rect
                  x={cx - 2}
                  y={cy + 18}
                  width={54}
                  height={190}
                  rx={4}
                  fill="#0b0f19"
                  stroke="#eab308"
                  strokeWidth="2.5"
                  className="filter drop-shadow-2xl"
                />

                {/* Millimeter Graduation Scale on Left Edge of Barrel */}
                {[0, 50, 100, 150, 200].map((mm, idx) => {
                  const sy = cy + 24 + idx * 38;
                  return (
                    <g key={`scale_${mm}`}>
                      <line x1={cx - 1} y1={sy} x2={cx + 5} y2={sy} stroke="#94a3b8" strokeWidth="1" />
                      <text x={cx - 5} y={sy + 3} textAnchor="end" className="text-[6.5px] font-mono fill-slate-400">
                        {mm}
                      </text>
                    </g>
                  );
                })}

                {/* ========================================================================= */}
                {/* DYNAMIC HYDRAULIC OIL CHAMBERS (BUỒNG ĐÁY & BUỒNG CẦN)                     */}
                {/* ========================================================================= */}
                {/* 1. BUỒNG ĐÁY (Bottom Chamber - C1): Dầu đỏ cao áp bơm vào đẩy piston duỗi */}
                <g className="transition-all duration-500 ease-out">
                  <rect
                    x={cx + 4}
                    y={cy + 22}
                    width={42}
                    height={Math.max(6, currentTravel)}
                    fill="url(#highPressureOilGrad)"
                    className={cylinderAction === 'extend' && branchActive ? 'opacity-95' : 'opacity-80'}
                  />
                  {/* Turbulent fluid ripples inside bottom chamber when extending */}
                  {cylinderAction === 'extend' && branchActive && (
                    <line
                      x1={cx + 4}
                      y1={cy + 20 + currentTravel}
                      x2={cx + 46}
                      y2={cy + 20 + currentTravel}
                      stroke="#fca5a5"
                      strokeWidth="2"
                      className="animate-pulse"
                    />
                  )}
                  {/* Fluid pressure particle dots inside red chamber */}
                  <circle cx={cx + 15} cy={cy + 22 + currentTravel * 0.4} r="2" fill="#fff" opacity="0.6" className="animate-ping" />
                  <circle cx={cx + 33} cy={cy + 22 + currentTravel * 0.7} r="1.5" fill="#fff" opacity="0.5" />
                </g>

                {/* 2. SOLID MACHINED STEEL PISTON HEAD (Quả Piston với phốt chặn dầu kép) */}
                <g transform={`translate(0, ${currentTravel})`} className="transition-all duration-500 ease-out">
                  {/* Piston Steel Body */}
                  <rect x={cx + 2} y={cy + 22} width={46} height={20} rx={2} fill="#334155" stroke="#0f172a" strokeWidth="1.5" />
                  {/* Bronze Wear Ring (Vòng dẫn hướng bằng đồng thau) */}
                  <rect x={cx + 2} y={cy + 28} width={46} height={7} fill="#f59e0b" />
                  {/* Polyurethane High Pressure Seal Rings (Phốt nắp chữ U) */}
                  <line x1={cx + 2} y1={cy + 24} x2={cx + 48} y2={cy + 24} stroke="#000" strokeWidth="1.5" />
                  <line x1={cx + 2} y1={cy + 39} x2={cx + 48} y2={cy + 39} stroke="#000" strokeWidth="1.5" />
                </g>

                {/* 3. BUỒNG CẦN (Rod Annular Chamber - C2): Dầu xanh hồi về bể hoặc đẩy thu */}
                <g className="transition-all duration-500 ease-out">
                  {/* Annular fluid space on left and right sides of the chrome rod */}
                  {cylinderAction === 'retract' && (
                    <>
                      <rect
                        x={cx + 4}
                        y={cy + 42 + currentTravel}
                        width={9}
                        height={Math.max(6, 160 - currentTravel)}
                        fill="url(#returnOilGrad)"
                        className="animate-pulse"
                      />
                      <rect
                        x={cx + 37}
                        y={cy + 42 + currentTravel}
                        width={9}
                        height={Math.max(6, 160 - currentTravel)}
                        fill="url(#returnOilGrad)"
                        className="animate-pulse"
                      />
                    </>
                  )}
                </g>

                {/* Transparent Acrylic Glass Reflection on Barrel (Hiệu ứng kính trong suốt) */}
                <rect
                  x={cx + 4}
                  y={cy + 22}
                  width={42}
                  height={182}
                  fill="url(#glassChamberGrad)"
                  pointerEvents="none"
                />

                {/* Port C2 Fitting near bottom gland (Buồng cần) */}
                <circle cx={cx + 8} cy={cy + 192} r={5.5} fill="#0284c7" stroke="#fff" strokeWidth="1.5" />
                {cylinderAction === 'retract' && branchActive && (
                  <path d={`M ${cx + 8} ${cy + 184} L ${cx + 4} ${cy + 190} L ${cx + 12} ${cy + 190} Z`} fill="#38bdf8" className="animate-bounce" />
                )}
                <text x={cx - 36} y={cy + 196} className="text-[9px] font-mono fill-cyan-400 font-bold">C2 (Cần)</text>

                {/* Gland Bushing (Cổ gạt bụi & phốt chịu áp kim loại mạ) */}
                <rect x={cx - 4} y={cy + 208} width={58} height={14} rx={3} fill="#475569" stroke="#94a3b8" />

                {/* MIRROR HARD-CHROME PISTON ROD (Cần piston mạ crôm bóng loáng duỗi ra) */}
                <rect
                  x={cx + 13}
                  y={cy + 222}
                  width={24}
                  height={36 + currentTravel}
                  fill="url(#chromeGrad)"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  className="transition-all duration-500 ease-out"
                />
                {/* Mirror reflection highlights on chrome rod */}
                <line
                  x1={cx + 18}
                  y1={cy + 222}
                  x2={cx + 18}
                  y2={cy + 256 + currentTravel}
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeOpacity="0.85"
                />

                {/* HEAVY SWIVEL OUTRIGGER FOOT PAD (Đế chân voi tiếp đất chịu tải xe) */}
                <g transform={`translate(0, ${currentTravel})`} className="transition-all duration-500 ease-out">
                  {/* Ball Joint Pivot */}
                  <circle cx={cx + 25} cy={cy + 262} r={8} fill="#475569" stroke="#000" />
                  {/* Heavy Steel Foot Pad */}
                  <ellipse cx={cx + 25} cy={cy + 272} rx={42} ry={12} fill="#0f172a" stroke="#eab308" strokeWidth="2.5" />
                  <ellipse cx={cx + 25} cy={cy + 270} rx={32} ry={8} fill="#334155" />
                  {/* Ground reference line */}
                  <line x1={cx - 30} y1={cy + 284} x2={cx + 80} y2={cy + 284} stroke="#64748b" strokeWidth="2" strokeDasharray="4 2" />
                </g>

                {/* Volumetric readout badge */}
                <g transform={`translate(${cx - 40}, ${cy + 300 + currentTravel})`}>
                  <rect x="0" y="0" width="130" height="34" rx="4" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
                  <text x="65" y="13" textAnchor="middle" className="text-[8px] font-mono fill-rose-400 font-bold">
                    Dầu đáy: {((currentTravel / maxTravel) * 2800).toFixed(0)} ml
                  </text>
                  <text x="65" y="26" textAnchor="middle" className="text-[8px] font-mono fill-cyan-400 font-bold">
                    Dầu cần: {(((maxTravel - currentTravel) / maxTravel) * 1600).toFixed(0)} ml
                  </text>
                </g>
              </g>
            );
          })}

          {/* ========================================================================= */}
          {/* 4. RIGHT COLUMN: REALISTIC POWER UNIT (MOTOR, PUMP, TANK, VALVES, GAUGE)  */}
          {/* ========================================================================= */}

          {/* 4.1. HEAVY 3D HYDRAULIC OIL RESERVOIR (1) */}
          <g transform="translate(1080, 780)">
            {/* Welded Steel Tank Body */}
            <rect x="0" y="0" width="360" height="240" rx="8" fill="url(#tankSteel)" stroke="#475569" strokeWidth="3" />
            <rect x="10" y="10" width="340" height="220" rx="4" fill="#090d16" />

            {/* Internal Fluid Level (Dầu thủy lực ISO VG 46/68 với bọt khí chuyển động thực tế) */}
            <rect x="12" y="50" width="336" height="178" rx="2" fill="#14532d" opacity="0.8" />
            {/* Fluid surface wave */}
            <path
              d="M 12 50 Q 95 46, 180 50 T 348 50"
              stroke="#4ade80"
              strokeWidth="2.5"
              fill="none"
              className="animate-pulse"
            />

            {/* Active oil turbulence & floating air bubbles */}
            {isMotorRunning && (
              <g>
                <circle cx="270" cy="140" r="3" fill="#86efac" opacity="0.8" className="animate-ping" />
                <circle cx="285" cy="105" r="2.5" fill="#86efac" opacity="0.7" className="animate-bounce" />
                <circle cx="260" cy="80" r="3" fill="#86efac" opacity="0.6" className="animate-pulse" />
                <circle cx="205" cy="130" r="2.5" fill="#86efac" opacity="0.7" className="animate-ping" />
                <circle cx="220" cy="95" r="2" fill="#86efac" opacity="0.6" className="animate-bounce" />
              </g>
            )}

            {/* Sight Glass Tube (Kính báo mức dầu trực quan) */}
            <rect x="330" y="70" width="16" height="120" rx="4" fill="#020617" stroke="#94a3b8" strokeWidth="1.5" />
            <rect
              x="334"
              y={tankCylinderAction === 'extend' ? 88 : tankCylinderAction === 'retract' ? 76 : 82}
              width="8"
              height={tankCylinderAction === 'extend' ? 92 : tankCylinderAction === 'retract' ? 104 : 98}
              rx="2"
              fill="#22c55e"
              opacity="0.9"
              className="transition-all duration-700"
            />
            <text x="316" y="86" className="text-[8px] font-mono fill-rose-400 font-bold">MAX</text>
            <text x="316" y="174" className="text-[8px] font-mono fill-amber-400 font-bold">MIN</text>

            {/* Breather Cap with Air Filter (Nắp thở & phễu rót dầu) */}
            <rect x="40" y="-22" width="40" height="22" rx="4" fill="#f59e0b" stroke="#000" strokeWidth="1.5" />
            <line x1="45" y1="-12" x2="75" y2="-12" stroke="#000" strokeWidth="2" />
            <text x="60" y="-26" textAnchor="middle" className="text-[8px] font-tech font-bold fill-amber-300">NẮP THỞ</text>

            {/* Suction Strainer (12/11) Screen Filter Inside Tank */}
            <rect x="180" y="120" width="50" height="70" rx="4" fill="url(#hoseBraid)" stroke="#94a3b8" strokeWidth="1.5" />
            <text x="205" y="158" textAnchor="middle" className="text-[8px] font-tech font-bold fill-slate-300">LỌC HÚT</text>

            {/* Return Line Diffuser Pipe (Ống xả hồi có vát 45 độ ngập dưới dầu) */}
            <line x1="280" y1="0" x2="280" y2="150" stroke="#0284c7" strokeWidth="8" />
            <line x1="280" y1="150" x2="260" y2="170" stroke="#0284c7" strokeWidth="8" />
            {isMotorRunning && (
              <circle cx="260" cy="170" r="8" fill="#38bdf8" opacity="0.5" className="animate-ping" />
            )}

            {/* Tank Plate Text */}
            <text x="140" y="32" textAnchor="middle" className="text-sm font-tech font-bold fill-slate-200">
              BỂ CHỨA DẦU THỦY LỰC (1) - 120 LÍT
            </text>
            <text x="140" y="44" textAnchor="middle" className="text-[10px] font-mono fill-emerald-400">
              NHỚT THỦY LỰC CHỐNG MÀI MÒN ISO VG 46
            </text>
          </g>

          {/* 4.2. ELECTRIC MOTOR (2) WITH ROTATING COOLING FANS */}
          <g transform="translate(1080, 570)">
            {/* Stator with Cooling Fins (Vỏ khía tản nhiệt gang đúc màu xanh công nghiệp) */}
            <rect x="0" y="15" width="160" height="110" rx="8" fill="url(#motorTeal)" stroke="#0f172a" strokeWidth="2.5" />
            {/* Cooling fin grooves */}
            {[25, 40, 55, 70, 85, 100, 115].map((fy) => (
              <line key={fy} x1="5" y1={fy} x2="155" y2={fy} stroke="#022c22" strokeWidth="2" />
            ))}

            {/* Motor Terminal Box (Hộp đấu dây điện 3 pha 220V/380V) */}
            <rect x="35" y="-6" width="70" height="24" rx="3" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="70" y="10" textAnchor="middle" className="text-[9px] font-mono font-bold fill-amber-300">
              ~ 3P 220V
            </text>

            {/* Rear Fan Cowl (Vỏ chụp quạt làm mát phía sau) */}
            <rect x="-35" y="20" width="35" height="100" rx="6" fill="#090d16" stroke="#334155" strokeWidth="2" />
            {/* Rotating Fan Blades (Quạt gió quay khi động cơ bật) */}
            <g className={isMotorRunning ? 'animate-spin' : ''} style={{ transformOrigin: '-17px 70px' }}>
              <line x1="-17" y1="40" x2="-17" y2="100" stroke="#f43f5e" strokeWidth="4" />
              <line x1="-32" y1="70" x2="-2" y2="70" stroke="#f43f5e" strokeWidth="4" />
            </g>

            {/* Output Drive Shaft & Flange */}
            <rect x="160" y="55" width="24" height="30" fill="url(#chromeGrad)" stroke="#475569" />

            {/* Motor Label */}
            <text x="80" y="70" textAnchor="middle" className="text-xs font-tech font-bold fill-white">
              ĐỘNG CƠ ĐIỆN (2) M
            </text>
            <text x="80" y="85" textAnchor="middle" className="text-[10px] font-mono fill-emerald-300">
              5.5 kW - 1450 RPM
            </text>
          </g>

          {/* 4.3. FLEXIBLE SHAFT COUPLING (12) (Khớp nối trục hoa khế) */}
          <g transform="translate(1264, 620)">
            <rect x="0" y="0" width="26" height="38" rx="3" fill="#334155" stroke="#94a3b8" />
            {/* Polyurethane Spider Element (Vòng đệm giảm chấn hoa khế màu đỏ cam) */}
            <rect x="8" y="2" width="10" height="34" fill="#f97316" className={isMotorRunning ? 'animate-pulse' : ''} />
            <text x="13" y="-6" textAnchor="middle" className="text-[8px] font-tech font-bold fill-orange-400">
              KHỚP NỐI (12)
            </text>
          </g>

          {/* 4.4. EXTERNAL GEAR PUMP (13) (Bơm bánh răng vỏ nhôm đúc) */}
          <g transform="translate(1290, 580)">
            <rect x="0" y="10" width="105" height="95" rx="10" fill="#475569" stroke="#94a3b8" strokeWidth="2.5" />
            {/* Internal Gear Cavities (2 bánh răng quay ăn khớp với nhau ép dầu) */}
            <circle cx="40" cy="45" r="22" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="40" cy="72" r="22" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />

            {/* Rotating Gear Teeth */}
            <g className={isMotorRunning ? 'animate-spin' : ''} style={{ transformOrigin: '40px 45px' }}>
              <line x1="18" y1="45" x2="62" y2="45" stroke="#f59e0b" strokeWidth="3" />
              <line x1="40" y1="23" x2="40" y2="67" stroke="#f59e0b" strokeWidth="3" />
            </g>
            <g className={isMotorRunning ? 'animate-spin' : ''} style={{ transformOrigin: '40px 72px', animationDirection: 'reverse' }}>
              <line x1="18" y1="72" x2="62" y2="72" stroke="#f59e0b" strokeWidth="3" />
              <line x1="40" y1="50" x2="40" y2="94" stroke="#f59e0b" strokeWidth="3" />
            </g>

            <text x="52" y="122" textAnchor="middle" className="text-[10px] font-tech font-bold fill-amber-300">
              BƠM BÁNH RĂNG (13)
            </text>

            {/* Suction Port (dưới hút từ bể) & Pressure Port (trên đẩy lên) */}
            <circle cx="40" cy="105" r="7" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
            <circle cx="85" cy="40" r="7" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
          </g>

          {/* 4.5. GLYCERINE PRESSURE GAUGE (Đồng hồ áp kế chân đồng mặt kính) */}
          <g transform="translate(1330, 360)">
            {/* Brass Threaded Stem */}
            <rect x="42" y="90" width="16" height="26" fill="url(#brassGrad)" stroke="#78350f" />
            {/* Stainless Steel Outer Casing */}
            <circle cx="50" cy="50" r="48" fill="#1e293b" stroke="#e2e8f0" strokeWidth="3.5" className="filter drop-shadow-xl" />
            {/* White/Silver Gauge Dial */}
            <circle cx="50" cy="50" r="42" fill="#f8fafc" stroke="#334155" strokeWidth="1.5" />

            {/* Gauge Markings (0 to 250 bar) */}
            <text x="50" y="32" textAnchor="middle" className="text-[8px] font-mono font-bold fill-slate-800">
              bar / PSI
            </text>
            <text x="30" y="65" className="text-[8px] font-mono fill-slate-700">0</text>
            <text x="45" y="24" className="text-[8px] font-mono fill-amber-700 font-bold">150</text>
            <text x="65" y="65" className="text-[8px] font-mono fill-rose-700 font-bold">250</text>

            {/* Rotating Gauge Needle (Kim áp kế giật rung theo áp suất thực tế) */}
            {(() => {
              // Map 0 to 250 bar to -120 deg to +120 deg
              const needleAngle = -120 + (Math.min(250, currentPressure) / 250) * 240;
              return (
                <g transform={`rotate(${needleAngle}, 50, 50)`} className="transition-transform duration-300">
                  <line x1="50" y1="50" x2="50" y2="16" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="4" fill="#0f172a" stroke="#dc2626" strokeWidth="1" />
                </g>
              );
            })()}

            <text x="50" y="74" textAnchor="middle" className="text-[11px] font-mono font-bold fill-rose-600">
              {currentPressure} bar
            </text>
            <text x="50" y="132" textAnchor="middle" className="text-[10px] font-tech font-bold fill-amber-400">
              ĐỒNG HỒ ĐO ÁP
            </text>
          </g>

          {/* 4.6. PRESSURE CONTROL VALVES: RELIEF (4), 2/2 SOLENOID (5), CHECK (14) */}
          <g transform="translate(1120, 360)">
            {/* Machined Steel Manifold Block */}
            <rect x="0" y="0" width="180" height="150" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2.5" />
            <text x="90" y="20" textAnchor="middle" className="text-[11px] font-tech font-bold fill-cyan-300">
              CỤM VAN AN TOÀN & BẢO VỆ
            </text>

            {/* Van an toàn (4) Cartridge with Locknut Adjuster */}
            <g transform="translate(20, 35)">
              <rect x="0" y="0" width="40" height="70" rx="4" fill="url(#brassGrad)" stroke="#78350f" />
              <circle cx="20" cy="80" r="10" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
              <text x="20" y="100" textAnchor="middle" className="text-[8px] font-tech fill-amber-300 font-bold">VAN (4)</text>
              <text x="20" y="108" textAnchor="middle" className="text-[7px] font-mono fill-slate-400">160 bar</text>
            </g>

            {/* Van điện từ 2/2 (5) Xả Tải (+24V) */}
            <g transform="translate(75, 35)">
              <rect x="0" y="0" width="38" height="60" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
              <circle
                cx="19"
                cy="12"
                r="4"
                fill={activeStep?.stepNumber === 4 ? '#22c55e' : '#475569'}
                className={activeStep?.stepNumber === 4 ? 'animate-ping' : ''}
              />
              <text x="19" y="45" textAnchor="middle" className="text-[8px] font-tech fill-slate-200 font-bold">2/2 (5)</text>
              <text x="19" y="75" textAnchor="middle" className="text-[8px] font-mono fill-cyan-400">+24V</text>
            </g>

            {/* Van một chiều (14) High Pressure Inline Check Valve */}
            <g transform="translate(130, 45)">
              <rect x="0" y="0" width="34" height="50" rx="3" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
              <polygon points="17,12 8,28 26,28" fill="#f43f5e" />
              <text x="17" y="40" textAnchor="middle" className="text-[8px] font-mono fill-rose-300">14</text>
            </g>
          </g>

          {/* 4.7. FLOW CONTROL COMPENSATED VALVE (6) */}
          <g transform="translate(1120, 200)">
            <rect x="0" y="0" width="140" height="70" rx="6" fill="#0f172a" stroke="#0284c7" strokeWidth="2" />
            <circle cx="70" cy="35" r="18" fill="url(#brassGrad)" stroke="#78350f" />
            <line x1="70" y1="20" x2="70" y2="50" stroke="#000" strokeWidth="3" />
            <text x="70" y="-8" textAnchor="middle" className="text-[10px] font-tech font-bold fill-cyan-300">
              VAN BÙ ÁP ĐIỀU CHỈNH LƯU LƯỢNG (6)
            </text>
          </g>

          {/* 4.8. TOP RIGHT: 24V POWER CONTROL CABINET */}
          <g transform="translate(1320, 60)">
            <rect x="0" y="0" width="160" height="110" rx="6" fill="#047857" stroke="#10b981" strokeWidth="2.5" />
            <rect x="8" y="8" width="144" height="94" rx="4" fill="#064e3b" />
            {/* Door handle & Indicator lamps */}
            <circle cx="30" cy="30" r="5" fill="#ef4444" className="animate-pulse" />
            <circle cx="50" cy="30" r="5" fill="#22c55e" />
            <circle cx="70" cy="30" r="5" fill="#eab308" />
            {/* Key lock */}
            <circle cx="135" cy="55" r="4" fill="#000" />

            <text x="80" y="60" textAnchor="middle" className="text-[11px] font-tech font-bold fill-white">
              TỦ ĐIỀU KHIỂN
            </text>
            <text x="80" y="75" textAnchor="middle" className="text-[10px] font-mono font-bold fill-emerald-200">
              24V DC RELAY & PLC
            </text>
          </g>

          {/* ========================================================================= */}
          {/* 5. HEAVY-DUTY HIGH PRESSURE FLEXIBLE HOSES INTERCONNECTING HARDWARE       */}
          {/* ========================================================================= */}
          <g className="opacity-95">
            {/* 5.1. PUMP OUTLET HOSE -> CHECK VALVE (14) */}
            {/* Outer rubber hose */}
            <path
              d="M 1375 620 L 1375 520 L 1260 520"
              fill="none"
              stroke="#0f172a"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Static oil core */}
            <path
              d="M 1375 620 L 1375 520 L 1260 520"
              fill="none"
              stroke="#b91c1c"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Dynamic flowing fluid stream */}
            {isMotorRunning && (
              <path
                d="M 1375 620 L 1375 520 L 1260 520"
                fill="none"
                stroke="#fca5a5"
                strokeWidth="3.5"
                strokeDasharray="16 10"
                className="oil-stream-red"
                strokeLinecap="round"
              />
            )}

            {/* 5.2. CHECK VALVE -> MASTER PRESSURE DISTRIBUTION BUS (P) */}
            <path
              d="M 1200 480 L 1200 280 L 140 280"
              fill="none"
              stroke="#0f172a"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 1200 480 L 1200 280 L 140 280"
              fill="none"
              stroke="#dc2626"
              strokeWidth="7"
              strokeLinecap="round"
            />
            {isMotorRunning && (
              <path
                d="M 1200 480 L 1200 280 L 140 280"
                fill="none"
                stroke="#fecaca"
                strokeWidth="4"
                strokeDasharray="18 12"
                className="oil-stream-red"
                strokeLinecap="round"
              />
            )}
            <text x="600" y="270" className="text-[11px] font-mono font-bold fill-rose-400">
              TUYẾN ỐNG DẦU CAO ÁP CHÍNH (P) ~ 150 BAR
            </text>

            {/* 5.3. VERTICAL PRESSURE DROPS TO 4 DIRECTIONAL VALVES (16) */}
            {[1, 2, 3, 4].map((branch) => {
              const vx = 129 + (branch - 1) * 250;
              return (
                <g key={`feed_hose_${branch}`}>
                  <path
                    d={`M ${vx} 280 L ${vx} 172`}
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="9"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M ${vx} 280 L ${vx} 172`}
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                  />
                  {isMotorRunning && (
                    <path
                      d={`M ${vx} 280 L ${vx} 172`}
                      fill="none"
                      stroke="#fca5a5"
                      strokeWidth="3"
                      strokeDasharray="14 8"
                      className="oil-stream-red"
                      strokeLinecap="round"
                    />
                  )}
                </g>
              );
            })}

            {/* 5.4. BRANCH WORK HOSES: VALVE 16 -> CB VALVE 17 -> CYLINDERS 18 */}
            {[1, 2, 3, 4].map((branch) => {
              const bx = 60 + (branch - 1) * 250;
              const branchActive = isBranchActive(branch);
              const branchValveState = getBranchValveState(branch);
              const branchCylinderAction: 'extend' | 'retract' | 'locked' =
                branchValveState === 'COIL_A' ? 'extend' : branchValveState === 'COIL_B' ? 'retract' : 'locked';

              return (
                <g key={`branch_hoses_${branch}`}>
                  {/* === LINE A (Supply to V1 of CB valve 17) === */}
                  <path
                    d={`M ${bx + 49} 172 L ${bx + 49} 240 L ${bx + 90} 240 L ${bx + 90} 340`}
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="9"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M ${bx + 49} 172 L ${bx + 49} 240 L ${bx + 90} 240 L ${bx + 90} 340`}
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  {isMotorRunning && branchActive && branchValveState === 'COIL_A' && (
                    <path
                      d={`M ${bx + 49} 172 L ${bx + 49} 240 L ${bx + 90} 240 L ${bx + 90} 340`}
                      fill="none"
                      stroke="#fecaca"
                      strokeWidth="3"
                      strokeDasharray="14 8"
                      className="oil-stream-red"
                      strokeLinecap="round"
                    />
                  )}

                  {/* === LINE B (Return/Supply from V2 of CB valve 17) === */}
                  <path
                    d={`M ${bx + 151} 172 L ${bx + 151} 240 L ${bx + 140} 240 L ${bx + 140} 340`}
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="9"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M ${bx + 151} 172 L ${bx + 151} 240 L ${bx + 140} 240 L ${bx + 140} 340`}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  {isMotorRunning && branchActive && (
                    <path
                      d={`M ${bx + 151} 172 L ${bx + 151} 240 L ${bx + 140} 240 L ${bx + 140} 340`}
                      fill="none"
                      stroke="#7dd3fc"
                      strokeWidth="3"
                      strokeDasharray="14 8"
                      className="oil-stream-blue"
                      strokeLinecap="round"
                    />
                  )}

                  {/* === LINE C1 (CB Valve 17 C1 down to Cylinder bottom port C1) === */}
                  <path
                    d={`M ${bx + 90} 450 L ${bx + 90} 550 L ${bx + 65} 550 L ${bx + 65} 648`}
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M ${bx + 90} 450 L ${bx + 90} 550 L ${bx + 65} 550 L ${bx + 65} 648`}
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  {isMotorRunning && branchActive && branchCylinderAction === 'extend' && (
                    <path
                      d={`M ${bx + 90} 450 L ${bx + 90} 550 L ${bx + 65} 550 L ${bx + 65} 648`}
                      fill="none"
                      stroke="#fecaca"
                      strokeWidth="3.5"
                      strokeDasharray="16 10"
                      className="oil-stream-red"
                      strokeLinecap="round"
                    />
                  )}

                  {/* === LINE C2 (CB Valve 17 C2 down to Cylinder rod port C2) === */}
                  <path
                    d={`M ${bx + 140} 450 L ${bx + 140} 580 L ${bx + 108} 580 L ${bx + 108} 832`}
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M ${bx + 140} 450 L ${bx + 140} 580 L ${bx + 108} 580 L ${bx + 108} 832`}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  {isMotorRunning && branchActive && (
                    <path
                      d={`M ${bx + 140} 450 L ${bx + 140} 580 L ${bx + 108} 580 L ${bx + 108} 832`}
                      fill="none"
                      stroke="#7dd3fc"
                      strokeWidth="3.5"
                      strokeDasharray="16 10"
                      className={branchCylinderAction === 'retract' ? 'oil-stream-blue' : 'oil-stream-reverse-blue'}
                      strokeLinecap="round"
                    />
                  )}
                </g>
              );
            })}

            {/* 5.5. MASTER RETURN HOSE (T) FROM VALVES THROUGH VALVE (6) TO TANK (1) */}
            <path
              d="M 191 172 L 191 210 L 1050 210 L 1120 235"
              fill="none"
              stroke="#0f172a"
              strokeWidth="11"
              strokeLinecap="round"
            />
            <path
              d="M 191 172 L 191 210 L 1050 210 L 1120 235"
              fill="none"
              stroke="#0284c7"
              strokeWidth="6.5"
              strokeLinecap="round"
            />
            {isMotorRunning && (
              <path
                d="M 191 172 L 191 210 L 1050 210 L 1120 235"
                fill="none"
                stroke="#7dd3fc"
                strokeWidth="3.5"
                strokeDasharray="16 10"
                className="oil-stream-blue"
                strokeLinecap="round"
              />
            )}

            {/* Return hose from Valve (6) down into Tank (1) */}
            <path
              d="M 1260 235 L 1360 235 L 1360 780"
              fill="none"
              stroke="#0f172a"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 1260 235 L 1360 235 L 1360 780"
              fill="none"
              stroke="#0284c7"
              strokeWidth="7"
              strokeLinecap="round"
            />
            {isMotorRunning && (
              <path
                d="M 1260 235 L 1360 235 L 1360 780"
                fill="none"
                stroke="#7dd3fc"
                strokeWidth="4"
                strokeDasharray="18 10"
                className="oil-stream-blue"
                strokeLinecap="round"
              />
            )}
            <text x="600" y="202" className="text-[11px] font-mono font-bold fill-cyan-400">
              TUYẾN ỐNG DẦU HỒI VỀ BỂ CHỨA (T)
            </text>
          </g>
        </svg>
      </div>

      {/* Interactive Detail Inspector Drawer for Clicked Real Hardware */}
      {selectedHardwareId && (
        <div className="absolute bottom-4 right-4 z-30 max-w-sm bg-slate-900/95 border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold font-tech text-amber-400 flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              THÔNG SỐ CHI TIẾT LINH KIỆN THỰC TẾ
            </span>
            <button
              onClick={() => setSelectedHardwareId(null)}
              className="text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
            >
              ✕
            </button>
          </div>
          <div className="text-xs text-slate-300 space-y-1.5 font-sans leading-relaxed">
            <p>
              <b>Mã thiết bị:</b> <span className="text-cyan-300 font-mono">{selectedHardwareId}</span>
            </p>
            <p>
              <b>Tiêu chuẩn chế tạo:</b> DIN 24340 / ISO 4401 / ISO 1219-1/2.
            </p>
            <p>
              <b>Vật liệu & Xử lý bề mặt:</b> Thép đúc hợp kim, mạ crom cứng chống ăn mòn, sơn tĩnh điện công nghiệp chống bám dầu nhớt.
            </p>
            <p className="text-[11px] text-amber-300/90 pt-1 border-t border-slate-800">
              Đang đồng bộ trực tiếp với tiến trình mô phỏng thủy lực 13 bước của sơ đồ nguyên lý.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
