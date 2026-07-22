import type { Kysely } from 'kysely';
import type { Database } from '../db/schema.js';
import type { AdminUser, FeeRule, TransactionType, VatTreatment } from '../types.js';
export declare class InvalidStateError extends Error {
    constructor(message: string);
}
export interface CreateFeeRuleInput {
    firmId: string;
    transactionType: TransactionType;
    chargeName: string;
    chargeType: 'base_fee' | 'supplement';
    triggerKey: string | null;
    calculationType: 'fixed' | 'formula';
    amount: number | null;
    minAmount: number | null;
    maxAmount: number | null;
    formulaExpression: string | null;
    vatTreatment: VatTreatment;
    isGuaranteed: boolean;
    isEstimated: boolean;
    effectiveDate: string;
    expiryDate: string | null;
    displayOrder: number;
    clientFacingExplanation: string;
    /** If this rule is replacing an existing approved rule, reference it here — its expiry_date is set automatically when this rule is approved. */
    supersedesFeeRuleId?: string;
}
export type UpdateFeeRuleInput = Partial<Pick<CreateFeeRuleInput, 'chargeName' | 'triggerKey' | 'calculationType' | 'amount' | 'minAmount' | 'maxAmount' | 'formulaExpression' | 'vatTreatment' | 'isGuaranteed' | 'isEstimated' | 'effectiveDate' | 'expiryDate' | 'displayOrder' | 'clientFacingExplanation'>>;
export declare function createFeeRuleDraft(db: Kysely<Database>, user: AdminUser, input: CreateFeeRuleInput): Promise<FeeRule>;
export declare function updateFeeRuleDraft(db: Kysely<Database>, user: AdminUser, feeRuleId: string, updates: UpdateFeeRuleInput): Promise<FeeRule>;
export declare function submitFeeRuleForReview(db: Kysely<Database>, user: AdminUser, feeRuleId: string): Promise<FeeRule>;
export declare function approveFeeRule(db: Kysely<Database>, user: AdminUser, feeRuleId: string): Promise<FeeRule>;
export declare function rejectFeeRule(db: Kysely<Database>, user: AdminUser, feeRuleId: string, reason: string): Promise<FeeRule>;
export declare function getFeeRuleById(db: Kysely<Database>, user: AdminUser, feeRuleId: string): Promise<FeeRule>;
export declare function listPendingFeeRuleApprovals(db: Kysely<Database>, user: AdminUser): Promise<FeeRule[]>;
