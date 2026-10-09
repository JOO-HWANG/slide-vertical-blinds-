import { BlindInput, CalculationResult, SlatCalculationItem, MaterialCostConfig, MaterialCostBreakdown } from '../types/blind';

export const DEFAULT_COST_CONFIG: MaterialCostConfig = {
  currency: 'AUD',
  fabricCostPerMeter: 4.5, // Fabric cost per meter ($4.50/m)
  useWasteLengthForCost: true, // Use length with +5% waste allowance
  headrailCostPerMeter: 16.0, // Aluminum sloped headrail cost per meter ($16.00/m)
  bottomWeightCostPerUnit: 0.45, // Bottom weight plate ($0.45/pc)
  topHangerCostPerUnit: 0.25, // Top hanger hook ($0.25/pc)
  bottomChainCostPerUnit: 0.2, // Bottom link chain ($0.20/slat)
  slopedControlKitCost: 18.0, // Sloped tilt gear and control mechanism kit ($18.00/set)
  assemblyLaborCost: 25.0, // Assembly & cutting labor ($25.00/set)
  additionalCost: 0, // Extra hardware
  additionalCostLabel: 'Sloped Track Mounting Brackets',
  marginPercent: 30, // Margin 30%
  includeVat: true, // AU GST 10%
};

export function formatCurrency(amount: number): string {
  return '$' + (Number(amount) || 0).toLocaleString('en-AU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const formatUSD = formatCurrency;

export function computeCostBreakdown(
  totalSlats: number,
  railLengthMm: number,
  totalCutMeters: number,
  totalCutMetersWithWaste: number,
  costConfig: MaterialCostConfig
): MaterialCostBreakdown {
  const fabricBillableMeters = costConfig.useWasteLengthForCost
    ? totalCutMetersWithWaste
    : totalCutMeters;
  const fabricCost = Number((fabricBillableMeters * (costConfig.fabricCostPerMeter || 0)).toFixed(2));

  const headrailBillableMeters = Number((railLengthMm / 1000).toFixed(2));
  const headrailCost = Number((headrailBillableMeters * (costConfig.headrailCostPerMeter || 0)).toFixed(2));

  const bottomWeightsCost = Number((totalSlats * (costConfig.bottomWeightCostPerUnit || 0)).toFixed(2));
  const topHangersCost = Number((totalSlats * (costConfig.topHangerCostPerUnit || 0)).toFixed(2));
  const bottomChainCost = Number((totalSlats * (costConfig.bottomChainCostPerUnit || 0)).toFixed(2));
  const accessoriesSubtotal = Number((bottomWeightsCost + topHangersCost + bottomChainCost).toFixed(2));

  const controlKitCost = Number((costConfig.slopedControlKitCost || 0).toFixed(2));
  const assemblyLaborCost = Number((costConfig.assemblyLaborCost || 0).toFixed(2));
  const additionalCost = Number((costConfig.additionalCost || 0).toFixed(2));

  const totalMaterialCost = Number((
    fabricCost + headrailCost + accessoriesSubtotal + controlKitCost + additionalCost
  ).toFixed(2));

  const totalManufacturingCost = Number((totalMaterialCost + assemblyLaborCost).toFixed(2));

  const marginFactor = 1 + (costConfig.marginPercent || 0) / 100;
  const suggestedSalePrice = Number((totalManufacturingCost * marginFactor).toFixed(2));

  const vatAmount = costConfig.includeVat ? Number((suggestedSalePrice * 0.1).toFixed(2)) : 0;
  const finalSalePriceWithVat = Number((suggestedSalePrice + vatAmount).toFixed(2));

  return {
    fabricCost,
    fabricBillableMeters,
    headrailCost,
    headrailBillableMeters,
    bottomWeightsCost,
    topHangersCost,
    bottomChainCost,
    accessoriesSubtotal,
    controlKitCost,
    assemblyLaborCost,
    additionalCost,
    totalMaterialCost,
    totalManufacturingCost,
    suggestedSalePrice,
    vatAmount,
    finalSalePriceWithVat,
  };
}

export function calculateBlind(
  input: BlindInput,
  cutStatusMap: Record<number, boolean> = {},
  costConfig: MaterialCostConfig = DEFAULT_COST_CONFIG
): CalculationResult {
  const W = Math.max(100, Number(input.width) || 100);
  const HL = Math.max(100, Number(input.heightLeft) || 100);
  const HR = Math.max(100, Number(input.heightRight) || 100);
  const pitch = Math.max(30, Number(input.pitch) || 76);
  const dTop = Math.max(0, Number(input.dTop) || 0);
  const dBottom = Math.max(0, Number(input.dBottom) || 0);
  const fTop = Math.max(0, Number(input.fTop) || 0);
  const fBottom = Math.max(0, Number(input.fBottom) || 0);
  const totalHemAllowance = fTop + fBottom;

  const N = Math.max(1, Math.ceil(W / pitch));
  const pActual = W / N;

  const deltaH = HR - HL;
  const angleRad = Math.atan(Math.abs(deltaH) / W);
  const angleDeg = Number((angleRad * (180 / Math.PI)).toFixed(1));

  let railLength = 0;
  if (input.shapeType === 'gable_peak') {
    const peakX = W * (input.gablePeakRatio || 0.5);
    const peakH = Math.max(HL, HR, Number(input.gablePeakHeight) || Math.max(HL, HR) + 300);
    const leftSlope = Math.sqrt(Math.pow(peakX, 2) + Math.pow(peakH - HL, 2));
    const rightSlope = Math.sqrt(Math.pow(W - peakX, 2) + Math.pow(peakH - HR, 2));
    railLength = Number((leftSlope + rightSlope).toFixed(1));
  } else {
    railLength = Number(Math.sqrt(Math.pow(W, 2) + Math.pow(deltaH, 2)).toFixed(1));
  }

  const slats: SlatCalculationItem[] = [];
  let prevCutLength = 0;

  for (let k = 1; k <= N; k++) {
    const xK = (k - 0.5) * pActual;
    let hWinK = HL;
    let localAngle = angleDeg;

    if (input.shapeType === 'gable_peak') {
      const peakX = W * (input.gablePeakRatio || 0.5);
      const peakH = Math.max(HL, HR, Number(input.gablePeakHeight) || Math.max(HL, HR) + 300);
      if (xK <= peakX) {
        hWinK = HL + ((peakH - HL) / peakX) * xK;
        const rad = Math.atan(Math.abs(peakH - HL) / peakX);
        localAngle = Number((rad * (180 / Math.PI)).toFixed(1));
      } else {
        hWinK = peakH + ((HR - peakH) / (W - peakX)) * (xK - peakX);
        const rad = Math.atan(Math.abs(HR - peakH) / (W - peakX));
        localAngle = Number((rad * (180 / Math.PI)).toFixed(1));
      }
    } else if (input.shapeType === 'level') {
      hWinK = HL;
      localAngle = 0;
    } else {
      hWinK = HL + (deltaH / W) * xK;
    }

    const hFinished = Math.max(50, Math.round(hWinK - dTop - dBottom));
    const hCut = Math.round(hFinished + totalHemAllowance);
    const stepDiff = k === 1 ? 0 : Math.round(hCut - prevCutLength);
    prevCutLength = hCut;

    // Carrier rail coordinate
    let carrierRailDist = 0;
    if (input.shapeType !== 'gable_peak') {
      const cosVal = Math.cos(angleRad);
      carrierRailDist = cosVal > 0 ? Number((xK / cosVal).toFixed(1)) : xK;
    } else {
      carrierRailDist = Number(xK.toFixed(1));
    }

    slats.push({
      id: k,
      index: k,
      positionX: Number(xK.toFixed(1)),
      windowHeight: Math.round(hWinK),
      finishedHeight: hFinished,
      cutLength: hCut,
      bevelAngleDeg: localAngle,
      stepDiffFromPrev: stepDiff,
      carrierDistanceOnRail: carrierRailDist,
      isCut: !!cutStatusMap[k],
    });
  }

  const cutLengths = slats.map((s) => s.cutLength);
  const minCutLength = cutLengths.length ? Math.min(...cutLengths) : 0;
  const maxCutLength = cutLengths.length ? Math.max(...cutLengths) : 0;
  const totalCutLengthMm = cutLengths.reduce((acc, curr) => acc + curr, 0);
  const totalCutLengthMeters = Number((totalCutLengthMm / 1000).toFixed(2));
  const totalCutLengthWithWaste = Number((totalCutLengthMeters * 1.05).toFixed(2));
  const stepIncrement = N > 1 ? Number(((maxCutLength - minCutLength) / (N - 1)).toFixed(1)) : 0;

  const costBreakdown = computeCostBreakdown(
    N,
    railLength,
    totalCutLengthMeters,
    totalCutLengthWithWaste,
    costConfig
  );

  return {
    totalSlats: N,
    actualPitch: Number(pActual.toFixed(1)),
    deltaH: Math.round(deltaH),
    angleDeg,
    railLength,
    totalCutLengthMeters,
    totalCutLengthWithWaste,
    minCutLength,
    maxCutLength,
    stepIncrement,
    slats,
    costBreakdown,
  };
}

export const PRESET_JOBS: Array<{ name: string; desc: string; input: Partial<BlindInput> }> = [
  {
    name: 'Standard Attic Sloped Window',
    desc: 'W:2,000 / HL:1,500 / HR:2,100 / Right-High / 89mm Louvre',
    input: {
      width: 2000,
      heightLeft: 1500,
      heightRight: 2100,
      fabricWidth: 89,
      shapeType: 'right_high',
      pitch: 76,
      dTop: 45,
      dBottom: 15,
      fTop: 20,
      fBottom: 50,
      projectName: 'Loft Residence Master Bed',
      customerName: 'Coastal Living Interiors',
      fabricCode: 'VS-301 Ivory 3% Sunscreen',
      fabricColor: 'Ivory',
      notes: 'Bunch towards high side (right). Supply sloped top mounting brackets.',
    },
  },
  {
    name: 'High Ceiling Rake Window',
    desc: 'W:3,200 / HL:2,400 / HR:3,400 / Right-High / 89mm Louvre',
    input: {
      width: 3200,
      heightLeft: 2400,
      heightRight: 3400,
      fabricWidth: 89,
      shapeType: 'right_high',
      pitch: 76,
      dTop: 45,
      dBottom: 20,
      fTop: 20,
      fBottom: 50,
      projectName: 'Double Height Living Room A',
      customerName: 'Design Object Studio',
      fabricCode: 'SV-702 Blockout Sand Beige',
      fabricColor: 'Sand Beige',
      notes: 'Heavy blockout fabric. Test motor/cord tension on high slope.',
    },
  },
  {
    name: 'Staircase Steep Slope',
    desc: 'W:1,600 / HL:2,600 / HR:1,400 / Left-High / 89mm Louvre',
    input: {
      width: 1600,
      heightLeft: 2600,
      heightRight: 1400,
      fabricWidth: 89,
      shapeType: 'left_high',
      pitch: 76,
      dTop: 45,
      dBottom: 15,
      fTop: 20,
      fBottom: 50,
      projectName: 'Townhouse Stair Void Sloped Window',
      customerName: 'Home Styling Lab',
      fabricCode: 'LS-102 Natural White Translucent',
      fabricColor: 'Natural White',
      notes: 'Left high side stack. Ensure bottom chain spacing is tight.',
    },
  },
  {
    name: 'Gable Peak / Cathedral Window',
    desc: 'W:2,800 / HL:1,600 / HR:1,600 / Peak:2,500 / 89mm',
    input: {
      width: 2800,
      heightLeft: 1600,
      heightRight: 1600,
      gablePeakHeight: 2500,
      gablePeakRatio: 0.5,
      shapeType: 'gable_peak',
      pitch: 76,
      dTop: 45,
      dBottom: 15,
      fTop: 20,
      fBottom: 50,
      projectName: 'Alpine Chalet Cathedral Apex Window',
      customerName: 'Forest Retreat',
      fabricCode: 'SC-805 Charcoal Grey',
      fabricColor: 'Charcoal Grey',
      notes: 'Apex center split track. Center junction bracket required.',
    },
  },
  {
    name: 'Commercial 127mm Wide Louvre',
    desc: 'W:3,600 / HL:1,800 / HR:2,700 / 127mm Commercial Louvre',
    input: {
      width: 3600,
      heightLeft: 1800,
      heightRight: 2700,
      fabricWidth: 127,
      shapeType: 'right_high',
      pitch: 115,
      dTop: 50,
      dBottom: 20,
      fTop: 25,
      fBottom: 60,
      projectName: 'Commercial Showroom Facade',
      customerName: 'Apex Architecture',
      fabricCode: 'CW-127 Heavy Linen Oatmeal',
      fabricColor: 'Oatmeal',
      notes: '127mm wide louvre carriers. Reinforce top track anchors.',
    },
  },
];
