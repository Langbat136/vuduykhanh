import React, { useState, useEffect, useMemo } from 'react';
import {
  ComponentNode,
  ComponentType,
  PipeColor,
  PipeConnection,
  ProjectData,
  ValveState,
} from './types/hydraulic';
import {
  DEFAULT_DEMO_PROJECT,
  SINGLE_BRANCH_PROJECT,
  DEFAULT_SIMULATION_STEPS,
} from './data/demoProject';
import { COMPONENT_CATALOG } from './data/defaultCatalog';
import { validateHydraulicDiagram } from './utils/validationEngine';

import { HydraulicHeader } from './components/header/HydraulicHeader';
import { ComponentPalette } from './components/palette/ComponentPalette';
import { HydraulicCanvas } from './components/canvas/HydraulicCanvas';
import { SimulationControls } from './components/simulation/SimulationControls';
import { ValidationPanel } from './components/validation/ValidationPanel';
import { ISOReferenceModal } from './components/modals/ISOReferenceModal';
import { ExportModal } from './components/modals/ExportModal';
import { OriginalBlueprintModal } from './components/modals/OriginalBlueprintModal';
import { RealisticHardwareView } from './components/realistic/RealisticHardwareView';
import {
  Columns2,
  Layers,
  Sparkles,
} from 'lucide-react';

const STORAGE_KEY = 'hydraulic_educational_project_v4_25steps_iso1219';

export type ViewMode = 'SPLIT' | 'SCHEMATIC_ONLY' | 'REALISTIC_ONLY';

export default function App() {
  // View mode for splitting canvas into 2 vertical frames
  const [viewMode, setViewMode] = useState<ViewMode>('SPLIT');

  // Load initial project from localStorage or default demo
  const [project, setProject] = useState<ProjectData>(() => {
    try {
      // Clean up any legacy cache versions
      localStorage.removeItem('hydraulic_educational_project_v1');
      localStorage.removeItem('hydraulic_educational_project_v2');
      localStorage.removeItem('hydraulic_educational_project_v3');

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.components &&
          Array.isArray(parsed.components) &&
          parsed.simulationSteps &&
          Array.isArray(parsed.simulationSteps) &&
          parsed.simulationSteps.length >= 25
        ) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load saved project', e);
    }
    return DEFAULT_DEMO_PROJECT;
  });

  // Selected item on canvas
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [manualValveState, setManualValveState] = useState<ValveState>('COIL_A');
  const [activeBranch, setActiveBranch] = useState<number | 'ALL'>('ALL');

  // Modals
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [isISOOpen, setIsISOOpen] = useState(false);
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [hasSavedChanges, setHasSavedChanges] = useState(true);

  // Real-time diagram validation
  const validation = useMemo(() => {
    return validateHydraulicDiagram(project.components, project.pipes);
  }, [project.components, project.pipes]);

  // Current simulation step
  const activeStep = project.simulationSteps[currentStepIndex] || project.simulationSteps[0];

  // Dynamic highlighted components and pipes
  const highlightedComponentIds = useMemo(() => {
    if (isSimulating && activeStep) {
      return activeStep.highlightComponentIds || [];
    }
    return selectedComponentId ? [selectedComponentId] : [];
  }, [isSimulating, activeStep, selectedComponentId]);

  const highlightedPipeIds = useMemo(() => {
    if (isSimulating && activeStep) {
      return activeStep.highlightPipeIds || [];
    }
    return [];
  }, [isSimulating, activeStep]);

  // Simulation step timer
  useEffect(() => {
    if (!isSimulating || project.simulationSteps.length === 0) return;

    const currentDuration = (activeStep?.durationMs || 2500) / simulationSpeed;

    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= project.simulationSteps.length - 1) {
          return 0; // Loop around
        }
        return prev + 1;
      });
    }, currentDuration);

    return () => clearTimeout(timer);
  }, [isSimulating, currentStepIndex, simulationSpeed, project.simulationSteps, activeStep]);

  // Synchronize component dynamic states (valve state, cylinder stroke, pressure gauge) with active step
  useEffect(() => {
    if (!isSimulating || !activeStep?.actuatorState) return;

    const { valveState, action, pressureGauge } = activeStep.actuatorState;

    setProject((prev) => {
      const updatedComponents = prev.components.map((comp) => {
        // Update 4/3 valves
        if (comp.type === 'DIRECTIONAL_VALVE_4_3') {
          const isTargetBranch = !activeStep.actuatorState?.branchIndex || activeStep.actuatorState.branchIndex === 'ALL' || activeStep.actuatorState.branchIndex === comp.branchIndex;
          return {
            ...comp,
            properties: {
              ...comp.properties,
              state: isTargetBranch ? (valveState || 'NEUTRAL') : 'NEUTRAL',
            },
          };
        }

        // Update Cylinders
        if (comp.type === 'HYDRAULIC_CYLINDER') {
          let currentStroke = comp.properties?.cylinderStroke ?? 45;
          if (activeStep.actuatorState?.cylinderStrokes && comp.branchIndex && activeStep.actuatorState.cylinderStrokes[comp.branchIndex - 1] !== undefined) {
            currentStroke = activeStep.actuatorState.cylinderStrokes[comp.branchIndex - 1];
          } else {
            const isTargetBranch = !activeStep.actuatorState?.branchIndex || activeStep.actuatorState.branchIndex === 'ALL' || activeStep.actuatorState.branchIndex === comp.branchIndex;
            if (isTargetBranch) {
              if (action === 'extend') {
                currentStroke = Math.min(85, currentStroke + 15);
              } else if (action === 'retract') {
                currentStroke = Math.max(10, currentStroke - 15);
              }
            }
          }
          return {
            ...comp,
            properties: {
              ...comp.properties,
              cylinderStroke: currentStroke,
            },
          };
        }

        // Update Pressure Gauge
        if (comp.type === 'PRESSURE_GAUGE' && pressureGauge !== undefined) {
          return {
            ...comp,
            properties: {
              ...comp.properties,
              pressureBar: pressureGauge,
            },
          };
        }

        return comp;
      });

      // Update pipe flow animations
      const updatedPipes = prev.pipes.map((pipe) => {
        const isStepPipe = (activeStep.highlightPipeIds || []).includes(pipe.id);
        return {
          ...pipe,
          flowActive: isStepPipe,
        };
      });

      return {
        ...prev,
        components: updatedComponents,
        pipes: updatedPipes,
      };
    });
  }, [isSimulating, currentStepIndex, activeStep]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
        setHasSavedChanges(true);
      } catch (e) {
        console.error('Auto-save error', e);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [project]);

  // Manual save
  const handleSaveProject = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
      setHasSavedChanges(true);
    } catch (e) {
      alert('Không thể lưu vào bộ nhớ trình duyệt.');
    }
  };

  // Add component from palette
  const handleAddComponent = (type: ComponentType) => {
    const catalogItem = COMPONENT_CATALOG.find((c) => c.type === type);
    if (!catalogItem) return;

    const count = project.components.filter((c) => c.type === type).length + 1;
    const newId = `${type.toLowerCase()}_${Date.now()}`;

    const offsetX = 300 + (count * 30) % 300;
    const offsetY = 150 + (count * 30) % 300;

    const newNode: ComponentNode = {
      id: newId,
      type,
      label: `${catalogItem.name} ${count > 1 ? `#${count}` : ''}`.trim(),
      subLabel: catalogItem.description.slice(0, 30) + '...',
      referenceNumber: catalogItem.referenceNumber,
      position: { x: offsetX, y: offsetY },
      properties: {
        state: 'NEUTRAL',
        cylinderStroke: 30,
        pressureBar: 120,
      },
    };

    setProject((prev) => ({
      ...prev,
      components: [...prev.components, newNode],
    }));
    setSelectedComponentId(newId);
    setHasSavedChanges(false);
  };

  // Update component position
  const handleUpdateComponentPosition = (id: string, x: number, y: number) => {
    setProject((prev) => ({
      ...prev,
      components: prev.components.map((c) => (c.id === id ? { ...c, position: { x, y } } : c)),
    }));
    setHasSavedChanges(false);
  };

  // Delete component and all connected pipes
  const handleDeleteComponent = (id: string) => {
    setProject((prev) => ({
      ...prev,
      components: prev.components.filter((c) => c.id !== id),
      pipes: prev.pipes.filter((p) => p.sourceComponentId !== id && p.targetComponentId !== id),
    }));
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
    setHasSavedChanges(false);
  };

  // Duplicate component
  const handleDuplicateComponent = (id: string) => {
    const target = project.components.find((c) => c.id === id);
    if (!target) return;

    const newId = `${target.type.toLowerCase()}_${Date.now()}`;
    const cloned: ComponentNode = {
      ...target,
      id: newId,
      label: `${target.label} (Bản sao)`,
      position: { x: target.position.x + 40, y: target.position.y + 40 },
    };

    setProject((prev) => ({
      ...prev,
      components: [...prev.components, cloned],
    }));
    setSelectedComponentId(newId);
    setHasSavedChanges(false);
  };

  // Rotate component
  const handleRotateComponent = (id: string) => {
    setProject((prev) => ({
      ...prev,
      components: prev.components.map((c) => {
        if (c.id !== id) return c;
        const currentRot = c.rotation || 0;
        return { ...c, rotation: (currentRot + 90) % 360 };
      }),
    }));
    setHasSavedChanges(false);
  };

  // Connect two ports
  const handleConnectPorts = (
    sourceNodeId: string,
    sourcePort: string,
    targetNodeId: string,
    targetPort: string,
    color: PipeColor
  ) => {
    if (sourceNodeId === targetNodeId && sourcePort === targetPort) return;

    const existing = project.pipes.find(
      (p) =>
        (p.sourceComponentId === sourceNodeId &&
          p.sourcePort === sourcePort &&
          p.targetComponentId === targetNodeId &&
          p.targetPort === targetPort) ||
        (p.sourceComponentId === targetNodeId &&
          p.sourcePort === targetPort &&
          p.targetComponentId === sourceNodeId &&
          p.targetPort === sourcePort)
    );
    if (existing) return;

    const newPipe: PipeConnection = {
      id: `pipe_${Date.now()}`,
      sourceComponentId: sourceNodeId,
      sourcePort: sourcePort,
      targetComponentId: targetNodeId,
      targetPort: targetPort,
      color,
      flowActive: isSimulating,
      flowDirection: 1,
      pipeType: color === 'red' ? 'PRESSURE' : 'RETURN',
    };

    setProject((prev) => ({
      ...prev,
      pipes: [...prev.pipes, newPipe],
    }));
    setHasSavedChanges(false);
  };

  // Toggle pipe color
  const handleTogglePipeColor = (pipeId: string) => {
    setProject((prev) => ({
      ...prev,
      pipes: prev.pipes.map((p) =>
        p.id === pipeId ? { ...p, color: p.color === 'red' ? 'blue' : 'red' } : p
      ),
    }));
    setHasSavedChanges(false);
  };

  // Delete pipe
  const handleDeletePipe = (pipeId: string) => {
    setProject((prev) => ({
      ...prev,
      pipes: prev.pipes.filter((p) => p.id !== pipeId),
    }));
    setHasSavedChanges(false);
  };

  // Load predefined template
  const handleLoadTemplate = (templateType: '4_BRANCH' | '1_BRANCH' | 'BLANK') => {
    setIsSimulating(false);
    setCurrentStepIndex(0);
    setSelectedComponentId(null);

    if (templateType === '4_BRANCH') {
      setProject(DEFAULT_DEMO_PROJECT);
    } else if (templateType === '1_BRANCH') {
      setProject(SINGLE_BRANCH_PROJECT);
    } else {
      setProject({
        projectId: `project_${Date.now()}`,
        name: 'Sơ đồ thực hành tự do',
        description: 'Bàn thực hành trống, người học tự kéo linh kiện và nối ống theo yêu cầu.',
        components: [],
        pipes: [],
        simulationSteps: DEFAULT_SIMULATION_STEPS,
      });
    }
    setHasSavedChanges(false);
  };

  // Manual actuator override
  const handleSetManualValveState = (state: ValveState) => {
    setManualValveState(state);

    setProject((prev) => {
      const updatedComponents = prev.components.map((comp) => {
        const isTarget = activeBranch === 'ALL' || comp.branchIndex === activeBranch || !comp.branchIndex;
        if (comp.type === 'DIRECTIONAL_VALVE_4_3' && isTarget) {
          return {
            ...comp,
            properties: {
              ...comp.properties,
              state,
            },
          };
        }

        if (comp.type === 'HYDRAULIC_CYLINDER' && isTarget) {
          let currentStroke = comp.properties?.cylinderStroke ?? 45;
          if (state === 'COIL_A') {
            currentStroke = Math.min(95, currentStroke + 30);
          } else if (state === 'COIL_B') {
            currentStroke = Math.max(5, currentStroke - 30);
          }
          return {
            ...comp,
            properties: {
              ...comp.properties,
              cylinderStroke: currentStroke,
            },
          };
        }

        return comp;
      });

      return { ...prev, components: updatedComponents };
    });
  };

  // Simulation controls handlers
  const handlePlay = () => {
    if (!validation.isValid) {
      setIsValidationOpen(true);
      return;
    }
    setIsSimulating(true);
  };

  const handlePause = () => {
    setIsSimulating(false);
  };

  const handleReset = () => {
    setIsSimulating(false);
    setCurrentStepIndex(0);
  };

  const handlePrevStep = () => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextStep = () => {
    setCurrentStepIndex((prev) => Math.min(project.simulationSteps.length - 1, prev + 1));
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Top Header */}
      <HydraulicHeader
        projectName={project.name}
        onChangeProjectName={(name) => {
          setProject((prev) => ({ ...prev, name }));
          setHasSavedChanges(false);
        }}
        validation={validation}
        onOpenValidation={() => setIsValidationOpen(true)}
        onOpenISO={() => setIsISOOpen(true)}
        onOpenBlueprint={() => setIsBlueprintModalOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onResetDiagram={() => handleLoadTemplate('BLANK')}
        hasSavedChanges={hasSavedChanges}
        onSaveProject={handleSaveProject}
      />

      {/* Main Workspace (Palette Sidebar + Split Dual-Frame Canvas) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Component Palette (Left Sidebar) */}
        <ComponentPalette
          onAddComponent={handleAddComponent}
          onLoadTemplate={handleLoadTemplate}
          onOpenISOReference={() => setIsISOOpen(true)}
        />

        {/* Center Workspace with Dual Vertical Split Frames */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Dual Frame Control Bar */}
          <div className="h-10 bg-slate-900/95 border-b border-slate-800 px-4 flex items-center justify-between text-xs select-none shrink-0">
            {/* View Mode Switcher (2 vertical split frames) */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewMode('SPLIT')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-tech font-bold transition-all ${
                  viewMode === 'SPLIT'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="Hiển thị song song 2 khung theo chiều dọc"
              >
                <Columns2 className="w-3.5 h-3.5" />
                Song song 2 khung
              </button>
              <button
                onClick={() => setViewMode('SCHEMATIC_ONLY')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-tech font-bold transition-all ${
                  viewMode === 'SCHEMATIC_ONLY'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="Chỉ hiển thị sơ đồ ký hiệu kỹ thuật ISO 1219"
              >
                <Layers className="w-3.5 h-3.5" />
                Khung 1: Sơ đồ ISO
              </button>
              <button
                onClick={() => setViewMode('REALISTIC_ONLY')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-tech font-bold transition-all ${
                  viewMode === 'REALISTIC_ONLY'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="Chỉ hiển thị linh kiện thực tế trực quan"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                Khung 2: Thực tế 3D
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[11px] font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Chế độ mô phỏng giáo dục thủy lực ISO 1219</span>
            </div>
          </div>

          {/* The 2 Vertical Frames Canvas Container */}
          <main className="flex-1 flex overflow-hidden relative">
            {/* FRAME 1: SƠ ĐỒ KÝ HIỆU KỸ THUẬT TIÊU CHUẨN ISO 1219 */}
            {(viewMode === 'SPLIT' || viewMode === 'SCHEMATIC_ONLY') && (
              <div
                className={`h-full relative overflow-hidden ${
                  viewMode === 'SPLIT' ? 'w-1/2 border-r border-slate-800' : 'w-full'
                }`}
              >
                {/* Visual Label Header */}
                <div className="absolute top-3 right-4 z-10 flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 border border-amber-500/40 rounded-md backdrop-blur shadow-md">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[11px] font-tech font-bold text-amber-300">
                    KHUNG 1: SƠ ĐỒ KỸ THUẬT NGUYÊN LÝ (ISO 1219)
                  </span>
                </div>

                <HydraulicCanvas
                  components={project.components}
                  pipes={project.pipes}
                  selectedComponentId={selectedComponentId}
                  onSelectComponent={setSelectedComponentId}
                  onUpdateComponentPosition={handleUpdateComponentPosition}
                  onDeleteComponent={handleDeleteComponent}
                  onDuplicateComponent={handleDuplicateComponent}
                  onRotateComponent={handleRotateComponent}
                  onConnectPorts={handleConnectPorts}
                  onDeletePipe={handleDeletePipe}
                  onTogglePipeColor={handleTogglePipeColor}
                  highlightedComponentIds={highlightedComponentIds}
                  highlightedPipeIds={highlightedPipeIds}
                  isSimulating={isSimulating}
                  simulationStepTitle={activeStep?.title}
                  simulationStepComment={activeStep?.comment}
                />
              </div>
            )}

            {/* FRAME 2: LINH KIỆN THỰC TẾ TRỰC QUAN (DIGITAL TWIN) */}
            {(viewMode === 'SPLIT' || viewMode === 'REALISTIC_ONLY') && (
              <div
                className={`h-full relative overflow-hidden ${
                  viewMode === 'SPLIT' ? 'w-1/2' : 'w-full'
                }`}
              >
                {/* Visual Label Header */}
                <div className="absolute top-3 right-4 z-10 flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 border border-cyan-500/40 rounded-md backdrop-blur shadow-md">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[11px] font-tech font-bold text-cyan-300">
                    KHUNG 2: LINH KIỆN THỰC TẾ TRỰC QUAN (DIGITAL TWIN)
                  </span>
                </div>

                <RealisticHardwareView
                  components={project.components}
                  pipes={project.pipes}
                  isSimulating={isSimulating}
                  activeStep={activeStep}
                  activeBranch={activeBranch}
                  onSelectBranch={setActiveBranch}
                  manualValveState={manualValveState}
                  onSetManualValveState={handleSetManualValveState}
                />
              </div>
            )}

            {/* Validation Checklist Panel (Floating Modal) */}
            <ValidationPanel
              validation={validation}
              isOpen={isValidationOpen}
              onClose={() => setIsValidationOpen(false)}
              onHighlightComponents={(ids) => {
                if (ids[0]) setSelectedComponentId(ids[0]);
              }}
            />
          </main>
        </div>
      </div>

      {/* Bottom Simulation Toolbar & Timeline */}
      <SimulationControls
        steps={project.simulationSteps}
        currentStepIndex={currentStepIndex}
        isPlaying={isSimulating}
        onPlay={handlePlay}
        onPause={handlePause}
        onReset={handleReset}
        onPrevStep={handlePrevStep}
        onNextStep={handleNextStep}
        onSelectStep={(idx) => setCurrentStepIndex(idx)}
        speed={simulationSpeed}
        onChangeSpeed={setSimulationSpeed}
        activeBranch={activeBranch}
        onSelectBranch={setActiveBranch}
        manualValveState={manualValveState}
        onSetManualValveState={handleSetManualValveState}
      />

      {/* ISO 1219 Standard Reference Modal */}
      <ISOReferenceModal isOpen={isISOOpen} onClose={() => setIsISOOpen(false)} />

      {/* Original Blueprint Reference Modal */}
      <OriginalBlueprintModal
        isOpen={isBlueprintModalOpen}
        onClose={() => setIsBlueprintModalOpen(false)}
      />

      {/* Export / Import & Print Report Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        projectData={project}
        onImportProject={(importedData) => {
          setProject(importedData);
          setCurrentStepIndex(0);
          setIsSimulating(false);
          setHasSavedChanges(false);
        }}
      />
    </div>
  );
}
