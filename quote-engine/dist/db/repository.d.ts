import type { Kysely, Selectable } from 'kysely';
import type { Database } from './schema.js';
import type { ClientAnswers, DisbursementRule, FeeRule, FeeValueBand, Firm, FirmRuleSet, QuoteResult, TransactionType } from '../types.js';
export declare function loadFirmsByIds(db: Kysely<Database>, firmIds: string[]): Promise<Map<string, Firm>>;
export declare function loadFirmRuleSet(db: Kysely<Database>, firmId: string, transactionType: TransactionType): Promise<FirmRuleSet | null>;
/**
 * Loads rule sets for every active firm that accepts the given transaction
 * type — the query behind "generate a full comparison result set".
 */
export declare function loadActiveFirmRuleSets(db: Kysely<Database>, transactionType: TransactionType): Promise<FirmRuleSet[]>;
export declare function loadSdltBands(db: Kysely<Database>, jurisdiction: 'england' | 'wales', asOfDate?: string): Promise<{
    jurisdiction: "england" | "wales";
    bandMin: number;
    bandMax: number | null;
    ratePercentage: number;
    reliefType: string | null;
    effectiveDate: string;
    expiryDate: string | null;
    sourceReference: string;
}[]>;
export declare function saveQuote(db: Kysely<Database>, params: {
    quoteReference: string;
    transactionType: TransactionType;
    clientAnswers: ClientAnswers;
    expiryAt: Date;
}): Promise<string>;
export declare function saveQuoteResults(db: Kysely<Database>, quoteId: string, results: QuoteResult[]): Promise<void>;
export declare function getQuoteByReference(db: Kysely<Database>, quoteReference: string): Promise<{
    quoteId: string;
    transactionType: TransactionType;
    clientAnswers: ClientAnswers;
    expiryAt: Date;
    status: 'active' | 'expired' | 'converted';
    results: QuoteResult[];
} | null>;
export declare function markQuoteExpired(db: Kysely<Database>, quoteId: string): Promise<void>;
export declare function mapFirm(row: Selectable<Database['firms']>): Firm;
export declare function mapFeeValueBand(row: Selectable<Database['fee_value_bands']>): FeeValueBand;
export declare function mapFeeRule(row: Selectable<Database['fee_rules']>): FeeRule;
export declare function mapDisbursementRule(row: Selectable<Database['disbursement_rules']>): DisbursementRule;
