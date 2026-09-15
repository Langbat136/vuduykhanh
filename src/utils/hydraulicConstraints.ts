import { ComponentNode, PipeConnection, PipeColor, ComponentType } from '../types/hydraulic';
import { COMPONENT_CATALOG } from '../data/defaultCatalog';

/**
 * Technical Port Rules based on ISO 1219 and Fluid Power Engineering:
 * Defines which ports can legally connect to which ports.
 */
export interface PortConstraintRule {
  allowedTargetTypes: ComponentType[];
  allowedTargetPorts: string[];
  preferredColor: PipeColor;
  description: string;
}

export const TECHNICAL_PORT_RULES: Record<string, Record<string, PortConstraintRule>> = {
  GEAR_PUMP: {
    IN: {
      allowedTargetTypes: ['TANK'],
      allowedTargetPorts: ['SUCTION'],
      preferredColor: 'red',
      description: 'Cửa hút của bơm phải nối trực tiếp với đường hút dưới mức dầu của bể chứa.',
    },
    OUT: {
      allowedTargetTypes: ['CHECK_VALVE', 'RELIEF_VALVE', 'PRESSURE_GAUGE'],
      allowedTargetPorts: ['IN', 'PORT_IN'],
      preferredColor: 'red',
      description: 'Cửa đẩy cao áp của bơm phải qua van một chiều hoặc rẽ sang van an toàn bảo vệ.',
    },
  },
  CHECK_VALVE: {
    IN: {
      allowedTargetTypes: ['GEAR_PUMP'],
      allowedTargetPorts: ['OUT'],
      preferredColor: 'red',
      description: 'Cửa vào van một chiều nối với đường đẩy của bơm bánh răng.',
    },
    OUT: {
      allowedTargetTypes: ['DIRECTIONAL_VALVE_4_3', 'PRESSURE_GAUGE', 'RELIEF_VALVE', 'SOLENOID_VALVE_2_2'],
      allowedTargetPorts: ['P', 'PORT_IN', 'IN'],
      preferredColor: 'red',
      description: 'Cửa ra cấp dầu áp suất P cho tuyến van phân phối và van bảo vệ.',
    },
  },
  RELIEF_VALVE: {
    IN: {
      allowedTargetTypes: ['CHECK_VALVE', 'GEAR_PUMP'],
      allowedTargetPorts: ['OUT'],
      preferredColor: 'red',
      description: 'Cổng đón áp suất cao để giám sát an toàn.',
    },
    OUT: {
      allowedTargetTypes: ['TANK'],
      allowedTargetPorts: ['RETURN'],
      preferredColor: 'blue',
      description: 'Cửa xả dầu quá áp về thùng chứa (áp suất 0 bar).',
    },
  },
  SOLENOID_VALVE_2_2: {
    P: {
      allowedTargetTypes: ['CHECK_VALVE', 'RELIEF_VALVE'],
      allowedTargetPorts: ['OUT', 'IN'],
      preferredColor: 'red',
      description: 'Cổng trích dầu xả tải hệ thống.',
    },
    T: {
      allowedTargetTypes: ['TANK'],
      allowedTargetPorts: ['RETURN'],
      preferredColor: 'blue',
      description: 'Cổng xả không tải về bể dầu.',
    },
  },
  FLOW_CONTROL_VALVE: {
    IN: {
      allowedTargetTypes: ['DIRECTIONAL_VALVE_4_3'],
      allowedTargetPorts: ['T'],
      preferredColor: 'blue',
      description: 'Cổng gom dầu hồi từ các van đảo chiều 4/3.',
    },
    OUT: {
      allowedTargetTypes: ['TANK'],
      allowedTargetPorts: ['RETURN'],
      preferredColor: 'blue',
      description: 'Cổng xả dầu đã ổn định lưu lượng qua cổ lọc về bể.',
    },
  },
  DIRECTIONAL_VALVE_4_3: {
    P: {
      allowedTargetTypes: ['CHECK_VALVE', 'DIRECTIONAL_VALVE_4_3', 'PRESSURE_GAUGE'],
      allowedTargetPorts: ['OUT', 'P', 'PORT_IN'],
      preferredColor: 'red',
      description: 'Cổng cấp dầu nguồn P (Pressure) nối vào đường ống cao áp chính.',
    },
    T: {
      allowedTargetTypes: ['FLOW_CONTROL_VALVE', 'DIRECTIONAL_VALVE_4_3', 'TANK'],
      allowedTargetPorts: ['IN', 'T', 'RETURN'],
      preferredColor: 'blue',
      description: 'Cổng dầu hồi T (Tank) gom về tuyến hồi áp suất thấp.',
    },
    A: {
      allowedTargetTypes: ['COUNTERBALANCE_VALVE_DUAL', 'HYDRAULIC_CYLINDER'],
      allowedTargetPorts: ['V1', 'PORT_1'],
      preferredColor: 'red',
      description: 'Cổng công tác A nối vào ngõ V1 của van cân bằng hoặc buồng đẩy xi lanh.',
    },
    B: {
      allowedTargetTypes: ['COUNTERBALANCE_VALVE_DUAL', 'HYDRAULIC_CYLINDER'],
      allowedTargetPorts: ['V2', 'PORT_2'],
      preferredColor: 'blue',
      description: 'Cổng công tác B nối vào ngõ V2 của van cân bằng hoặc buồng cần xi lanh.',
    },
  },
  COUNTERBALANCE_VALVE_DUAL: {
    V1: {
      allowedTargetTypes: ['DIRECTIONAL_VALVE_4_3'],
      allowedTargetPorts: ['A'],
      preferredColor: 'red',
      description: 'Cổng đón dầu cấp nâng từ ngõ A của van phân phối.',
    },
    V2: {
      allowedTargetTypes: ['DIRECTIONAL_VALVE_4_3'],
      allowedTargetPorts: ['B'],
      preferredColor: 'blue',
      description: 'Cổng đón dầu hồi hạ từ ngõ B của van phân phối.',
    },
    C1: {
      allowedTargetTypes: ['HYDRAULIC_CYLINDER'],
      allowedTargetPorts: ['PORT_1'],
      preferredColor: 'red',
      description: 'Cổng xi lanh C1 nối trực tiếp buồng đáy xi lanh (buồng nâng chịu tải trọng).',
    },
    C2: {
      allowedTargetTypes: ['HYDRAULIC_CYLINDER'],
      allowedTargetPorts: ['PORT_2'],
      preferredColor: 'blue',
      description: 'Cổng xi lanh C2 nối buồng cần xi lanh (buồng hạ/thu cần).',
    },
  },
  HYDRAULIC_CYLINDER: {
    PORT_1: {
      allowedTargetTypes: ['COUNTERBALANCE_VALVE_DUAL', 'DIRECTIONAL_VALVE_4_3'],
      allowedTargetPorts: ['C1', 'A'],
      preferredColor: 'red',
      description: 'Buồng đáy piston: Cấp dầu áp lực đẩy duỗi chân kích chống xe.',
    },
    PORT_2: {
      allowedTargetTypes: ['COUNTERBALANCE_VALVE_DUAL', 'DIRECTIONAL_VALVE_4_3'],
      allowedTargetPorts: ['C2', 'B'],
      preferredColor: 'blue',
      description: 'Buồng cần piston: Cấp dầu áp lực thu chân kích về vị trí cất giữ.',
    },
  },
};

/**
 * Check if a connection between two ports satisfies fluid power technical rules.
 */
export function validatePortConnectionRule(
  sourceType: ComponentType,
  sourcePort: string,
  targetType: ComponentType,
  targetPort: string
): { allowed: boolean; message?: string; suggestedColor?: PipeColor } {
  // Check source rule
  const srcRules = TECHNICAL_PORT_RULES[sourceType]?.[sourcePort];
  if (srcRules) {
    if (srcRules.allowedTargetTypes.includes(targetType) && srcRules.allowedTargetPorts.includes(targetPort)) {
      return { allowed: true, suggestedColor: srcRules.preferredColor };
    }
  }

  // Check reverse rule
  const tgtRules = TECHNICAL_PORT_RULES[targetType]?.[targetPort];
  if (tgtRules) {
    if (tgtRules.allowedTargetTypes.includes(sourceType) && tgtRules.allowedTargetPorts.includes(sourcePort)) {
      return { allowed: true, suggestedColor: tgtRules.preferredColor };
    }
  }

  // Allow same-port bus daisy chaining (e.g. P to P, or T to T between identical valves)
  if (sourceType === targetType && sourcePort === targetPort && (sourcePort === 'P' || sourcePort === 'T')) {
    return {
      allowed: true,
      suggestedColor: sourcePort === 'P' ? 'red' : 'blue',
    };
  }

  return {
    allowed: false,
    message: `Cổng ${sourcePort} của ${sourceType} không tương thích tiêu chuẩn kỹ thuật khi đấu nối với cổng ${targetPort} của ${targetType}.`,
  };
}

/**
 * Automatically calculates snap alignment coordinates to maintain exact technical bus alignment
 * when user moves components.
 */
export function snapToTechnicalGrid(
  component: ComponentNode,
  allComponents: ComponentNode[]
): { x: number; y: number } {
  let snapX = Math.round(component.position.x / 10) * 10;
  let snapY = Math.round(component.position.y / 10) * 10;

  // If this is a branch component (1..4), snap to standard branch column if close
  if (component.branchIndex && component.branchIndex >= 1 && component.branchIndex <= 4) {
    const standardColumnX = [0, 50, 280, 510, 740][component.branchIndex];

    if (Math.abs(snapX - standardColumnX) < 45) {
      snapX = standardColumnX;
    }

    // Row snapping
    if (component.type === 'DIRECTIONAL_VALVE_4_3' && Math.abs(snapY - 110) < 40) {
      snapY = 110;
    } else if (component.type === 'COUNTERBALANCE_VALVE_DUAL' && Math.abs(snapY - 370) < 40) {
      snapY = 370;
    } else if (component.type === 'HYDRAULIC_CYLINDER' && Math.abs(snapY - 720) < 40) {
      snapY = 720;
      snapX = standardColumnX + 35; // Cylinder centered on branch
    }
  }

  return { x: snapX, y: snapY };
}
