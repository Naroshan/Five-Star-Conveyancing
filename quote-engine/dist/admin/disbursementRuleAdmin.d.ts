import type { Kysely } from 'kysely';
import type { Database } from '../db/schema.js';
import type { AdminUser, DisbursementRule, TransactionType, VatTreatment } from '../types.js';
export interface CreateDisbursementRuleInput {
    firmId: string;
    transactionType: TransactionType;
    chargeName: string;
    category: string;
    amountType: 'fixed' | 'estimated_range' | 'excluded';
    amount: number | null;
    minAmount: number | null;
    maxAmount: number | null;
    vatTreatment: VatTreatment;
    conditionalTriggerExpression: string | null;
    effectiveDate: string;
    expiryDate: string | null;
    displayOrder: number;
    clientFacingExplanation: string;
    supersedesDisbursementId?: string;
}
export type UpdateDisbursementRuleInput = Partial<Pick<CreateDisbursementRuleInput, 'chargeName' | 'category' | 'amountType' | 'amount' | 'minAmount' | 'maxAmount' | 'vatTreatment' | 'conditionalTriggerExpression' | 'effectiveDate' | 'expiryDate' | 'displayOrder' | 'clientFacingExplanation'>>;
export declare function createDisbursementRuleDraft(db: Kysely<Database>, user: AdminUser, input: CreateDisbursementRuleInput): Promise<DisbursementRule>;
export declare function updateDisbursementRuleDraft(db: Kysely<Database>, user: AdminUser, disbursementId: string, updates: UpdateDisbursementRuleInput): Promise<DisbursementRule>;
export declare function submitDisbursementRuleForReview(db: Kysely<Database>, user: AdminUser, disbursementId: string): Promise<DisbursementRule>;
export declare function approveDisbursementRule(db: Kysely<Database>, user: AdminUser, disbursementId: string): Promise<DisbursementRule>;
export declare function rejectDisbursementRule(db: Kysely<Database>, user: AdminUser, disbursementId: string, reason: string): Promise<DisbursementRule>;
export declare function getDisbursementRuleById(db: Kysely<Database>, user: AdminUser, disbursementId: string): Promise<DisbursementRule>;
export declare function listPendingDisbursementRuleApprovals(db: Kysely<Database>, user: AdminUser): Promise<DisbursementRule[]>;
