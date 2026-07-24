import { describe, expect, it } from 'vitest';
import { assertOwnFirm, assertPermission, hasPermission, ForbiddenError } from '../src/admin/roles.js';
import type { AdminUser } from '../src/types.js';

function makeUser(role: AdminUser['role'], firmId?: string): AdminUser {
  return { userId: `user-${role}`, name: 'Test User', email: `${role}@fixture.test`, role, firmId };
}

describe('hasPermission', () => {
  it('grants fee_administrator create/edit/submit but not approve', () => {
    const user = makeUser('fee_administrator');
    expect(hasPermission(user, 'fee_rules:create')).toBe(true);
    expect(hasPermission(user, 'fee_rules:edit')).toBe(true);
    expect(hasPermission(user, 'fee_rules:submit_for_review')).toBe(true);
    expect(hasPermission(user, 'fee_rules:approve')).toBe(false);
  });

  it('grants compliance_reviewer approve and view but not create/edit', () => {
    const user = makeUser('compliance_reviewer');
    expect(hasPermission(user, 'fee_rules:approve')).toBe(true);
    expect(hasPermission(user, 'fee_rules:view')).toBe(true);
    expect(hasPermission(user, 'fee_rules:create')).toBe(false);
    expect(hasPermission(user, 'fee_rules:edit')).toBe(false);
  });

  it('grants super_admin everything', () => {
    const user = makeUser('super_admin');
    expect(hasPermission(user, 'fee_rules:create')).toBe(true);
    expect(hasPermission(user, 'fee_rules:approve')).toBe(true);
  });

  it('grants reporting_user view only', () => {
    const user = makeUser('reporting_user');
    expect(hasPermission(user, 'fee_rules:view')).toBe(true);
    expect(hasPermission(user, 'fee_rules:create')).toBe(false);
    expect(hasPermission(user, 'fee_rules:approve')).toBe(false);
  });

  it('grants firm_user create/edit/submit/view but never approve — same editor actions as fee_administrator, scoped separately by firm', () => {
    const user = makeUser('firm_user');
    expect(hasPermission(user, 'fee_rules:create')).toBe(true);
    expect(hasPermission(user, 'fee_rules:edit')).toBe(true);
    expect(hasPermission(user, 'fee_rules:submit_for_review')).toBe(true);
    expect(hasPermission(user, 'fee_rules:view')).toBe(true);
    expect(hasPermission(user, 'fee_rules:approve')).toBe(false);
  });

  it('grants content_editor and lead_management_user nothing on fee rules', () => {
    for (const role of ['content_editor', 'lead_management_user'] as const) {
      const user = makeUser(role);
      expect(hasPermission(user, 'fee_rules:view')).toBe(false);
      expect(hasPermission(user, 'fee_rules:create')).toBe(false);
    }
  });
});

describe('assertPermission', () => {
  it('does not throw when the role has the permission', () => {
    expect(() => assertPermission(makeUser('super_admin'), 'fee_rules:create')).not.toThrow();
  });

  it('throws ForbiddenError when the role lacks the permission', () => {
    expect(() => assertPermission(makeUser('content_editor'), 'fee_rules:create')).toThrow(ForbiddenError);
  });
});

describe('assertOwnFirm', () => {
  it('allows a firm_user to act on their own firm\'s records', () => {
    const user = makeUser('firm_user', 'firm-a');
    expect(() => assertOwnFirm(user, 'firm-a')).not.toThrow();
  });

  it('blocks a firm_user from acting on another firm\'s records', () => {
    const user = makeUser('firm_user', 'firm-a');
    expect(() => assertOwnFirm(user, 'firm-b')).toThrow(ForbiddenError);
  });

  it('is a no-op for non-firm_user roles regardless of firmId', () => {
    for (const role of ['super_admin', 'fee_administrator', 'compliance_reviewer', 'reporting_user'] as const) {
      const user = makeUser(role);
      expect(() => assertOwnFirm(user, 'any-firm-id')).not.toThrow();
    }
  });
});
