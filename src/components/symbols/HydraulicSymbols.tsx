import React from 'react';
import { ComponentNode, PortDefinition, ValveState } from '../../types/hydraulic';
import { COMPONENT_CATALOG } from '../../data/defaultCatalog';

interface SymbolProps {
  node: ComponentNode;
  isHighlighted?: boolean;
  onPortClick?: (nodeId: string, portId: string, e: React.MouseEvent) => void;
  hoveredPort?: { nodeId: string; portId: string } | null;
  activeConnectingPort?: { nodeId: string; portId: string } | null;
  onPortHover?: (nodeId: string, portId: string | null) => void;
}

export const HydraulicSymbolRenderer: React.FC<SymbolProps> = ({
  node,
  isHighlighted = false,
  onPortClick,
  hoveredPort,
  activeConnectingPort,
  onPortHover,
}) => {
  const catalogItem = COMPONENT_CATALOG.find((item) => item.type === node.type);
  const ports = catalogItem?.ports || [];
  const state: ValveState = node.properties?.state || 'NEUTRAL';
  const stroke = node.properties?.cylinderStroke ?? 35;
  const pressure = node.properties?.pressureBar ?? 120;

  const renderPorts = () => {
    return ports.map((port: PortDefinition) => {
      const isThisPortHovered =
        hoveredPort?.nodeId === node.id && hoveredPort?.portId === port.id;
      const isConnecting =
        activeConnectingPort?.nodeId === node.id &&
        activeConnectingPort?.portId === port.id;

      // Calculate absolute pixel position inside component viewBox
      const width = catalogItem?.defaultWidth || 100;
      const height = catalogItem?.defaultHeight || 80;
      const cx = port.relativeX * width;
      const cy = port.relativeY * height;
      const isRed = port.flowColor === 'red';

      return (
        <g
          key={port.id}
          className="cursor-pointer group select-none"
          onMouseEnter={() => onPortHover?.(node.id, port.id)}
          onMouseLeave={() => onPortHover?.(node.id, null)}
          onClick={(e) => {
            e.stopPropagation();
            onPortClick?.(node.id, port.id, e);
          }}
        >
          <title>{`${port.name} (${port.label || port.id}) - Vai trò: ${port.role}`}</title>
          {/* Hit target */}
          <circle
            cx={cx}
            cy={cy}
            r={14}
            className="fill-transparent"
          />
          {/* Outer ring */}
          <circle
            cx={cx}
            cy={cy}
            r={isThisPortHovered || isConnecting ? 8 : 6}
            className={`transition-all duration-200 stroke-2 ${
              isConnecting
                ? 'fill-amber-400 stroke-amber-200 animate-pulse'
                : isThisPortHovered
                ? 'fill-white stroke-slate-900 scale-125'
                : isRed
                ? 'fill-rose-500 stroke-rose-300'
                : 'fill-cyan-500 stroke-cyan-300'
            }`}
          />
          {/* Inner core */}
          <circle
            cx={cx}
            cy={cy}
            r={2.5}
            className="fill-slate-900"
          />
          {/* Port label badge */}
          <text
            x={cx}
            y={cy > height / 2 ? cy + 12 : cy - 8}
            textAnchor="middle"
            className="text-[9px] font-bold fill-slate-300 pointer-events-none drop-shadow"
          >
            {port.label || port.id}
          </text>
        </g>
      );
    });
  };

  const getHighlightClass = () => {
    if (isHighlighted) {
      return 'ring-2 ring-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.35)]';
    }
    return 'hover:ring-1 hover:ring-slate-400/40';
  };

  const width = catalogItem?.defaultWidth || 120;
  const height = catalogItem?.defaultHeight || 80;

  return (
    <div
      className={`relative select-none transition-all duration-150 bg-slate-900/95 border border-slate-700/80 rounded-lg p-1.5 shadow-lg backdrop-blur-sm ${getHighlightClass()}`}
      style={{ width: `${width + 12}px` }}
    >
      {/* Component Header with Ref No. and Label */}
      <div className="flex items-center justify-between gap-1 mb-1 px-0.5 h-5">
        <span className="text-[11px] font-bold tracking-tight text-slate-100 truncate font-tech flex items-center gap-1">
          {node.referenceNumber && (
            <span className="text-amber-400 font-mono text-[10px] font-bold">
              {node.referenceNumber}
            </span>
          )}
          <span>{node.label}</span>
        </span>
        {node.branchIndex && (
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
            #{node.branchIndex}
          </span>
        )}
      </div>

      {/* ISO 1219 SVG Symbol Graphic */}
      <div
        className="relative bg-slate-950 rounded border border-slate-800/80 overflow-visible"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible block"
        >
          {/* Symbol Body Rendering based on Component Type */}
          {node.type === 'TANK' && (
            <g>
              {/* 3D Green Industrial Hydraulic Reservoir Tank matching drawing */}
              {/* Tank Front & Top Perspective */}
              <polygon
                points="10,24 10,74 110,74 110,24"
                fill="#15803d"
                stroke="#22c55e"
                strokeWidth="2"
              />
              <polygon
                points="10,24 25,12 125,12 110,24"
                fill="#16a34a"
                stroke="#22c55e"
                strokeWidth="1.5"
              />
              <polygon
                points="110,24 125,12 125,62 110,74"
                fill="#166534"
                stroke="#22c55e"
                strokeWidth="1.5"
              />
              {/* Blue fluid interior window */}
              <rect
                x="20"
                y="34"
                width="80"
                height="32"
                fill="#0284c7"
                fillOpacity="0.5"
                stroke="#38bdf8"
                strokeWidth="1"
                rx="2"
              />
              {/* Fluid level indicator */}
              <path
                d="M 22 46 Q 42 42, 60 46 T 98 46"
                fill="none"
                stroke="#7dd3fc"
                strokeWidth="1.5"
              />
              {/* Suction strainer pipe (12) */}
              <line x1="32" y1="8" x2="32" y2="58" stroke="#f43f5e" strokeWidth="2.5" />
              <rect x="27" y="52" width="10" height="10" fill="#f43f5e" rx="2" />
              <text x="32" y="70" textAnchor="middle" className="text-[7px] font-mono fill-rose-200">
                (12)
              </text>
              {/* Return pipe with filter (11) */}
              <line x1="88" y1="6" x2="88" y2="56" stroke="#0284c7" strokeWidth="2.5" />
              <rect x="83" y="24" width="10" height="16" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" rx="2" />
              <text x="88" y="20" textAnchor="middle" className="text-[8px] font-bold font-mono fill-sky-200">
                (11)
              </text>
              <text x="60" y="54" textAnchor="middle" className="text-[9px] font-bold fill-white font-tech">
                (1) BỂ DẦU
              </text>
            </g>
          )}

          {node.type === 'MOTOR' && (
            <g>
              {/* Outer circle with M */}
              <circle
                cx={width / 2}
                cy={height / 2}
                r={24}
                fill="#1e293b"
                stroke="#cbd5e1"
                strokeWidth="2"
              />
              <text
                x={width / 2}
                y={height / 2 + 7}
                textAnchor="middle"
                className="text-xl font-bold fill-white font-tech"
              >
                M
              </text>
              <text x={width / 2 + 20} y={height / 2 - 14} className="text-[9px] font-mono font-bold fill-amber-300">
                (2)
              </text>
              {/* Shaft to pump */}
              <line x1={width / 2 + 24} y1={height / 2} x2={width} y2={height / 2} stroke="#94a3b8" strokeWidth="3" />
            </g>
          )}

          {node.type === 'GEAR_PUMP' && (
            <g>
              {/* Main pump circle with two intermeshing gear wheels */}
              <circle
                cx={width / 2}
                cy={height / 2}
                r={24}
                fill="#1e293b"
                stroke="#38bdf8"
                strokeWidth="2"
              />
              {/* Left Gear */}
              <circle cx={width / 2 - 7} cy={height / 2} r="8" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 2" />
              <circle cx={width / 2 - 7} cy={height / 2} r="3" fill="#f43f5e" />
              {/* Right Gear */}
              <circle cx={width / 2 + 7} cy={height / 2} r="8" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 2" />
              <circle cx={width / 2 + 7} cy={height / 2} r="3" fill="#f43f5e" />
              <text x={width / 2 + 20} y={height / 2 - 14} className="text-[9px] font-mono font-bold fill-amber-300">
                (13)
              </text>
            </g>
          )}

          {node.type === 'CHECK_VALVE' && (
            <g>
              {/* ISO 1219 Check Valve / One way check (14) */}
              <line x1={width / 2} y1="4" x2={width / 2} y2={height - 4} stroke="#f43f5e" strokeWidth="2.5" />
              <circle cx={width / 2} cy={height / 2} r="11" fill="#1e293b" stroke="#f43f5e" strokeWidth="2" />
              {/* Flow direction triangle pointing UP */}
              <polygon
                points={`${width / 2},${height / 2 - 7} ${width / 2 - 6},${height / 2 + 5} ${width / 2 + 6},${height / 2 + 5}`}
                fill="#f43f5e"
              />
              <text x={width / 2 - 18} y={height / 2 + 4} className="text-[9px] font-mono font-bold fill-amber-300">
                (14)
              </text>
            </g>
          )}

          {node.type === 'SOLENOID_VALVE_2_2' && (
            <g>
              {/* 2-position 2-port Solenoid Valve (5) */}
              <rect x="22" y="16" width="30" height="36" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5" />
              <rect x="52" y="16" width="30" height="36" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5" />
              {/* Left block (blocked) */}
              <line x1="37" y1="22" x2="37" y2="28" stroke="#f87171" strokeWidth="1.5" />
              <line x1="31" y1="28" x2="43" y2="28" stroke="#f87171" strokeWidth="1.5" />
              <line x1="37" y1="46" x2="37" y2="40" stroke="#f87171" strokeWidth="1.5" />
              <line x1="31" y1="40" x2="43" y2="40" stroke="#f87171" strokeWidth="1.5" />
              {/* Right block (arrow P -> T) */}
              <line x1="67" y1="46" x2="67" y2="22" stroke="#f43f5e" strokeWidth="2" />
              <polygon points="67,20 63,26 71,26" fill="#f43f5e" />
              {/* Solenoid actuator coil at top */}
              <rect x="30" y="4" width="22" height="12" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" rx="2" />
              <text x="41" y="13" textAnchor="middle" className="text-[8px] font-bold fill-white">24V</text>
              {/* Spring at bottom */}
              <path d="M 37 52 L 40 56 L 44 50 L 48 56 L 51 52" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
              <text x="12" y="36" className="text-[10px] font-mono font-bold fill-amber-300">
                (5)
              </text>
            </g>
          )}

          {node.type === 'RELIEF_VALVE' && (
            <g>
              {/* Pressure Relief Valve (4) */}
              <rect x="24" y="14" width="46" height="46" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5" />
              {/* Internal arrow */}
              <line x1="47" y1="52" x2="47" y2="22" stroke="#f43f5e" strokeWidth="2" />
              <polygon points="47,20 43,26 51,26" fill="#f43f5e" />
              {/* Adjustable spring below */}
              <path d="M 47 60 L 41 64 L 53 68 L 41 72 L 47 76" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="35" y1="74" x2="59" y2="62" stroke="#f59e0b" strokeWidth="1.5" />
              <polygon points="59,62 53,64 57,68" fill="#f59e0b" />
              <text x="10" y="38" className="text-[10px] font-mono font-bold fill-amber-300">
                (4)
              </text>
            </g>
          )}

          {node.type === 'FLOW_CONTROL_VALVE' && (
            <g>
              {/* Pressure compensated flow control (6) */}
              <rect x="18" y="14" width="64" height="52" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5" />
              {/* Throttle constriction symbol (double arcs) */}
              <path d="M 32 26 Q 44 38 32 50" fill="none" stroke="#f43f5e" strokeWidth="2" />
              <path d="M 52 26 Q 40 38 52 50" fill="none" stroke="#f43f5e" strokeWidth="2" />
              {/* Compensator arrow */}
              <line x1="62" y1="20" x2="62" y2="58" stroke="#38bdf8" strokeWidth="1.5" />
              <polygon points="62,20 58,26 66,26" fill="#38bdf8" />
              <text x="8" y="42" className="text-[10px] font-mono font-bold fill-amber-300">
                (6)
              </text>
            </g>
          )}

          {node.type === 'DIRECTIONAL_VALVE_4_3' && (
            <g>
              {/* Directional Control Valve (16) matching exact drawing */}
              {/* Three valve blocks: Left (Cuộn A), Center (Neutral), Right (Cuộn B) */}
              {/* Chamber 1: Cuộn A active (Parallel arrows: P->A, B->T) */}
              <rect
                x="30"
                y="18"
                width="32"
                height="44"
                fill={state === 'COIL_A' ? '#1e3a8a' : '#0f172a'}
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />
              <line x1="40" y1="56" x2="40" y2="24" stroke="#f43f5e" strokeWidth="2" />
              <polygon points="40,22 36,28 44,28" fill="#f43f5e" />
              <line x1="52" y1="24" x2="52" y2="56" stroke="#38bdf8" strokeWidth="2" />
              <polygon points="52,58 48,52 56,52" fill="#38bdf8" />

              {/* Chamber 2: Center Neutral (Blocked ports) */}
              <rect
                x="62"
                y="18"
                width="34"
                height="44"
                fill={state === 'NEUTRAL' ? '#1e293b' : '#0f172a'}
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />
              {/* Blocked T-bars */}
              <line x1="72" y1="56" x2="72" y2="48" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="68" y1="48" x2="76" y2="48" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="86" y1="56" x2="86" y2="48" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="82" y1="48" x2="90" y2="48" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="72" y1="24" x2="72" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="68" y1="32" x2="76" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="86" y1="24" x2="86" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="82" y1="32" x2="90" y2="32" stroke="#94a3b8" strokeWidth="1.5" />

              {/* Chamber 3: Cuộn B active (Crossed arrows: P->B, A->T) */}
              <rect
                x="96"
                y="18"
                width="32"
                height="44"
                fill={state === 'COIL_B' ? '#1e3a8a' : '#0f172a'}
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />
              <line x1="104" y1="56" x2="119" y2="24" stroke="#f43f5e" strokeWidth="2" />
              <polygon points="120,22 114,26 120,28" fill="#f43f5e" />
              <line x1="104" y1="24" x2="119" y2="56" stroke="#38bdf8" strokeWidth="2" />
              <polygon points="120,58 120,52 114,54" fill="#38bdf8" />

              {/* Solenoid Coil A (Left) with wire windings symbol */}
              <rect
                x="6"
                y="26"
                width="24"
                height="28"
                fill={state === 'COIL_A' ? '#dc2626' : '#1e293b'}
                stroke="#f87171"
                strokeWidth="1.5"
                rx="2"
              />
              {/* Coil winding wave */}
              <path d="M 8 40 Q 12 30, 16 40 T 24 40" fill="none" stroke="#fca5a5" strokeWidth="1.5" />
              <text x="18" y="22" textAnchor="middle" className="text-[9px] font-bold fill-rose-300 font-tech">
                Cuộn A
              </text>

              {/* Solenoid Coil B (Right) with wire windings symbol */}
              <rect
                x="128"
                y="26"
                width="24"
                height="28"
                fill={state === 'COIL_B' ? '#dc2626' : '#1e293b'}
                stroke="#f87171"
                strokeWidth="1.5"
                rx="2"
              />
              {/* Coil winding wave */}
              <path d="M 130 40 Q 134 30, 138 40 T 146 40" fill="none" stroke="#fca5a5" strokeWidth="1.5" />
              <text x="140" y="22" textAnchor="middle" className="text-[9px] font-bold fill-rose-300 font-tech">
                Cuộn B
              </text>

              {/* Port annotations */}
              <text x="45" y="14" className="text-[9px] font-bold fill-rose-400">A</text>
              <text x="112" y="14" className="text-[9px] font-bold fill-sky-400">B</text>
              <text x="61" y="74" className="text-[9px] font-bold fill-rose-400">P</text>
              <text x="96" y="74" className="text-[9px] font-bold fill-sky-400">T</text>
              <text x={width - 8} y={height / 2 - 10} className="text-[9px] font-mono font-bold fill-amber-300">
                (16)
              </text>
            </g>
          )}

          {node.type === 'COUNTERBALANCE_VALVE_DUAL' && (
            <g>
              {/* Dual Counterbalance Valve (17) in Blue Dashed Box matching drawing */}
              <rect
                x="10"
                y="10"
                width={width - 20}
                height={height - 20}
                fill="#0f172a"
                fillOpacity="0.85"
                stroke="#0284c7"
                strokeWidth="1.5"
                strokeDasharray="4 2"
                rx="4"
              />
              <text x={width - 20} y="22" textAnchor="end" className="text-[10px] font-bold font-mono fill-amber-300">
                (17)
              </text>

              {/* Left Side: V1 ↔ C1 (Extension side - Red) */}
              <text x="44" y="24" textAnchor="middle" className="text-[10px] font-bold fill-rose-300 font-tech">V1</text>
              <text x="44" y={height - 14} textAnchor="middle" className="text-[10px] font-bold fill-rose-300 font-tech">C1</text>
              {/* V1-C1 Main Line */}
              <line x1="44" y1="28" x2="44" y2={height - 24} stroke="#f43f5e" strokeWidth="2" />
              {/* Left Check Valve (Free flow downward V1 -> C1) */}
              <circle cx="28" cy={height / 2} r="5" fill="#1e293b" stroke="#f43f5e" strokeWidth="1" />
              <polygon points="28,68 25,61 31,61" fill="#f43f5e" />
              {/* Left Pilot Relief Valve (Upwards C1 -> V1 with spring) */}
              <rect x="36" y={height / 2 - 14} width="16" height="28" fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
              <line x1="44" y1={height / 2 + 10} x2="44" y2={height / 2 - 10} stroke="#f43f5e" strokeWidth="1.5" />
              <polygon points="44,${height/2 - 12} 41,${height/2 - 6} 47,${height/2 - 6}" fill="#f43f5e" />

              {/* Right Side: V2 ↔ C2 (Retraction side - Blue) */}
              <text x="116" y="24" textAnchor="middle" className="text-[10px] font-bold fill-sky-300 font-tech">V2</text>
              <text x="116" y={height - 14} textAnchor="middle" className="text-[10px] font-bold fill-sky-300 font-tech">C2</text>
              {/* V2-C2 Main Line */}
              <line x1="116" y1="28" x2="116" y2={height - 24} stroke="#38bdf8" strokeWidth="2" />
              {/* Right Check Valve (Free flow upward C2 -> V2) */}
              <circle cx="132" cy={height / 2} r="5" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
              <polygon points="132,56 129,63 135,63" fill="#38bdf8" />
              {/* Right Pilot Relief Valve (Downwards V2 -> C2 with spring) */}
              <rect x="108" y={height / 2 - 14} width="16" height="28" fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
              <line x1="116" y1={height / 2 - 10} x2="116" y2={height / 2 + 10} stroke="#38bdf8" strokeWidth="1.5" />
              <polygon points="116,${height/2 + 12} 113,${height/2 + 6} 119,${height/2 + 6}" fill="#38bdf8" />

              {/* Crossed Pilot Lines with Red Arrows */}
              {/* Pilot from V1/C1 across to Right Valve */}
              <line x1="44" y1={height / 2 - 4} x2="108" y2={height / 2 - 12} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
              <polygon points="108,${height/2 - 12} 101,${height/2 - 9} 103,${height/2 - 15}" fill="#ef4444" />
              {/* Pilot from V2/C2 across to Left Valve */}
              <line x1="116" y1={height / 2 + 4} x2="52" y2={height / 2 + 12} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
              <polygon points="52,${height/2 + 12} 59,${height/2 + 9} 57,${height/2 + 15}" fill="#38bdf8" />
            </g>
          )}

          {node.type === 'HYDRAULIC_CYLINDER' && (
            <g>
              {/* Hydraulic Cylinder Jack (18) Vertical Orientation matching drawing */}
              {/* Cylinder Outer Barrel */}
              <rect
                x="24"
                y="18"
                width="42"
                height="86"
                fill="#0f172a"
                stroke="#64748b"
                strokeWidth="2"
                rx="2"
              />
              {/* Top Oil Chamber (Red - extending) */}
              <rect
                x="26"
                y="20"
                width="38"
                height={Math.max(6, 12 + (stroke / 100) * 44)}
                fill="#f43f5e"
                fillOpacity="0.8"
              />
              {/* Piston Head */}
              <rect
                x="26"
                y={20 + (stroke / 100) * 44}
                width="38"
                height="10"
                fill="#e2e8f0"
                stroke="#475569"
                strokeWidth="1"
              />
              {/* Bottom Oil Chamber (Blue - retracting) */}
              <rect
                x="26"
                y={30 + (stroke / 100) * 44}
                width="38"
                height={Math.max(6, 72 - (stroke / 100) * 44)}
                fill="#0284c7"
                fillOpacity="0.8"
              />
              {/* Chrome Piston Rod extending downward */}
              <rect
                x="38"
                y={30 + (stroke / 100) * 44}
                width="14"
                height={50 + (stroke / 100) * 20}
                fill="#cbd5e1"
                stroke="#475569"
                strokeWidth="1.5"
              />
              {/* Heavy Duty Base Foot Jack Pad */}
              <rect
                x="15"
                y={80 + (stroke / 100) * 20}
                width="60"
                height="10"
                fill="#0f172a"
                stroke="#f59e0b"
                strokeWidth="2"
                rx="1"
              />
              <text x={width / 2} y={height - 20} textAnchor="middle" className="text-[8px] font-mono font-bold fill-slate-300">
                {Math.round(stroke)}%
              </text>
              <text x="75" y="30" className="text-[9px] font-mono font-bold fill-amber-300">
                (18)
              </text>
            </g>
          )}

          {node.type === 'CONTROL_CABINET_24V' && (
            <g>
              {/* TỦ ĐIỀU KHIỂN (Olive green box at top right) */}
              <rect
                x="6"
                y="6"
                width={width - 12}
                height={height - 12}
                fill="#65a30d"
                stroke="#84cc16"
                strokeWidth="2"
                rx="3"
              />
              <text
                x={width / 2}
                y={height / 2 - 4}
                textAnchor="middle"
                className="text-xs font-bold fill-slate-950 font-tech tracking-wider"
              >
                TỦ ĐIỀU
              </text>
              <text
                x={width / 2}
                y={height / 2 + 12}
                textAnchor="middle"
                className="text-xs font-bold fill-slate-950 font-tech tracking-wider"
              >
                KHIỂN
              </text>
              <text x="12" y={height - 12} className="text-[9px] font-bold font-mono fill-rose-950">
                + 24V DC
              </text>
            </g>
          )}

          {node.type === 'POWER_PANEL_220V' && (
            <g>
              {/* BẢNG ĐIỀU KHIỂN & 220V-50Hz Power Conversion */}
              <rect
                x="8"
                y="10"
                width={width - 16}
                height={height - 20}
                fill="#0f172a"
                stroke="#ef4444"
                strokeWidth="1.5"
                rx="2"
              />
              <text x={width / 2} y="26" textAnchor="middle" className="text-[9px] font-bold fill-white font-tech">
                BẢNG ĐIỀU KHIỂN
              </text>
              <text x="18" y="44" className="text-[8px] font-mono fill-rose-300 font-bold">V+</text>
              <text x="18" y="58" className="text-[8px] font-mono fill-slate-400 font-bold">V-</text>
              <text x={width - 32} y="44" className="text-[8px] font-mono fill-amber-300 font-bold">24V</text>
              <text x={width - 32} y="58" className="text-[8px] font-mono fill-cyan-300 font-bold">0V</text>
              <text x={width / 2} y={height - 16} textAnchor="middle" className="text-[8px] font-mono fill-slate-400">
                ~ 220V-50Hz
              </text>
            </g>
          )}

          {/* Interactive Connection Ports */}
          {renderPorts()}
        </svg>
      </div>

      {/* Sublabel / Technical Info */}
      {node.subLabel && (
        <div className="mt-1 px-1 flex items-center justify-between text-[10px] text-slate-400">
          <span className="truncate">{node.subLabel}</span>
          {node.branchIndex && (
            <span className="text-amber-400 font-bold ml-1">Nhánh #{node.branchIndex}</span>
          )}
        </div>
      )}
    </div>
  );
};
