import type { ClientAnswers, FirmRuleSet, QuoteResult, SdltBand } from './types.js';
export interface CalculateQuoteOptions {
    sdltBands?: SdltBand[];
    jurisdiction?: 'england' | 'wales';
    asOfDate?: string;
    vatRate?: number;
}
export declare function calculateQuotesForFirms(ruleSets: FirmRuleSet[], answers: ClientAnswers, options?: CalculateQuoteOptions): QuoteResult[];
export declare function calculateQuoteForFirm(ruleSet: FirmRuleSet, answers: ClientAnswers, options?: CalculateQuoteOptions): QuoteResult;
