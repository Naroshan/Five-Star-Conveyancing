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
    firm_user: RESOURCES.flatMap((r) => permissionsFor(r, ['view'])),
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
