import { ComponentCategory, ComponentType, PortDefinition } from '../types/hydraulic';

export interface CatalogItem {
  type: ComponentType;
  name: string;
  referenceNumber: string;
  category: ComponentCategory;
  description: string;
  isoSymbolCode: string;
  ports: PortDefinition[];
  defaultWidth: number;
  defaultHeight: number;
}

export const COMPONENT_CATALOG: CatalogItem[] = [
  // 1. Nguồn động lực (Power Unit)
  {
    type: 'TANK',
    name: 'Bể chứa dầu',
    referenceNumber: '(1)',
    category: 'power',
    description: 'Chứa dầu thủy lực, là điểm đầu (hút) và điểm cuối (hồi) của toàn hệ thống; tích hợp lọc hút & lọc hồi (11).',
    isoSymbolCode: 'ISO 1219-1 Reservoir',
    defaultWidth: 140,
    defaultHeight: 90,
    ports: [
      { id: 'OUT', name: 'Đường hút (Suction)', role: 'OUT', flowColor: 'red', relativeX: 0.25, relativeY: 0.1, label: 'OUT' },
      { id: 'IN', name: 'Đường hồi (Return)', role: 'IN', flowColor: 'blue', relativeX: 0.75, relativeY: 0.1, label: 'IN' },
    ],
  },
  {
    type: 'MOTOR',
    name: 'Động cơ điện (3 pha)',
    referenceNumber: '(2) - M',
    category: 'power',
    description: 'Chuyển đổi điện năng (220V/380V-50Hz) thành cơ năng quay trục bơm với tốc độ định mức.',
    isoSymbolCode: 'ISO 1219 Electric Motor',
    defaultWidth: 100,
    defaultHeight: 80,
    ports: [
      { id: 'SHAFT', name: 'Trục động cơ', role: 'OUT', flowColor: 'red', relativeX: 1, relativeY: 0.5, label: 'SHAFT' },
      { id: 'POWER_IN', name: 'Nguồn điện 3 pha', role: 'IN', flowColor: 'red', relativeX: 0.5, relativeY: 0, label: '3~' },
    ],
  },
  {
    type: 'COUPLING',
    name: 'Khớp nối trục',
    referenceNumber: '(12)',
    category: 'power',
    description: 'Khớp nối giảm chấn truyền momen xoắn từ trục động cơ điện sang trục bơm bánh răng.',
    isoSymbolCode: 'ISO 1219 Mechanical Coupling',
    defaultWidth: 70,
    defaultHeight: 60,
    ports: [
      { id: 'IN_SHAFT', name: 'Đầu vào trục motor', role: 'IN', flowColor: 'red', relativeX: 0, relativeY: 0.5, label: 'IN' },
      { id: 'OUT_SHAFT', name: 'Đầu ra trục bơm', role: 'OUT', flowColor: 'red', relativeX: 1, relativeY: 0.5, label: 'OUT' },
    ],
  },
  {
    type: 'GEAR_PUMP',
    name: 'Bơm bánh răng',
    referenceNumber: '(13)',
    category: 'power',
    description: 'Hút dầu từ bể chứa, tạo lưu lượng và áp suất đẩy dầu đi khắp hệ thống thủy lực.',
    isoSymbolCode: 'ISO 1219-1 Fixed Displacement Pump',
    defaultWidth: 100,
    defaultHeight: 80,
    ports: [
      { id: 'IN', name: 'Cổng hút (Suction)', role: 'IN', flowColor: 'red', relativeX: 0, relativeY: 0.5, label: 'S' },
      { id: 'OUT', name: 'Cổng đẩy (Pressure)', role: 'OUT', flowColor: 'red', relativeX: 1, relativeY: 0.5, label: 'P' },
    ],
  },

  // 2. Van an toàn & phụ trợ (Valves & Accessories)
  {
    type: 'CHECK_VALVE',
    name: 'Van một chiều',
    referenceNumber: '(14)',
    category: 'valves',
    description: 'Chỉ cho dầu đi theo 1 chiều từ bơm ra, ngăn dòng chảy dội ngược về bơm khi ngắt động cơ.',
    isoSymbolCode: 'ISO 1219-1 Non-Return Check Valve',
    defaultWidth: 80,
    defaultHeight: 70,
    ports: [
      { id: 'IN', name: 'Cổng vào (Inlet)', role: 'IN', flowColor: 'red', relativeX: 0, relativeY: 0.5, label: 'IN' },
      { id: 'OUT', name: 'Cổng ra (Outlet)', role: 'OUT', flowColor: 'red', relativeX: 1, relativeY: 0.5, label: 'OUT' },
    ],
  },
  {
    type: 'SOLENOID_VALVE_2_2',
    name: 'Van điện từ 2/2 (Unloading)',
    referenceNumber: '(5)',
    category: 'valves',
    description: 'Van đóng/mở 2 cửa 2 vị trí kích điện từ, dùng để xả tải (unloading) hoặc giữ áp phối hợp với van an toàn.',
    isoSymbolCode: 'ISO 1219 2/2 Solenoid Valve',
    defaultWidth: 110,
    defaultHeight: 80,
    ports: [
      { id: 'P', name: 'Cổng áp lực P', role: 'IN', flowColor: 'red', relativeX: 0.25, relativeY: 1, label: 'P' },
      { id: 'T', name: 'Cổng xả T (Tank)', role: 'OUT', flowColor: 'blue', relativeX: 0.75, relativeY: 1, label: 'T' },
      { id: 'COIL', name: 'Cuộn điện 24V', role: 'IN', flowColor: 'red', relativeX: 0.5, relativeY: 0, label: '24V' },
    ],
  },
  {
    type: 'RELIEF_VALVE',
    name: 'Van an toàn (Giảm áp)',
    referenceNumber: '(4)',
    category: 'valves',
    description: 'Xả dầu về bể khi áp suất vượt ngưỡng cài đặt (ví dụ 160-200 bar), bảo vệ hệ thống khỏi quá tải.',
    isoSymbolCode: 'ISO 1219-1 Pressure Relief Valve',
    defaultWidth: 100,
    defaultHeight: 80,
    ports: [
      { id: 'IN', name: 'Cổng vào áp lực P', role: 'IN', flowColor: 'red', relativeX: 0.25, relativeY: 1, label: 'P' },
      { id: 'OUT', name: 'Cổng xả về bể T', role: 'OUT', flowColor: 'blue', relativeX: 0.75, relativeY: 1, label: 'T' },
    ],
  },
  {
    type: 'FLOW_CONTROL_VALVE',
    name: 'Van lưu lượng bù áp',
    referenceNumber: '(6)',
    category: 'valves',
    description: 'Ổn định lưu lượng dầu cấp cho 4 nhánh van 4/3, giữ vận tốc kích không đổi dù tải trọng thay đổi.',
    isoSymbolCode: 'ISO 1219-1 Pressure-Compensated Flow Control',
    defaultWidth: 100,
    defaultHeight: 80,
    ports: [
      { id: 'IN', name: 'Cổng vào P_in', role: 'IN', flowColor: 'red', relativeX: 0, relativeY: 0.5, label: 'IN' },
      { id: 'OUT', name: 'Cổng ra điều tiết P_out', role: 'OUT', flowColor: 'red', relativeX: 1, relativeY: 0.5, label: 'OUT' },
    ],
  },
  {
    type: 'PRESSURE_GAUGE',
    name: 'Đồng hồ áp suất',
    referenceNumber: 'Gauge',
    category: 'instruments',
    description: 'Hiển thị áp suất tức thời của đường dầu áp lực (bar / MPa / psi).',
    isoSymbolCode: 'ISO 1219-1 Pressure Gauge',
    defaultWidth: 80,
    defaultHeight: 80,
    ports: [
      { id: 'IN', name: 'Đầu nối đo áp', role: 'IN', flowColor: 'red', relativeX: 0.5, relativeY: 1, label: 'P' },
    ],
  },

  // 3. Van điều khiển nhánh & Khóa tải (Branch Control)
  {
    type: 'DIRECTIONAL_VALVE_4_3',
    name: 'Van 4/3 điện từ đảo chiều',
    referenceNumber: '(16)',
    category: 'valves',
    description: 'Đảo chiều dòng dầu điều khiển chân kích ra/vào hoặc dừng lại ở vị trí trung tâm. Gồm Cuộn A và Cuộn B.',
    isoSymbolCode: 'ISO 1219-1 4/3 Directional Control Valve',
    defaultWidth: 160,
    defaultHeight: 90,
    ports: [
      { id: 'A', name: 'Cổng công tác A (tới V1)', role: 'OUT', flowColor: 'red', relativeX: 0.28, relativeY: 0, label: 'A' },
      { id: 'B', name: 'Cổng công tác B (tới V2)', role: 'OUT', flowColor: 'blue', relativeX: 0.72, relativeY: 0, label: 'B' },
      { id: 'P', name: 'Cổng áp suất P (Pump)', role: 'IN', flowColor: 'red', relativeX: 0.38, relativeY: 1, label: 'P' },
      { id: 'T', name: 'Cổng hồi bể T (Tank)', role: 'OUT', flowColor: 'blue', relativeX: 0.62, relativeY: 1, label: 'T' },
      { id: 'COIL_A_PWR', name: 'Cuộn A (+24V/Tín hiệu)', role: 'ELECTRICAL', flowColor: 'wire-red', relativeX: 0.08, relativeY: 0.2, label: 'A' },
      { id: 'COIL_B_PWR', name: 'Cuộn B (+24V/Tín hiệu)', role: 'ELECTRICAL', flowColor: 'wire-red', relativeX: 0.92, relativeY: 0.2, label: 'B' },
    ],
  },
  {
    type: 'COUNTERBALANCE_VALVE_DUAL',
    name: 'Van cân bằng kép (Overcenter)',
    referenceNumber: '(17)',
    category: 'valves',
    description: 'Khóa giữ tải chống tụt lún chân kích khi van 4/3 ở vị trí trung tâm; kiểm soát vận tốc hạ tải êm dịu.',
    isoSymbolCode: 'ISO 1219-1 Dual Counterbalance Valve',
    defaultWidth: 160,
    defaultHeight: 120,
    ports: [
      { id: 'V1', name: 'Cổng V1 (nối tới A van 4/3)', role: 'IN', flowColor: 'red', relativeX: 0.28, relativeY: 0, label: 'V1' },
      { id: 'V2', name: 'Cổng V2 (nối tới B van 4/3)', role: 'IN', flowColor: 'blue', relativeX: 0.72, relativeY: 0, label: 'V2' },
      { id: 'C1', name: 'Cổng C1 (nối buồng đáy xi lanh)', role: 'BIDIRECTIONAL', flowColor: 'red', relativeX: 0.28, relativeY: 1, label: 'C1' },
      { id: 'C2', name: 'Cổng C2 (nối buồng cần xi lanh)', role: 'BIDIRECTIONAL', flowColor: 'blue', relativeX: 0.72, relativeY: 1, label: 'C2' },
    ],
  },
  {
    type: 'HYDRAULIC_CYLINDER',
    name: 'Chân kích thủy lực (Xi lanh)',
    referenceNumber: '(18)',
    category: 'actuators',
    description: 'Xi lanh tác động kép dạng đứng, chân kích nâng hạ cân bằng tải trọng an toàn.',
    isoSymbolCode: 'ISO 1219-1 Double-Acting Jack Cylinder',
    defaultWidth: 100,
    defaultHeight: 140,
    ports: [
      { id: 'PORT_1', name: 'Cổng đẩy C1 (buồng đáy)', role: 'IN', flowColor: 'red', relativeX: 0.32, relativeY: 0.15, label: 'C1' },
      { id: 'PORT_2', name: 'Cổng thu C2 (buồng cần)', role: 'IN', flowColor: 'blue', relativeX: 0.68, relativeY: 0.85, label: 'C2' },
    ],
  },

  // 5. Hệ thống điện (Electrical Control)
  {
    type: 'CONTROL_CABINET_24V',
    name: 'Tủ điều khiển 24V DC',
    referenceNumber: 'TỦ ĐK 24V',
    category: 'electrical',
    description: 'Cấp nguồn 24V DC điều khiển đóng/mở độc lập các cuộn hút của 4 van 4/3 và van điện từ 2/2.',
    isoSymbolCode: 'Electrical Cabinet 24V DC',
    defaultWidth: 130,
    defaultHeight: 90,
    ports: [
      { id: 'DC_IN', name: 'Nguồn DC đầu vào từ Bảng ĐL', role: 'IN', flowColor: 'red', relativeX: 0.2, relativeY: 1, label: 'IN' },
      { id: 'OUT_24V', name: 'Nguồn +24V DC tới các cuộn van', role: 'OUT', flowColor: 'red', relativeX: 0.5, relativeY: 1, label: '24V' },
      { id: 'GND', name: 'Tiếp địa / 0V', role: 'OUT', flowColor: 'blue', relativeX: 0.8, relativeY: 1, label: '0V' },
    ],
  },
  {
    type: 'POWER_PANEL_220V',
    name: 'Bảng điều khiển động lực',
    referenceNumber: 'BẢNG ĐL 220V/380V',
    category: 'electrical',
    description: 'Cung cấp nguồn 3 pha A-B-C cho động cơ bơm, tích hợp aptomat, rơ le nhiệt và hạ áp nguồn 24V.',
    isoSymbolCode: 'Power Distribution Board',
    defaultWidth: 130,
    defaultHeight: 90,
    ports: [
      { id: 'AC_OUT', name: 'Cấp nguồn 3 pha motor', role: 'OUT', flowColor: 'red', relativeX: 0.5, relativeY: 1, label: '3~' },
      { id: 'DC_FEED', name: 'Cấp nguồn bộ chuyển đổi 24V', role: 'OUT', flowColor: 'red', relativeX: 0.8, relativeY: 1, label: 'DC' },
    ],
  },
];
