import * as XLSX from 'xlsx';
import { BlindInput, CalculationResult, SlatCalculationItem } from '../types/blind';

export function exportBlindToExcel(
  input: BlindInput,
  result: CalculationResult,
  sortedSlats: SlatCalculationItem[]
): void {
  const wb = XLSX.utils.book_new();

  // 1. Prepare Header and Order Metadata Rows in English
  const rows: (string | number)[][] = [
    ['SLOPED VERTICAL BLIND WORK ORDER & CUTTING SCHEDULE'],
    ['Generated Date', new Date().toLocaleString('en-AU')],
    [],
    ['[1. Job & Order Information]'],
    [
      'Work Order / LOT No.',
      input.orderNo || 'WO-' + Date.now().toString().slice(-6),
      'Project / Job Name',
      input.projectName || 'Standard Project',
    ],
    [
      'Customer / Account',
      input.customerName || 'Standard Client',
      'Order Date',
      input.orderDate || new Date().toISOString().split('T')[0],
    ],
    [
      'Required / Due Date',
      input.deliveryDate || 'TBD',
      'Fabric Code / Colour',
      `${input.fabricCode || 'Standard Fabric'} (${input.fabricColor || 'White'})`,
    ],
    [
      'Control Operation / Side',
      input.controlSide === 'left' ? 'Left Hand Control' : 'Right Hand Control',
      'Stack / Bunch Direction',
      getStackLabelEn(input.stackType),
    ],
    [],
    ['[2. Window Dimensions & Factory Allowances]'],
    ['Overall Window Width (W)', `${input.width} mm`, 'Left Height (HL)', `${input.heightLeft} mm`],
    ['Right Height (HR)', `${input.heightRight} mm`, 'Height Delta (ΔH)', `${result.deltaH} mm`],
    ['Sloped Headrail Cut Length', `${result.railLength} mm`, 'Headrail Slope Angle', `${result.angleDeg}°`],
    ['Fabric Louvre Width', `${input.fabricWidth} mm`, 'Carrier Design Pitch', `${input.pitch} mm`],
    ['Top Rail Deduction (d_top)', `${input.dTop} mm`, 'Bottom Clearance (d_bottom)', `${input.dBottom} mm`],
    ['Top Hanger Fold (f_top)', `${input.fTop} mm`, 'Bottom Weight Pocket (f_bottom)', `${input.fBottom} mm`],
    ['Total Hem Allowance', `${input.fTop + input.fBottom} mm`, 'Actual Carrier Spacing', `${result.actualPitch} mm`],
    [],
    ['[3. Production Summary]'],
    ['Total Slat Quantity', `${result.totalSlats} sheets`, 'Min Cut Length', `${result.minCutLength} mm`],
    ['Max Cut Length', `${result.maxCutLength} mm`, 'Step Delta Increment', `${result.stepIncrement} mm`],
    ['Net Fabric Required', `${result.totalCutLengthMeters} m`, 'Fabric Inc. +5% Waste', `${result.totalCutLengthWithWaste} m`],
    ['Special Instructions / Notes', input.notes || 'None'],
    [],
    ['[4. Slat Cutting Schedule]'],
    [
      'Slat No.',
      'Center X (mm)',
      'Window Height (mm)',
      'Finished Drop (mm)',
      '★ Fabric Cut Length (mm)',
      'Delta Step (mm)',
      'Top Bevel Angle (°)',
      'Rail Position (mm)',
      'Cumulative Fabric (m)',
      'Cutting Status',
    ],
  ];

  let cumulativeMm = 0;
  sortedSlats.forEach((slat) => {
    cumulativeMm += slat.cutLength;
    rows.push([
      slat.index,
      slat.positionX,
      slat.windowHeight,
      slat.finishedHeight,
      slat.cutLength,
      slat.stepDiffFromPrev > 0 ? `+${slat.stepDiffFromPrev}` : slat.stepDiffFromPrev,
      `${slat.bevelAngleDeg}°`,
      slat.carrierDistanceOnRail,
      (cumulativeMm / 1000).toFixed(2),
      slat.isCut ? 'Completed' : 'Pending',
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws['!cols'] = [
    { wch: 14 },
    { wch: 16 },
    { wch: 20 },
    { wch: 20 },
    { wch: 26 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
    { wch: 16 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Cutting_Schedule');

  // 2. Prepare Material Cost & Quotation Sheet in English
  const cost = result.costBreakdown;
  const costRows: (string | number)[][] = [
    ['SLOPED VERTICAL BLIND BILL OF MATERIALS & COST SCHEDULE ($ AUD)'],
    ['Generated Date', new Date().toLocaleString('en-AU')],
    [],
    ['[Job Specification Summary]'],
    ['Project / Job Name', input.projectName || 'Standard Project', 'Customer / Account', input.customerName || 'Standard Client'],
    ['Dimensions (W x HL ~ HR)', `${input.width} x ${input.heightLeft} ~ ${input.heightRight} mm`, 'Slope Angle / Headrail Length', `${result.angleDeg}° / ${result.railLength} mm`],
    ['Total Slats', `${result.totalSlats} sheets`, 'Fabric Spec', `${input.fabricCode || 'Standard Fabric'} (${input.fabricWidth}mm)`],
    [],
    ['[Bill of Materials & Cost Breakdown]'],
    ['Category', 'Item Description', 'Qty', 'Unit', 'Unit Cost ($)', 'Total Amount ($)', 'Basis / Notes'],
    ['Fabric', `Vertical Blind Fabric (${input.fabricWidth}mm)`, cost.fabricBillableMeters, 'm', `$${(cost.fabricCost / cost.fabricBillableMeters).toFixed(2)}`, `$${cost.fabricCost.toFixed(2)}`, 'Based on total linear cut length'],
    ['Headrail', 'Aluminium Sloped Headrail Profile', cost.headrailBillableMeters, 'm', `$${(cost.headrailCost / cost.headrailBillableMeters).toFixed(2)}`, `$${cost.headrailCost.toFixed(2)}`, `${result.railLength}mm sloped rail cut length`],
    ['Component', 'Bottom Weight Plates', result.totalSlats, 'EA', `$${(cost.bottomWeightsCost / result.totalSlats).toFixed(2)}`, `$${cost.bottomWeightsCost.toFixed(2)}`, '1 EA per slat sheet'],
    ['Component', 'Top Hanger Clips', result.totalSlats, 'EA', `$${(cost.topHangersCost / result.totalSlats).toFixed(2)}`, `$${cost.topHangersCost.toFixed(2)}`, '1 EA per slat sheet'],
    ['Component', 'Bottom Link Spacer Chain', result.totalSlats, 'sheets', `$${(cost.bottomChainCost / result.totalSlats).toFixed(2)}`, `$${cost.bottomChainCost.toFixed(2)}`, 'Interlinked at weight bottom'],
    ['Mechanism', 'Sloped Control & Tilt Gear Kit', 1, 'set', `$${cost.controlKitCost.toFixed(2)}`, `$${cost.controlKitCost.toFixed(2)}`, 'Sloped tension gear unit'],
    ['Labor', 'Factory Cutting, Hemming & Assembly Labor', 1, 'set', `$${cost.assemblyLaborCost.toFixed(2)}`, `$${cost.assemblyLaborCost.toFixed(2)}`, 'Complete fabrication & QC'],
  ];

  if (cost.additionalCost > 0) {
    costRows.push(['Hardware', 'Additional Installation Brackets / Parts', 1, 'set', `$${cost.additionalCost.toFixed(2)}`, `$${cost.additionalCost.toFixed(2)}`, 'Site custom brackets']);
  }

  costRows.push(
    [],
    ['[Cost & Quotation Summary]'],
    ['Item', 'Amount ($)', 'Details / Margin'],
    ['Total Net Material Cost', `$${cost.totalMaterialCost.toFixed(2)}`, `Average $${(cost.totalMaterialCost / result.totalSlats).toFixed(2)} per sheet`],
    ['Total Manufacturing Cost (Materials + Labor)', `$${cost.totalManufacturingCost.toFixed(2)}`, 'Direct production cost'],
    ['Wholesale Price Ex GST', `$${cost.suggestedSalePrice.toFixed(2)}`, `Markup margin applied (${cost.suggestedSalePrice > 0 ? 'Margin %' : '0%'})`],
    ['GST (10%)', `$${cost.vatAmount.toFixed(2)}`, 'Australian GST'],
    ['★ Total Quotation Price Inc GST', `$${cost.finalSalePriceWithVat.toFixed(2)}`, 'Final invoice quotation amount ($ AUD)']
  );

  const costWs = XLSX.utils.aoa_to_sheet(costRows);
  costWs['!cols'] = [
    { wch: 14 },
    { wch: 38 },
    { wch: 10 },
    { wch: 10 },
    { wch: 16 },
    { wch: 18 },
    { wch: 34 },
  ];
  XLSX.utils.book_append_sheet(wb, costWs, 'BOM_Cost_Schedule');

  // File name
  const cleanProjectName = (input.projectName || 'SlopedBlind').replace(/[\/\\?%*:|"<> ]/g, '_');
  const fileName = `WorkOrder_${cleanProjectName}_${input.width}x${input.heightLeft}-${input.heightRight}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

function getStackLabelEn(type: string): string {
  switch (type) {
    case 'high_side':
      return 'High Side Stack (Recommended)';
    case 'low_side':
      return 'Low Side Stack';
    case 'split':
      return 'Center Split Draw (Pair)';
    case 'left':
      return 'Left Hand One-Way Stack';
    case 'right':
      return 'Right Hand One-Way Stack';
    default:
      return 'High Side Stack';
  }
}
