import type { Firm, LineItem, QuoteResult } from '../types.js';
export interface PublicFirmSummary {
    firmId: string;
    legalEntityName: string;
    tradingName: string | null;
    sraNumber: string | null;
}
export interface PublicQuoteResult {
    firm: PublicFirmSummary;
    eligibilityStatus: 'eligible' | 'excluded_with_reason';
    exclusionReason: string | null;
    lineItems: LineItem[];
    legalFeeSubtotal: number;
    vatTotal: number;
    disbursementsTotal: number;
    sdltEstimate: number | null;
    totalEstimate: number | null;
}
export declare function toPublicResult(result: QuoteResult, firmsById: Map<string, Firm>): PublicQuoteResult;
