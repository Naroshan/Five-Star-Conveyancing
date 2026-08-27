// Five Star Conveyancing — real, published Stamp Duty Land Tax (England) and
// Land Transaction Tax (Wales) rates for a homepage estimate tool.
//
// Source: HMRC Stamp Duty Land Tax rates and the Welsh Revenue Authority's
// Land Transaction Tax rates and bands, both as in force from the rate
// changes taking effect 1 April 2025 (England) / December 2024 (Wales
// higher rates), unchanged as of the date this file was last checked
// (27 August 2026). These are official published rates, not invented or
// estimated — see CLAUDE.md's data-integrity rule, which covers SDLT/LTT
// rates specifically. If HMRC or the WRA change these bands, this file
// needs updating and re-verifying against the current gov.uk / WRA pages
// before the site goes on using it.

export type Jurisdiction = "england" | "wales";
export type BuyerType = "standard" | "first_time_buyer" | "additional_property";

interface Band {
  min: number;
  max: number | null; // null = no upper bound
  rate: number; // percentage, e.g. 5 = 5%
}

const ENGLAND_STANDARD: Band[] = [
  { min: 0, max: 125_000, rate: 0 },
  { min: 125_000, max: 250_000, rate: 2 },
  { min: 250_000, max: 925_000, rate: 5 },
  { min: 925_000, max: 1_500_000, rate: 10 },
  { min: 1_500_000, max: null, rate: 12 },
];

// First-time buyer relief only applies to properties up to £500,000 — above
// that, standard rates apply to the whole price (handled in calculateSdlt).
const ENGLAND_FIRST_TIME_BUYER: Band[] = [
  { min: 0, max: 300_000, rate: 0 },
  { min: 300_000, max: 500_000, rate: 5 },
];

// Additional-property surcharge: standard bands + 5 percentage points,
// in force since 31 October 2024.
const ENGLAND_ADDITIONAL_PROPERTY: Band[] = [
  { min: 0, max: 125_000, rate: 5 },
  { min: 125_000, max: 250_000, rate: 7 },
  { min: 250_000, max: 925_000, rate: 10 },
  { min: 925_000, max: 1_500_000, rate: 15 },
  { min: 1_500_000, max: null, rate: 17 },
];

const WALES_STANDARD: Band[] = [
  { min: 0, max: 225_000, rate: 0 },
  { min: 225_000, max: 400_000, rate: 6 },
  { min: 400_000, max: 750_000, rate: 7.5 },
  { min: 750_000, max: 1_500_000, rate: 10 },
  { min: 1_500_000, max: null, rate: 12 },
];

// Wales has never had first-time buyer relief — the higher (additional
// property) rates below are separate bands, not a flat surcharge on the
// standard ones, in force since December 2024.
const WALES_ADDITIONAL_PROPERTY: Band[] = [
  { min: 0, max: 180_000, rate: 5 },
  { min: 180_000, max: 250_000, rate: 8.5 },
  { min: 250_000, max: 400_000, rate: 10 },
  { min: 400_000, max: 750_000, rate: 12.5 },
  { min: 750_000, max: 1_500_000, rate: 15 },
  { min: 1_500_000, max: null, rate: 17 },
];

export interface SdltBandResult {
  min: number;
  max: number | null;
  rate: number;
  taxForBand: number;
}

export interface SdltCalculationResult {
  total: number;
  bands: SdltBandResult[];
  effectiveRate: number; // total as a percentage of property price
}

function applyBands(price: number, bands: Band[]): SdltBandResult[] {
  const applied: SdltBandResult[] = [];
  for (const band of bands) {
    if (price <= band.min) break;
    const ceiling = band.max ?? Infinity;
    const sliceWidth = Math.min(price, ceiling) - band.min;
    if (sliceWidth <= 0) continue;
    const taxForBand = Math.round(sliceWidth * (band.rate / 100) * 100) / 100;
    applied.push({ min: band.min, max: band.max, rate: band.rate, taxForBand });
  }
  return applied;
}

export function calculateSdlt(price: number, jurisdiction: Jurisdiction, buyerType: BuyerType): SdltCalculationResult {
  if (!Number.isFinite(price) || price <= 0) {
    return { total: 0, bands: [], effectiveRate: 0 };
  }

  let bands: Band[];
  if (jurisdiction === "wales") {
    // No first-time buyer relief in Wales — standard bands apply regardless.
    bands = buyerType === "additional_property" ? WALES_ADDITIONAL_PROPERTY : WALES_STANDARD;
  } else {
    if (buyerType === "additional_property") {
      bands = ENGLAND_ADDITIONAL_PROPERTY;
    } else if (buyerType === "first_time_buyer" && price <= 500_000) {
      bands = ENGLAND_FIRST_TIME_BUYER;
    } else {
      bands = ENGLAND_STANDARD;
    }
  }

  const applied = applyBands(price, bands);
  const total = Math.round(applied.reduce((sum, b) => sum + b.taxForBand, 0) * 100) / 100;
  return { total, bands: applied, effectiveRate: price > 0 ? Math.round((total / price) * 1000) / 10 : 0 };
}
