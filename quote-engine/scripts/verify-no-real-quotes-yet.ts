// Five Star Conveyancing — draft-safety verification
// Confirms that draft (unapproved) fee data cannot produce a real quote.
// Useful to re-run after any bulk import, before telling anyone the data
// is "in the system" — being present in the database is not the same as
// being usable by the quote engine, and this proves the gap actually holds.

import { createDb } from '../src/db/client.js';
import { loadActiveFirmRuleSets } from '../src/db/repository.js';
import { calculateQuotesForFirms } from '../src/quoteEngine.js';

const db = createDb(process.env.DATABASE_URL!);
const ruleSets = await loadActiveFirmRuleSets(db, 'purchase');
console.log(`Active firms accepting 'purchase': ${ruleSets.length} (Ackroyd Legal firm_transaction_types row exists, so it's found)`);

const results = calculateQuotesForFirms(ruleSets, {
  transactionType: 'purchase',
  postcode: 'SW1A 1AA',
  jurisdiction: 'england',
  propertyValue: 300_000,
  freeholdOrLeasehold: 'freehold',
  mortgageInvolved: true,
  flags: {},
});
console.log(JSON.stringify(results.map(r => ({ firmId: r.firmId, status: r.eligibilityStatus, reason: r.exclusionReason, total: r.totalEstimate })), null, 2));
await db.destroy();
