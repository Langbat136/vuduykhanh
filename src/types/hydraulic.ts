/**
 * Hydraulic System Types & Schemas based on ISO 1219 Standard
 * and Customer Technical Specification
 */

export type ComponentType =
  | 'TANK'                       // (1) Bể chứa dầu
  | 'MOTOR'                      // (2) Động cơ điện (M)
  | 'COUPLING'                   // (12) Khớp nối trục
  | 'GEAR_PUMP'                  // (13) Bơm bánh răng
  | 'CHECK_VALVE'                // (14) Van 1 chiều
  | 'SOLENOID_VALVE_2_2'         // (5) Van điện từ 2/2
  | 'RELIEF_VALVE'               // (4) Van an toàn / giảm áp
  | 'FLOW_CONTROL_VALVE'         // (6) Van điều khiển lưu lượng bù áp
  | 'PRESSURE_GAUGE'             // Đồng hồ áp suất
  | 'DIRECTIONAL_VALVE_4_3'      // (16) Van 4/3 đảo chiều (Cuộn A / Cuộn B)
  | 'COUNTERBALANCE_VALVE_DUAL'  // (17) Van cân bằng kép (V1/V2, C1/C2)
  | 'HYDRAULIC_CYLINDER'         // (18) Chân kích thủy lực (Xi lanh)
  | 'CONTROL_CABINET_24V'        // Tủ điều khiển 24V DC
  | 'POWER_PANEL_220V';          // Bảng điều khiển động lực 220V-50Hz

export type ComponentCategory =
  | 'power'        // Nguồn động lực
  | 'valves'       // Van điều khiển & an toàn
  | 'actuators'    // Cơ cấu chấp hành
  | 'instruments'  // Đo lường & phụ kiện
  | 'electrical';  // Hệ thống điện

export type ValveState = 'NEUTRAL' | 'COIL_A' | 'COIL_B';

export type PortRole = 'IN' | 'OUT' | 'BIDIRECTIONAL' | 'PILOT' | 'DRAIN' | 'ELECTRICAL';

export type PipeColor = 'red' | 'blue' | 'wire-red' | 'wire-blue' | 'wire-black' | 'orange' | 'purple';

export type PipeType =
  | 'PRESSURE'       // (P) Tuyến cao áp (Đỏ ~160 bar)
  | 'RETURN'         // (T) Tuyến hồi dầu về bể (Xanh dương)
  | 'WORK'           // (A/B) Tuyến công tác xi lanh
  | 'PILOT'          // (X) Tuyến tín hiệu điều khiển pilot (Cam nét đứt)
  | 'DRAIN'          // (Y) Tuyến rò rỉ rãnh dầu phốt (Tím chấm gạch)
  | 'CONTROL_24V'    // (+24V) Dây điện điều khiển cuộn hút solenoid
  | 'POWER_3P_220V'; // (~220V) Tuyến động lực 3 pha

export interface PortDefinition {
  id: string;
  name: string;
  role: PortRole;
  flowColor: PipeColor;
  relativeX: number; // 0 to 1 ratio or relative offset
  relativeY: number;
  label?: string;
  description?: string;
}

export interface ComponentNode {
  id: string;
  type: ComponentType;
  label: string;
  subLabel?: string;
  referenceNumber?: string; // e.g. "(1)", "(16)", etc.
  branchIndex?: number; // 1, 2, 3, 4 for the 4 actuator branches
  position: { x: number; y: number };
  rotation?: number; // 0, 90, 180, 270
  properties?: {
    coils?: ('A' | 'B')[];
    state?: ValveState;
    cylinderStroke?: number; // 0 to 100%
    pressureBar?: number;
    reliefPressureSetting?: number;
    flowRateLpm?: number;
    motorRunning?: boolean;
    electricalOn?: boolean;
    isUnloaded?: boolean;
  };
}

export interface PipeConnection {
  id: string;
  sourceComponentId: string;
  sourcePort: string;
  targetComponentId: string;
  targetPort: string;
  color: PipeColor; // 'red' = inlet/pressure, 'blue' = outlet/return, 'wire-red' = 24V
  pipeType?: PipeType;
  diameterMm?: number;
  maxPressureBar?: number;
  label?: string;
  waypoints?: [number, number][];
  flowActive?: boolean;
  flowDirection?: 1 | -1 | 0; // 1 = source to target, -1 = target to source, 0 = idle
  hasBridge?: boolean; // Render semi-circle jumper arc where crossing
}

export interface SimulationStep {
  stepId: string;
  order?: number;
  stepNumber?: number;
  title: string;
  highlightComponentIds?: string[];
  highlightPipeIds?: string[];
  comment: string;
  editable?: boolean;
  durationMs?: number;
  actuatorState?: {
    branchIndex?: number | 'ALL'; // 1..4 or 'ALL'
    valveState?: ValveState;
    action?: 'idle' | 'extend' | 'retract' | 'locked' | 'unloading';
    pressureGauge?: number; // bar
    cylinderStrokes?: number[]; // custom per-cylinder stroke percentage (0-100%)
  };
}

export interface ProjectData {
  projectId: string;
  name: string;
  description?: string;
  components: ComponentNode[];
  pipes: PipeConnection[];
  simulationSteps: SimulationStep[];
  activeBranch?: number | 'ALL';
}

export type ValidationSeverity = 'error' | 'warning' | 'info' | 'success';

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  title: string;
  message: string;
  componentIds?: string[];
  ruleName: string;
}

export interface ValidationSummary {
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  issues: ValidationIssue[];
}
