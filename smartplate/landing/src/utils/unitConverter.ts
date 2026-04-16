// unitConverter.ts
// Precision unit conversion logic for metabolic tracking.

export type UnitType = 'mass' | 'volume' | 'count';

export const UNIT_MAP: Record<string, { type: UnitType; toBase: number }> = {
  // Mass (Base: g)
  g: { type: 'mass', toBase: 1 },
  oz: { type: 'mass', toBase: 28.3495 },
  kg: { type: 'mass', toBase: 1000 },
  lb: { type: 'mass', toBase: 453.592 },

  // Volume (Base: ml)
  ml: { type: 'volume', toBase: 1 },
  l: { type: 'volume', toBase: 1000 },
  L: { type: 'volume', toBase: 1000 },
  'fl oz': { type: 'volume', toBase: 29.5735 },
  cup: { type: 'volume', toBase: 240 },

  // Count (Base: unit)
  pcs: { type: 'count', toBase: 1 },
  slice: { type: 'count', toBase: 1 },
  wrap: { type: 'count', toBase: 1 },
  plate: { type: 'count', toBase: 1 },
  eggs: { type: 'count', toBase: 1 },
  tacos: { type: 'count', toBase: 1 },
  skewers: { type: 'count', toBase: 1 },
  apple: { type: 'count', toBase: 1 },
  omelette: { type: 'count', toBase: 1 },
  bowl: { type: 'count', toBase: 1 },
};

export interface Macros {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

/**
 * Scales nutritional values based on quantity and unit changes.
 * @param baseMacros - The nutritional values for the base quantity/unit.
 * @param baseQty - The reference quantity (e.g., 100).
 * @param baseUnit - The reference unit (e.g., 'g').
 * @param targetQty - The new quantity.
 * @param targetUnit - The new unit.
 */
export function scaleMacros(
  baseMacros: Macros,
  baseQty: number,
  baseUnit: string,
  targetQty: number,
  targetUnit: string
): Macros {
  const from = UNIT_MAP[baseUnit] || { type: 'count', toBase: 1 };
  const to = UNIT_MAP[targetUnit] || { type: 'count', toBase: 1 };

  // If types don't match (e.g., mass to volume), we fallback to 1:1 ratio
  // unless we have specific density data (which we don't in this simple model).
  let ratio: number;

  if (from.type === to.type) {
    // Both are same type (e.g., both mass), convert via base
    const baseAmount = targetQty * to.toBase;
    const refAmount = baseQty * from.toBase;
    ratio = baseAmount / refAmount;
  } else {
    // Incompatible types, use a raw quantity ratio
    ratio = targetQty / baseQty;
  }

  return {
    calories: Math.round(baseMacros.calories * ratio * 10) / 10,
    proteinG: Math.round(baseMacros.proteinG * ratio * 10) / 10,
    carbsG: Math.round(baseMacros.carbsG * ratio * 10) / 10,
    fatG: Math.round(baseMacros.fatG * ratio * 10) / 10,
    fiberG: Math.round(baseMacros.fiberG * ratio * 10) / 10,
  };
}

export function getUnitOptions(unit: string): string[] {
  const type = UNIT_MAP[unit]?.type;
  if (!type) return [unit];

  return Object.keys(UNIT_MAP).filter((u) => UNIT_MAP[u].type === type);
}
