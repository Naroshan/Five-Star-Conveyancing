// Five Star Conveyancing — shared public API result shaping
// Used by both createQuote.ts and getQuote.ts so the two endpoints can never
// drift into returning different shapes for the same underlying data.
//
// Adds firm display data (legal/trading name, SRA number) that QuoteResult
// alone doesn't carry — without this, the results page would have nothing
// to show next to each result but a bare firmId. calculationAudit is
// deliberately still omitted (internal reproducibility/compliance data, not
// client-facing).
export function toPublicResult(result, firmsById) {
    const firm = firmsById.get(result.firmId);
    // Should be unreachable — quote_results.firm_id has a foreign-key
    // constraint against firms — but a display fallback is cheap insurance
    // against ever crashing a results page over a data anomaly.
    const firmSummary = firm
        ? { firmId: firm.firmId, legalEntityName: firm.legalEntityName, tradingName: firm.tradingName, sraNumber: firm.sraNumber }
        : { firmId: result.firmId, legalEntityName: 'Firm details unavailable', tradingName: null, sraNumber: null };
    return {
        firm: firmSummary,
        eligibilityStatus: result.eligibilityStatus,
        exclusionReason: result.exclusionReason,
        lineItems: result.lineItems,
        legalFeeSubtotal: result.legalFeeSubtotal,
        vatTotal: result.vatTotal,
        disbursementsTotal: result.disbursementsTotal,
        sdltEstimate: result.sdltEstimate,
        totalEstimate: result.totalEstimate,
    };
}
