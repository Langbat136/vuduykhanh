import { ComponentNode, PipeConnection, ValidationIssue, ValidationSummary } from '../types/hydraulic';

export function validateHydraulicDiagram(
  components: ComponentNode[],
  pipes: PipeConnection[]
): ValidationSummary {
  const issues: ValidationIssue[] = [];

  // 1. Check Power Unit presence
  const hasTank = components.some((c) => c.type === 'TANK');
  const hasPump = components.some((c) => c.type === 'GEAR_PUMP');
  const hasMotor = components.some((c) => c.type === 'MOTOR');

  if (!hasTank) {
    issues.push({
      id: 'err_no_tank',
      severity: 'error',
      title: 'Thiếu Bể chứa dầu (1)',
      message: 'Hệ thống thủy lực bắt buộc phải có ít nhất 1 Bể chứa dầu để hút và hồi dầu.',
      ruleName: 'Đủ nguồn động lực',
    });
  }

  if (!hasPump) {
    issues.push({
      id: 'err_no_pump',
      severity: 'error',
      title: 'Thiếu Bơm bánh răng (13)',
      message: 'Cần có bơm thủy lực để tạo áp suất và lưu lượng dòng dầu.',
      ruleName: 'Đủ nguồn động lực',
    });
  }

  if (!hasMotor) {
    issues.push({
      id: 'warn_no_motor',
      severity: 'warning',
      title: 'Chưa có Động cơ điện (2)',
      message: 'Cần động cơ điện hoặc nguồn truyền động để quay trục bơm.',
      ruleName: 'Đủ nguồn động lực',
    });
  }

  // 2. Check Pump Connections
  const pumps = components.filter((c) => c.type === 'GEAR_PUMP');
  pumps.forEach((pump) => {
    const hasSuction = pipes.some(
      (p) =>
        (p.targetComponentId === pump.id && p.targetPort === 'IN') ||
        (p.sourceComponentId === pump.id && p.sourcePort === 'IN')
    );
    const hasDischarge = pipes.some(
      (p) =>
        (p.sourceComponentId === pump.id && p.sourcePort === 'OUT') ||
        (p.targetComponentId === pump.id && p.targetPort === 'OUT')
    );

    if (!hasSuction) {
      issues.push({
        id: `err_pump_suction_${pump.id}`,
        severity: 'error',
        title: `Bơm [${pump.label}] chưa nối đường hút`,
        message: 'Cổng hút (S) của bơm bánh răng phải được nối với Bể chứa dầu (1).',
        componentIds: [pump.id],
        ruleName: 'Đường hút bơm',
      });
    }

    if (!hasDischarge) {
      issues.push({
        id: `err_pump_discharge_${pump.id}`,
        severity: 'error',
        title: `Bơm [${pump.label}] chưa nối đường đẩy áp lực`,
        message: 'Cổng đẩy (P) của bơm phải nối tới van một chiều (14) hoặc đường ống chính.',
        componentIds: [pump.id],
        ruleName: 'Đường đẩy áp lực',
      });
    }
  });

  // 3. Check Safety Relief Valve
  const hasRelief = components.some((c) => c.type === 'RELIEF_VALVE');
  if (!hasRelief) {
    issues.push({
      id: 'warn_no_relief',
      severity: 'warning',
      title: 'Chưa có Van an toàn (4)',
      message: 'Hệ thống áp lực cao nên trang bị van an toàn giảm áp để chống nổ vỡ đường ống khi quá tải.',
      ruleName: 'An toàn áp lực',
    });
  } else {
    const relief = components.find((c) => c.type === 'RELIEF_VALVE')!;
    const reliefHasReturn = pipes.some(
      (p) =>
        (p.sourceComponentId === relief.id && p.sourcePort === 'OUT') ||
        (p.targetComponentId === relief.id && p.targetPort === 'OUT')
    );
    if (!reliefHasReturn) {
      issues.push({
        id: 'err_relief_no_tank',
        severity: 'error',
        title: 'Cổng xả van an toàn (4) chưa về bể',
        message: 'Cổng T của van an toàn phải được nối đường hồi (xanh) trực tiếp về bể chứa dầu.',
        componentIds: [relief.id],
        ruleName: 'Xả an toàn',
      });
    }
  }

  // 4. Check Actuator Cylinders (18)
  const cylinders = components.filter((c) => c.type === 'HYDRAULIC_CYLINDER');
  if (cylinders.length === 0) {
    issues.push({
      id: 'warn_no_cylinder',
      severity: 'warning',
      title: 'Chưa có Chân kích thủy lực (18)',
      message: 'Cần ít nhất 1 chân kích để thực hiện chức năng nâng/hạ tải.',
      ruleName: 'Cơ cấu chấp hành',
    });
  }

  cylinders.forEach((cyl) => {
    const port1Connected = pipes.some(
      (p) =>
        (p.sourceComponentId === cyl.id && p.sourcePort === 'PORT_1') ||
        (p.targetComponentId === cyl.id && p.targetPort === 'PORT_1')
    );
    const port2Connected = pipes.some(
      (p) =>
        (p.sourceComponentId === cyl.id && p.sourcePort === 'PORT_2') ||
        (p.targetComponentId === cyl.id && p.targetPort === 'PORT_2')
    );

    if (!port1Connected || !port2Connected) {
      issues.push({
        id: `err_cyl_ports_${cyl.id}`,
        severity: 'error',
        title: `[${cyl.label}] chưa nối đủ 2 cổng`,
        message: `Xi lanh tác động kép cần nối cả cổng buồng đáy C1 và cổng buồng cần C2. Hiện tại ${
          !port1Connected && !port2Connected
            ? 'chưa nối cổng nào'
            : !port1Connected
            ? 'thiếu cổng C1'
            : 'thiếu cổng C2'
        }.`,
        componentIds: [cyl.id],
        ruleName: 'Cơ cấu chấp hành',
      });
    }
  });

  // 5. Check Directional Control Valves (16)
  const directionalValves = components.filter((c) => c.type === 'DIRECTIONAL_VALVE_4_3');
  directionalValves.forEach((valve) => {
    const hasP = pipes.some(
      (p) =>
        (p.sourceComponentId === valve.id && p.sourcePort === 'P') ||
        (p.targetComponentId === valve.id && p.targetPort === 'P')
    );
    const hasT = pipes.some(
      (p) =>
        (p.sourceComponentId === valve.id && p.sourcePort === 'T') ||
        (p.targetComponentId === valve.id && p.targetPort === 'T')
    );

    if (!hasP) {
      issues.push({
        id: `err_valve_p_${valve.id}`,
        severity: 'error',
        title: `[${valve.label}] thiếu đường cấp P`,
        message: 'Cổng P của van 4/3 chưa nhận dầu áp lực từ bơm hoặc cụm van lưu lượng.',
        componentIds: [valve.id],
        ruleName: 'Cấp nguồn van',
      });
    }

    if (!hasT) {
      issues.push({
        id: `warn_valve_t_${valve.id}`,
        severity: 'warning',
        title: `[${valve.label}] thiếu đường hồi T về bể`,
        message: 'Cổng T của van 4/3 cần có ống xả về bể chứa để hoàn thành chu trình hồi dầu.',
        componentIds: [valve.id],
        ruleName: 'Đường hồi dầu',
      });
    }
  });

  // 6. Check for isolated / unconnected components
  components.forEach((comp) => {
    const isConnected = pipes.some(
      (p) => p.sourceComponentId === comp.id || p.targetComponentId === comp.id
    );
    if (!isConnected && comp.type !== 'COUPLING' && comp.type !== 'POWER_PANEL_220V') {
      issues.push({
        id: `warn_unconnected_${comp.id}`,
        severity: 'warning',
        title: `Linh kiện [${comp.label}] chưa được kết nối`,
        message: 'Linh kiện này đang đứng độc lập trên sơ đồ và chưa tham gia vào mạch thủy lực.',
        componentIds: [comp.id],
        ruleName: 'Mạch liên tục',
      });
    }
  });

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  if (errorCount === 0 && warningCount === 0 && components.length > 3) {
    issues.push({
      id: 'success_ready',
      severity: 'success',
      title: 'Sơ đồ hoàn chỉnh & hợp lệ!',
      message: 'Mạch thủy lực kín, đầy đủ nguồn động lực, cơ cấu chấp hành và an toàn. Bạn có thể bấm "Chạy mô phỏng".',
      ruleName: 'Kiểm định thành công',
    });
  }

  return {
    isValid: errorCount === 0,
    errorCount,
    warningCount,
    issues,
  };
}
