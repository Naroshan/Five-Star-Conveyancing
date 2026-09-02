// Five Star Conveyancing — one-off admin account provisioning.
// Prompts for the password interactively (stdin) rather than taking it as a
// CLI argument or environment variable, so it never lands in shell history
// and is never seen by anyone but whoever is sitting at this terminal.
//
// Usage: DATABASE_URL=<production> npx tsx scripts/provision-admin.ts "Full Name" "email@example.com" super_admin

import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { createDb } from '../src/db/client.js';
import { provisionAdminUser } from '../src/auth/provisioning.js';
import { MIN_PASSWORD_LENGTH } from '../src/auth/password.js';
import type { AdminRole } from '../src/types.js';

const VALID_ROLES: AdminRole[] = [
  'super_admin',
  'content_editor',
  'fee_administrator',
  'compliance_reviewer',
  'firm_user',
  'lead_management_user',
  'reporting_user',
];

async function main() {
  const [name, email, role] = process.argv.slice(2);
  if (!name || !email || !role) {
    throw new Error('Usage: npx tsx scripts/provision-admin.ts "Full Name" "email@example.com" <role>');
  }
  if (!VALID_ROLES.includes(role as AdminRole)) {
    throw new Error(`Role must be one of: ${VALID_ROLES.join(', ')}`);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Set DATABASE_URL before running this script.');
  }
  const db = createDb(connectionString);

  const rl = createInterface({ input: stdin, output: stdout });
  const password = await rl.question(`Password for ${email} (min ${MIN_PASSWORD_LENGTH} chars, not shown anywhere but here): `);
  rl.close();

  const user = await provisionAdminUser(db, { name, email, role: role as AdminRole, password });

  console.log('Admin account created:');
  console.log(`  userId: ${user.userId}`);
  console.log(`  name:   ${user.name}`);
  console.log(`  email:  ${user.email}`);
  console.log(`  role:   ${user.role}`);
  console.log();
  console.log('Log in at /admin/login with this email and the password you just entered.');
  console.log('You will be sent to /admin/mfa-setup on first login — MFA is required before the account can be used.');

  await db.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
