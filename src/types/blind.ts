export type ShapeType = 'right_high' | 'left_high' | 'gable_peak' | 'level';
export type ControlSide = 'left' | 'right';
export type StackType = 'high_side' | 'low_side' | 'split' | 'left' | 'right';
export type SlatSortOrder = 'left_to_right' | 'right_to_left' | 'cut_ascending' | 'cut_descending';

export interface BlindInput {
  // Dimensions (mm)
  width: number;
  heightLeft: number;
  heightRight: number;
  fabricWidth: 89 | 127;
  shapeType: ShapeType;
  gablePeakRatio: number; // 0.1 to 0.9 (default 0.5 for center peak)
  gablePeakHeight: number; // Peak height if gable

  // Factory Allowances (mm)
  dTop: number; // Rail + Carrier hook deduction (default 45)
  dBottom: number; // Bottom clearance from floor/sill (default 15)
  fTop: number; // Top hem allowance for hanger insert (default 20)
  fBottom: number; // Bottom pocket allowance for weight plate (default 50)
  pitch: number; // Slat carrier pitch (default 76 for 89mm, 115 for 127mm)
  trackDeductionLeft?: number; // Left clearance margin for track (default 10mm)
  trackDeductionRight?: number; // Right clearance margin for track (default 10mm)
  firstSlatOffsetX?: number; // First slat center X from track start (default 44.5mm for 89mm slat)

  // Job Order Info
  projectName: string;
  customerName: string;
  orderNo: string;
  orderDate: string;
  deliveryDate: string;
  fabricCode: string;
  fabricColor: string;
  controlSide: ControlSide;
  stackType: StackType;
  slatSortOrder: SlatSortOrder;
  notes: string;
}

export interface SlatCalculationItem {
  id: number;
  index: number; // Slat No. (1, 2, ... N)
  positionX: number; // Slat center X coordinate from track start (starts at 44.5mm)
  openingPositionX: number; // Slat center X coordinate from window opening left edge (10mm + positionX)
  windowHeight: number; // Raw opening height at slat center (mm)
  finishedHeight: number; // Finished drop height (mm)
  cutLength: number; // Actual fabric cutting length with hems (mm)
  bevelAngleDeg: number; // Top bevel cut angle (deg)
  stepDiffFromPrev: number; // Height difference compared to previous slat (mm)
  carrierDistanceOnRail: number; // Cumulative carrier distance along sloped rail (mm)
  isCut: boolean; // Tracking check state for factory worker
}

export interface MaterialCostConfig {
  currency: string; // 'AUD' ($)
  fabricCostPerMeter: number; // 원단 m당 단가 ($)
  useWasteLengthForCost: boolean; // 여유율(+5%) 포함 여부

  // Headrail
  headrailCostPerMeter: number; // 경사 헤드레일 m당 단가 ($)

  // Per Slat Accessories
  bottomWeightCostPerUnit: number; // 하단 추판 개당 단가 ($)
  topHangerCostPerUnit: number; // 상단 행거 후크 개당 단가 ($)
  bottomChainCostPerUnit: number; // 하단 스페이서 체인 슬랫당 단가 ($)

  // Fixed & Hardware Kits
  slopedControlKitCost: number; // 경사 조작부 & 틸트 기어 세트 단가 ($)
  assemblyLaborCost: number; // 제작 공임 및 가공비 ($)
  additionalCost: number; // 기타 부자재 비용 ($)
  additionalCostLabel: string; // 기타 항목명

  // Pricing & Margin
  marginPercent: number; // 마진율 (%)
  includeVat: boolean; // GST 10% 포함 여부
}

export interface MaterialCostBreakdown {
  fabricCost: number;
  fabricBillableMeters: number;
  headrailCost: number;
  headrailBillableMeters: number;
  bottomWeightsCost: number;
  topHangersCost: number;
  bottomChainCost: number;
  accessoriesSubtotal: number;
  controlKitCost: number;
  assemblyLaborCost: number;
  additionalCost: number;

  totalMaterialCost: number; // 순수 부품/자재 원가
  totalManufacturingCost: number; // 총 제조 원가 (자재 + 공임)
  suggestedSalePrice: number; // 마진 적용 견적가
  vatAmount: number; // 부가세
  finalSalePriceWithVat: number; // VAT 포함 최종 공급가
}

export interface CalculationResult {
  totalSlats: number;
  actualPitch: number; // Actual horizontal pitch between slats (mm)
  actualPitchRail: number; // Actual carrier pitch along sloped rail (mm)
  effectiveNominalPitchHoriz: number; // Nominal pitch * cos(θ) (e.g. 75 * cos(θ) ≈ 68mm)
  cosSlope: number; // cos(θ) reduction factor
  carrierSpanHoriz: number; // Horizontal distance from Slat 1 to Slat N (mm)
  carrierSpanRail: number; // Sloped rail distance from Slat 1 to Slat N (mm)
  deltaH: number; // HR - HL (mm)
  angleDeg: number; // Slope angle in degrees
  railLength: number; // True sloped rail length (mm)
  openingWidth: number; // Overall window opening width (mm)
  trackWidth: number; // Track horizontal width after 10mm L + 10mm R deductions (mm)
  trackDeductionLeft: number; // Left clearance (mm, default 10)
  trackDeductionRight: number; // Right clearance (mm, default 10)
  trackDeductionTotal: number; // Total clearance (20mm)
  firstSlatOffsetX: number; // First slat center X from track start (44.5mm)
  totalCutLengthMeters: number; // Total linear fabric length (m)
  totalCutLengthWithWaste: number; // Fabric with +5% safety allowance (m)
  minCutLength: number;
  maxCutLength: number;
  stepIncrement: number; // Theoretical step per slat
  slats: SlatCalculationItem[];
  costBreakdown: MaterialCostBreakdown;
}
