import type { Kysely } from 'kysely';
import type { Database } from '../db/schema.js';
import type { AdminUser, BoundaryRule, FeeValueBand, TransactionType } from '../types.js';
export interface CreateFeeValueBandInput {
    firmId: string;
    transactionType: TransactionType;
    valueMin: number;
    valueMax: number | null;
    boundaryRule: BoundaryRule;
    baseFee: number;
    effectiveDate: string;
    expiryDate: string | null;
    supersedesBandId?: string;
}
export type UpdateFeeValueBandInput = Partial<Pick<CreateFeeValueBandInput, 'valueMin' | 'valueMax' | 'boundaryRule' | 'baseFee' | 'effectiveDate' | 'expiryDate'>>;
export declare function createFeeValueBandDraft(db: Kysely<Database>, user: AdminUser, input: CreateFeeValueBandInput): Promise<FeeValueBand>;
export declare function updateFeeValueBandDraft(db: Kysely<Database>, user: AdminUser, bandId: string, updates: UpdateFeeValueBandInput): Promise<FeeValueBand>;
export declare function submitFeeValueBandForReview(db: Kysely<Database>, user: AdminUser, bandId: string): Promise<FeeValueBand>;
export declare function approveFeeValueBand(db: Kysely<Database>, user: AdminUser, bandId: string): Promise<FeeValueBand>;
export declare function rejectFeeValueBand(db: Kysely<Database>, user: AdminUser, bandId: string, reason: string): Promise<FeeValueBand>;
export declare function getFeeValueBandById(db: Kysely<Database>, user: AdminUser, bandId: string): Promise<FeeValueBand>;
export declare function listPendingFeeValueBandApprovals(db: Kysely<Database>, user: AdminUser): Promise<FeeValueBand[]>;
