import React, { useRef, useState } from 'react';
import {
  ComponentNode,
  PipeConnection,
  PipeColor,
} from '../../types/hydraulic';
import { COMPONENT_CATALOG } from '../../data/defaultCatalog';
import { HydraulicSymbolRenderer } from '../symbols/HydraulicSymbols';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  RotateCw,
  Copy,
} from 'lucide-react';

interface HydraulicCanvasProps {
  components: ComponentNode[];
  pipes: PipeConnection[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponentPosition: (id: string, x: number, y: number) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
  onRotateComponent: (id: string) => void;
  onConnectPorts: (
    sourceNodeId: string,
    sourcePort: string,
    targetNodeId: string,
    targetPort: string,
    color: PipeColor
  ) => void;
  onDeletePipe: (pipeId: string) => void;
  onTogglePipeColor: (pipeId: string) => void;
  highlightedComponentIds: string[];
  highlightedPipeIds: string[];
  isSimulating: boolean;
  simulationStepTitle?: string;
  simulationStepComment?: string;
}

export const HydraulicCanvas: React.FC<HydraulicCanvasProps> = ({
  components,
  pipes,
  selectedComponentId,
  onSelectComponent,
  onUpdateComponentPosition,
  onDeleteComponent,
  onDuplicateComponent,
  onRotateComponent,
  onConnectPorts,
  onDeletePipe,
  onTogglePipeColor,
  highlightedComponentIds,
  highlightedPipeIds,
  isSimulating,
  simulationStepTitle,
  simulationStepComment,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging a component
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Port linking interaction
  const [connectingSource, setConnectingSource] = useState<{ nodeId: string; portId: string } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredPort, setHoveredPort] = useState<{ nodeId: string; portId: string } | null>(null);

  // Helper to get absolute coordinates of a port on the canvas
  const getPortCoordinates = (nodeId: string, portId: string): { x: number; y: number; color: PipeColor } | null => {
    const node = components.find((c) => c.id === nodeId);
    if (!node) return null;
    const catalogItem = COMPONENT_CATALOG.find((item) => item.type === node.type);
    let port = catalogItem?.ports.find((p) => p.id === portId);

    // Intelligent port aliasing
    if (!port && catalogItem) {
      if (portId === 'SUCTION') port = catalogItem.ports.find((p) => p.id === 'OUT');
      else if (portId === 'RETURN') port = catalogItem.ports.find((p) => p.id === 'IN');
      else if (portId === 'PORT_IN') port = catalogItem.ports.find((p) => p.id === 'IN');
      else if (portId === 'PORT_OUT') port = catalogItem.ports.find((p) => p.id === 'OUT');
      else if (portId === 'C1') port = catalogItem.ports.find((p) => p.id === 'PORT_1');
      else if (portId === 'C2') port = catalogItem.ports.find((p) => p.id === 'PORT_2');
      else if (catalogItem.ports.length > 0) port = catalogItem.ports[0];
    }
    if (!port) return null;

    const width = catalogItem?.defaultWidth || 100;
    const height = catalogItem?.defaultHeight || 80;

    const x = node.position.x + 6 + port.relativeX * width;
    const y = node.position.y + 30 + port.relativeY * height;

    return { x, y, color: port.flowColor };
  };

  // Pan canvas
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('[data-interactive="true"]')
    ) {
      return;
    }

    if (e.button === 0) {
      // Left click on empty canvas deselects
      if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
        onSelectComponent(null);
        if (connectingSource) {
          setConnectingSource(null);
        }
      }

      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left - pan.x) / zoom;
    const canvasY = (e.clientY - rect.top - pan.y) / zoom;
    setMousePos({ x: canvasX, y: canvasY });

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (draggingNodeId) {
      const newX = Math.round((canvasX - dragOffset.x) / 10) * 10;
      const newY = Math.round((canvasY - dragOffset.y) / 10) * 10;
      onUpdateComponentPosition(draggingNodeId, Math.max(10, newX), Math.max(10, newY));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.92 : 1.08;
    setZoom((prev) => Math.min(2.5, Math.max(0.4, Number((prev * zoomFactor).toFixed(2)))));
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(2.5, Math.max(0.4, Number((prev + delta).toFixed(2)))));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 40, y: 30 });
  };

  // Component Drag Start
  const handleComponentMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    onSelectComponent(nodeId);

    const node = components.find((c) => c.id === nodeId);
    if (!node || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left - pan.x) / zoom;
    const canvasY = (e.clientY - rect.top - pan.y) / zoom;

    setDraggingNodeId(nodeId);
    setDragOffset({
      x: canvasX - node.position.x,
      y: canvasY - node.position.y,
    });
  };

  // Port Click Handler (Wire/Pipe creation)
  const handlePortClick = (nodeId: string, portId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!connectingSource) {
      setConnectingSource({ nodeId, portId });
    } else {
      if (connectingSource.nodeId !== nodeId || connectingSource.portId !== portId) {
        const srcPortInfo = getPortCoordinates(connectingSource.nodeId, connectingSource.portId);
        const color = srcPortInfo?.color || 'red';

        onConnectPorts(
          connectingSource.nodeId,
          connectingSource.portId,
          nodeId,
          portId,
          color
        );
      }
      setConnectingSource(null);
    }
  };

  // Calculate orthogonal routing for clean schematic pipes
  const calculateOrthogonalPath = (
    src: { x: number; y: number },
    tgt: { x: number; y: number },
    pipe?: PipeConnection
  ): string => {
    if (pipe?.waypoints && pipe.waypoints.length > 0) {
      const waypointsStr = pipe.waypoints.map(([wx, wy]) => `L ${wx} ${wy}`).join(' ');
      return `M ${src.x} ${src.y} ${waypointsStr} L ${tgt.x} ${tgt.y}`;
    }

    const dx = tgt.x - src.x;
    const dy = tgt.y - src.y;

    if (Math.abs(dx) < 8) {
      return `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`;
    }
    if (Math.abs(dy) < 8) {
      return `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`;
    }

    const midY = src.y + dy * 0.5;
    return `M ${src.x} ${src.y} L ${src.x} ${midY} L ${tgt.x} ${midY} L ${tgt.x} ${tgt.y}`;
  };

  const selectedNode = components.find((c) => c.id === selectedComponentId);
  const activeHighlightedNode = components.find((c) => highlightedComponentIds.includes(c.id));

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-slate-950 select-none ${
        isPanning ? 'cursor-grabbing' : connectingSource ? 'cursor-crosshair' : 'cursor-grab'
      }`}
      onMouseDown={handleMouseDownCanvas}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, #64748b 1px, transparent 1px)`,
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      {/* Floating Canvas Top Toolbar (Zoom & Pan Controls) */}
      <div className="absolute top-3 left-4 z-20 flex items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 p-1.5 rounded-lg shadow-xl backdrop-blur-md">
          <button
            onClick={() => handleZoom(0.1)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Phóng to (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono font-semibold text-slate-300 px-1 min-w-[42px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => handleZoom(-0.1)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Thu nhỏ (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-slate-700 mx-0.5" />
          <button
            onClick={resetView}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Vừa màn hình (100%)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Connecting indicator badge */}
        {connectingSource && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/90 text-slate-950 rounded-lg shadow-lg font-tech font-bold text-xs animate-pulse">
            <span>Đang nối từ cổng: {connectingSource.portId}. Click vào cổng đích để hoàn thành (Esc để hủy)</span>
            <button
              onClick={() => setConnectingSource(null)}
              className="px-1.5 py-0.5 bg-slate-950 text-white rounded text-[10px] hover:bg-slate-800"
            >
              Hủy
            </button>
          </div>
        )}
      </div>

      {/* Selected Component Quick Action Toolbar */}
      {selectedNode && !isSimulating && (
        <div
          className="absolute z-30 flex items-center gap-1 bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg shadow-2xl backdrop-blur"
          style={{
            left: `${selectedNode.position.x * zoom + pan.x}px`,
            top: `${(selectedNode.position.y - 38) * zoom + pan.y}px`,
          }}
        >
          <button
            onClick={() => onDuplicateComponent(selectedNode.id)}
            className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded"
            title="Nhân bản (Duplicate)"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onRotateComponent(selectedNode.id)}
            className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded"
            title="Xoay (Rotate 90°)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3 bg-slate-700 mx-0.5" />
          <button
            onClick={() => onDeleteComponent(selectedNode.id)}
            className="p-1 hover:bg-rose-950 text-rose-400 hover:text-rose-300 rounded"
            title="Xóa linh kiện (Delete)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Step Comment Callout during Simulation */}
      {activeHighlightedNode && simulationStepComment && (
        <div
          className="absolute z-30 max-w-sm bg-slate-900/95 border border-amber-400/80 p-3 rounded-xl shadow-2xl backdrop-blur-md"
          style={{
            left: `${(activeHighlightedNode.position.x + 160) * zoom + pan.x}px`,
            top: `${(activeHighlightedNode.position.y - 20) * zoom + pan.y}px`,
          }}
        >
          <div className="flex items-center gap-1.5 mb-1 text-xs font-bold font-tech text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            {simulationStepTitle || 'Bước mô phỏng'}
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            {simulationStepComment}
          </p>
        </div>
      )}

      {/* Main Scaled & Panned Canvas Workspace */}
      <div
        className="absolute origin-top-left transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          width: '2600px',
          height: '1800px',
        }}
      >
        {/* SVG PIPES LAYER */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f43f5e" floodOpacity="0.8" />
            </filter>
            <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Render Pipes */}
          {pipes.map((pipe) => {
            const srcCoord = getPortCoordinates(pipe.sourceComponentId, pipe.sourcePort);
            const tgtCoord = getPortCoordinates(pipe.targetComponentId, pipe.targetPort);
            if (!srcCoord || !tgtCoord) return null;

            const isPipeHighlighted = highlightedPipeIds.includes(pipe.id);
            const pathData = calculateOrthogonalPath(srcCoord, tgtCoord, pipe);

            // Flow line styles
            const isRed = pipe.color === 'red';
            const isWire = pipe.color === 'wire-red' || pipe.color === 'wire-blue' || pipe.color === 'wire-black';

            let strokeColor = '#38bdf8'; // Blue
            if (pipe.color === 'red') strokeColor = '#f43f5e';
            if (pipe.color === 'wire-red') strokeColor = '#fb923c';
            if (pipe.color === 'wire-blue') strokeColor = '#818cf8';
            if (pipe.color === 'wire-black') strokeColor = '#94a3b8';

            const isFlowing = pipe.flowActive || isPipeHighlighted;

            return (
              <g key={pipe.id} className="pointer-events-auto group cursor-pointer">
                {/* Thick invisible hover hit area */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="18"
                  onClick={() => onTogglePipeColor(pipe.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onDeletePipe(pipe.id);
                  }}
                />

                {/* Base Pipe Line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isPipeHighlighted ? '#fbbf24' : strokeColor}
                  strokeWidth={isWire ? 2 : isPipeHighlighted ? 3.5 : 2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-colors duration-200"
                  filter={isFlowing ? (isRed ? 'url(#glow-red)' : 'url(#glow-blue)') : undefined}
                />

                {/* Animated Dash for Fluid Flow */}
                {isFlowing && !isWire && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={2}
                    strokeDasharray="6,8"
                    className="flow-dash-animation pointer-events-none opacity-90"
                  />
                )}

                {/* Animated Pulse Dash for Electric Wires */}
                {isFlowing && isWire && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#fef08a"
                    strokeWidth={1.5}
                    strokeDasharray="4,6"
                    className="flow-dash-animation pointer-events-none opacity-90"
                  />
                )}
              </g>
            );
          })}

          {/* Rubber-band connecting line */}
          {connectingSource && (
            (() => {
              const srcCoord = getPortCoordinates(connectingSource.nodeId, connectingSource.portId);
              if (!srcCoord) return null;
              const pathData = calculateOrthogonalPath(srcCoord, mousePos);
              return (
                <path
                  d={pathData}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2.5"
                  strokeDasharray="5,5"
                  className="animate-pulse pointer-events-none"
                />
              );
            })()
          )}
        </svg>

        {/* COMPONENTS LAYER */}
        <div className="absolute inset-0 pointer-events-none">
          {components.map((node) => {
            const isSelected = selectedComponentId === node.id;
            const isHighlighted = highlightedComponentIds.includes(node.id);
            const catalogItem = COMPONENT_CATALOG.find((c) => c.type === node.type);
            const width = catalogItem?.defaultWidth || 100;
            const height = catalogItem?.defaultHeight || 80;

            return (
              <div
                key={node.id}
                data-interactive="true"
                className="absolute pointer-events-auto select-none cursor-grab active:cursor-grabbing"
                style={{
                  left: `${node.position.x}px`,
                  top: `${node.position.y}px`,
                  transform: node.rotation ? `rotate(${node.rotation}deg)` : undefined,
                  transformOrigin: `${width / 2 + 6}px ${height / 2 + 30}px`,
                }}
                onMouseDown={(e) => handleComponentMouseDown(e, node.id)}
              >
                <HydraulicSymbolRenderer
                  node={node}
                  isHighlighted={isHighlighted || isSelected}
                  onPortClick={handlePortClick}
                  hoveredPort={hoveredPort}
                  activeConnectingPort={connectingSource}
                  onPortHover={(nodeId, portId) => {
                    setHoveredPort(portId ? { nodeId, portId } : null);
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
