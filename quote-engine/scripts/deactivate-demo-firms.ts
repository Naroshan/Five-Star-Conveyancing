// Five Star Conveyancing — remove fictional demo firms from a live database
//
// seed-demo-database.ts creates fictional firms suffixed "(DEMO)" (Meridian
// Property Law, Northgate Conveyancing) for local/demo use. If that script
// was ever run against a database that's now going live with real firm
// data (e.g. Ackroyd Legal), those fictional firms need to stop being
// shown to real consumers. Setting status = 'removed' (rather than
// deleting the rows) keeps their fee history intact for anyone who already
// has a quote referencing them, while loadActiveFirmRuleSets' status =
// 'active' filter means they never appear in a new comparison again.

import { createDb } from '../src/db/client.js';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || !connectionString.includes('five_star_data')) {
    throw new Error('Refusing to run: DATABASE_URL must point at five_star_data.');
  }
  const db = createDb(connectionString);

  const demoFirms = await db.selectFrom('firms').selectAll().where('legal_entity_name', 'like', '%(DEMO)%').execute();

  for (const firm of demoFirms) {
    await db.updateTable('firms').set({ status: 'removed', updated_at: new Date() }).where('firm_id', '=', firm.firm_id).execute();
  }

  console.log(`Deactivated ${demoFirms.length} demo firm(s): ${demoFirms.map((f) => f.legal_entity_name).join(', ') || '(none found)'}`);

  await db.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
