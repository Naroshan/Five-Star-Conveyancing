// Five Star Conveyancing — admin roles and permissions
// Matches the role matrix from Stage 2, Section 9. This module is pure
// logic (no database access) so it's trivial to unit test and reuse across
// every admin-guarded operation, not just fee rules.
const EDITOR_ACTIONS = ['create', 'edit', 'submit_for_review'];
const RESOURCES = ['fee_rules', 'fee_bands', 'disbursements'];
function permissionsFor(resource, actions) {
    return actions.map((action) => `${resource}:${action}`);
}
const ROLE_PERMISSIONS = {
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
export function hasPermission(user, permission) {
    return ROLE_PERMISSIONS[user.role].includes(permission);
}
export class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ForbiddenError';
    }
}
export function assertPermission(user, permission) {
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
export function assertOwnFirm(user, recordFirmId) {
    if (user.role === 'firm_user' && user.firmId !== recordFirmId) {
        throw new ForbiddenError('You can only manage data belonging to your own firm.');
    }
}
