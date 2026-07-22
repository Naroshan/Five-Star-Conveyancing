import type { SdltBand } from './types.js';
export declare const PLACEHOLDER_TEST_RATES: SdltBand[];
/**
 * Calculates an indicative tax estimate using marginal (slice) banding —
 * the standard SDLT/LTT calculation shape, regardless of which real rate
 * table is eventually loaded.
 */
export declare function calculateIndicativeTax(propertyValue: number, jurisdiction: 'england' | 'wales', bands: SdltBand[], asOfDate?: string): {
    estimate: number;
    bandsApplied: SdltBand[];
};
