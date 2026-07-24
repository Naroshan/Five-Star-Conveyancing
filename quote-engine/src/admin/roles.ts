// Five Star Conveyancing — admin roles and permissions
// Matches the role matrix from Stage 2, Section 9. This module is pure
// logic (no database access) so it's trivial to unit test and reuse across
// every admin-guarded operation, not just fee rules.

import type { AdminRole, AdminUser } from '../types.js';

export type Permission =
  | 'fee_rules:create'
  | 'fee_rules:edit'
  | 'fee_rules:submit_for_review'
  | 'fee_rules:approve'
  | 'fee_rules:view'
  | 'fee_bands:create'
  | 'fee_bands:edit'
  | 'fee_bands:submit_for_review'
  | 'fee_bands:approve'
  | 'fee_bands:view'
  | 'disbursements:create'
  | 'disbursements:edit'
  | 'disbursements:submit_for_review'
  | 'disbursements:approve'
  | 'disbursements:view';

const EDITOR_ACTIONS = ['create', 'edit', 'submit_for_review'] as const;
const RESOURCES = ['fee_rules', 'fee_bands', 'disbursements'] as const;

function permissionsFor(resource: (typeof RESOURCES)[number], actions: readonly string[]): Permission[] {
  return actions.map((action) => `${resource}:${action}` as Permission);
}

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: RESOURCES.flatMap((r) => permissionsFor(r, [...EDITOR_ACTIONS, 'approve', 'view'])),
  fee_administrator: RESOURCES.flatMap((r) => permissionsFor(r, [...EDITOR_ACTIONS, 'view'])),
  compliance_reviewer: RESOURCES.flatMap((r) => permissionsFor(r, ['approve', 'view'])),
  content_editor: [],
  // A firm's own representative can author and submit their own fee data —
  // the same editor actions as fee_administrator — but never 'approve': that
  // stays with compliance_reviewer regardless of firm, so a firm can never
  // approve its own change. Which *firm's* data a firm_user may touch is
  // enforced separately by assertOwnFirm, not by this permission table.
  firm_user: RESOURCES.flatMap((r) => permissionsFor(r, [...EDITOR_ACTIONS, 'view'])),
  lead_management_user: [],
  reporting_user: RESOURCES.flatMap((r) => permissionsFor(r, ['view'])),
};

export function hasPermission(user: AdminUser, permission: Permission): boolean {
  return ROLE_PERMISSIONS[user.role].includes(permission);
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export function assertPermission(user: AdminUser, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new ForbiddenError(`Role '${user.role}' does not have permission '${permission}'.`);
  }
}

/**
 * Enforces firm-scoped access: a firm_user may only act on records belonging
 * to their own firm. Every other role is firm-agnostic (their access is
 * already limited purely by assertPermission), so this is a no-op for them.
 * Call this in addition to, never instead of, assertPermission.
 */
export function assertOwnFirm(user: AdminUser, recordFirmId: string): void {
  if (user.role === 'firm_user' && user.firmId !== recordFirmId) {
    throw new ForbiddenError('You can only manage data belonging to your own firm.');
  }
}
