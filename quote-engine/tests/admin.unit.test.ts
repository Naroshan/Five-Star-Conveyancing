import { describe, expect, it } from 'vitest';
import { assertPermission, hasPermission, ForbiddenError } from '../src/admin/roles.js';
import type { AdminUser } from '../src/types.js';

function makeUser(role: AdminUser['role']): AdminUser {
  return { userId: `user-${role}`, name: 'Test User', email: `${role}@fixture.test`, role };
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

  it('grants reporting_user and firm_user view only', () => {
    for (const role of ['reporting_user', 'firm_user'] as const) {
      const user = makeUser(role);
      expect(hasPermission(user, 'fee_rules:view')).toBe(true);
      expect(hasPermission(user, 'fee_rules:create')).toBe(false);
      expect(hasPermission(user, 'fee_rules:approve')).toBe(false);
    }
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
