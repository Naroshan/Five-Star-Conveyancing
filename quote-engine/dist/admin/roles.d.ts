import type { AdminUser } from '../types.js';
export type Permission = 'fee_rules:create' | 'fee_rules:edit' | 'fee_rules:submit_for_review' | 'fee_rules:approve' | 'fee_rules:view' | 'fee_bands:create' | 'fee_bands:edit' | 'fee_bands:submit_for_review' | 'fee_bands:approve' | 'fee_bands:view' | 'disbursements:create' | 'disbursements:edit' | 'disbursements:submit_for_review' | 'disbursements:approve' | 'disbursements:view';
export declare function hasPermission(user: AdminUser, permission: Permission): boolean;
export declare class ForbiddenError extends Error {
    constructor(message: string);
}
export declare function assertPermission(user: AdminUser, permission: Permission): void;
/**
 * Enforces firm-scoped access: a firm_user may only act on records belonging
 * to their own firm. Every other role is firm-agnostic (their access is
 * already limited purely by assertPermission), so this is a no-op for them.
 * Call this in addition to, never instead of, assertPermission.
 */
export declare function assertOwnFirm(user: AdminUser, recordFirmId: string): void;
