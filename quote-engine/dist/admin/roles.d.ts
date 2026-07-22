import type { AdminUser } from '../types.js';
export type Permission = 'fee_rules:create' | 'fee_rules:edit' | 'fee_rules:submit_for_review' | 'fee_rules:approve' | 'fee_rules:view' | 'fee_bands:create' | 'fee_bands:edit' | 'fee_bands:submit_for_review' | 'fee_bands:approve' | 'fee_bands:view' | 'disbursements:create' | 'disbursements:edit' | 'disbursements:submit_for_review' | 'disbursements:approve' | 'disbursements:view';
export declare function hasPermission(user: AdminUser, permission: Permission): boolean;
export declare class ForbiddenError extends Error {
    constructor(message: string);
}
export declare function assertPermission(user: AdminUser, permission: Permission): void;
