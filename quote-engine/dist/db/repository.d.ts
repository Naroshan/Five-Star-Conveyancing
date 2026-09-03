import type { Kysely, Selectable } from 'kysely';
import type { Database } from './schema.js';
import type { ClientAnswers, DisbursementRule, FeeRule, FeeValueBand, Firm, FirmRuleSet, QuoteContact, QuoteResult, TransactionType } from '../types.js';
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
    /** Only present when collected up front (the full get-a-quote form); the homepage's condensed widget doesn't collect it until firm selection. */
    contact?: QuoteContact;
}): Promise<string>;
export declare function saveQuoteResults(db: Kysely<Database>, quoteId: string, results: QuoteResult[]): Promise<void>;
export declare function getQuoteByReference(db: Kysely<Database>, quoteReference: string): Promise<{
    quoteId: string;
    transactionType: TransactionType;
    clientAnswers: ClientAnswers;
    expiryAt: Date;
    status: 'active' | 'expired' | 'converted';
    contact: QuoteContact | null;
    results: QuoteResult[];
} | null>;
export interface LeadSummary {
    quoteReference: string;
    transactionType: TransactionType;
    status: 'active' | 'expired' | 'converted';
    contact: QuoteContact;
    selectedFirmId: string | null;
    createdAt: Date;
}
/**
 * Quotes that have contact details attached — i.e. actual leads, not just
 * anonymous quote requests. Ordered newest first. This is the durable record
 * `lead_management_user` exists to manage (see admin/leadAdmin.ts) — the
 * Formspree notification is a secondary, best-effort alert, not the record.
 */
export declare function listRecentLeads(db: Kysely<Database>, limit?: number): Promise<LeadSummary[]>;
export interface SdltCalculatorLeadInput {
    email: string;
    price: number;
    jurisdiction: 'england' | 'wales';
    buyerType: 'standard' | 'first_time_buyer' | 'additional_property';
}
export declare function saveSdltCalculatorLead(db: Kysely<Database>, input: SdltCalculatorLeadInput): Promise<void>;
export interface SdltCalculatorLeadSummary extends SdltCalculatorLeadInput {
    leadId: string;
    createdAt: Date;
}
export declare function listRecentSdltCalculatorLeads(db: Kysely<Database>, limit?: number): Promise<SdltCalculatorLeadSummary[]>;
export declare function markQuoteExpired(db: Kysely<Database>, quoteId: string): Promise<void>;
/**
 * Records the client's "Select this firm" choice. Only transitions a quote
 * that's currently 'active' — already-converted or expired quotes are left
 * untouched. Returns whether the update actually applied so the caller (the
 * API handler, which already knows the eligibility/expiry rules) can tell
 * "already converted" apart from "not found" apart from "succeeded".
 */
export declare function selectQuoteFirm(db: Kysely<Database>, quoteId: string, firmId: string, contact: QuoteContact): Promise<{
    updated: boolean;
}>;
export declare function mapFirm(row: Selectable<Database['firms']>): Firm;
export declare function mapFeeValueBand(row: Selectable<Database['fee_value_bands']>): FeeValueBand;
export declare function mapFeeRule(row: Selectable<Database['fee_rules']>): FeeRule;
export declare function mapDisbursementRule(row: Selectable<Database['disbursement_rules']>): DisbursementRule;
