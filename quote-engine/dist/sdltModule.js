// Five Star Conveyancing — SDLT / LTT module
//
// *** DO NOT USE THE SAMPLE RATES IN THIS FILE IN PRODUCTION ***
// Real Stamp Duty Land Tax (England) and Land Transaction Tax (Wales) rates,
// thresholds, reliefs and effective dates have NOT been supplied and have not
// been invented here. `PLACEHOLDER_TEST_RATES` below uses round, obviously
// fictional numbers purely so the calculation logic can be unit tested.
// Before this module is switched on in production it must be populated from
// `sdlt_ltt_rate_table`, sourced from HMRC / Welsh Revenue Authority and
// verified as current, per the Stage 1 requirement that SDLT is never guessed.
export const PLACEHOLDER_TEST_RATES = [
    {
        jurisdiction: 'england',
        bandMin: 0,
        bandMax: 100_000,
        ratePercentage: 0,
        reliefType: null,
        effectiveDate: '2000-01-01',
        expiryDate: null,
        sourceReference: 'TEST FIXTURE — not a real HMRC rate, for unit tests only',
    },
    {
        jurisdiction: 'england',
        bandMin: 100_000,
        bandMax: 300_000,
        ratePercentage: 2,
        reliefType: null,
        effectiveDate: '2000-01-01',
        expiryDate: null,
        sourceReference: 'TEST FIXTURE — not a real HMRC rate, for unit tests only',
    },
    {
        jurisdiction: 'england',
        bandMin: 300_000,
        bandMax: null,
        ratePercentage: 5,
        reliefType: null,
        effectiveDate: '2000-01-01',
        expiryDate: null,
        sourceReference: 'TEST FIXTURE — not a real HMRC rate, for unit tests only',
    },
];
/**
 * Calculates an indicative tax estimate using marginal (slice) banding —
 * the standard SDLT/LTT calculation shape, regardless of which real rate
 * table is eventually loaded.
 */
export function calculateIndicativeTax(propertyValue, jurisdiction, bands, asOfDate = new Date().toISOString().slice(0, 10)) {
    const applicableBands = bands
        .filter((b) => b.jurisdiction === jurisdiction)
        .filter((b) => b.effectiveDate <= asOfDate && (b.expiryDate === null || b.expiryDate > asOfDate))
        .sort((a, b) => a.bandMin - b.bandMin);
    let remaining = propertyValue;
    let estimate = 0;
    const bandsApplied = [];
    for (const band of applicableBands) {
        if (remaining <= 0)
            break;
        const bandCeiling = band.bandMax ?? Infinity;
        const sliceWidth = Math.max(0, Math.min(propertyValue, bandCeiling) - band.bandMin);
        if (sliceWidth <= 0)
            continue;
        const sliceTaxed = Math.min(sliceWidth, remaining);
        estimate += sliceTaxed * (band.ratePercentage / 100);
        bandsApplied.push(band);
        remaining -= sliceTaxed;
    }
    return { estimate: round2(estimate), bandsApplied };
}
function round2(n) {
    return Math.round(n * 100) / 100;
}
