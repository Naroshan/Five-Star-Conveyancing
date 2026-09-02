// Five Star Conveyancing — read-only lookup of a quote by reference.
// Prints the full original submission (client answers) and every firm's
// result (eligible or excluded), pulled straight from the source of truth
// rather than a partial screenshot of a Formspree notification email.
//
// Usage: DATABASE_URL=<production> npx tsx scripts/lookup-quote.ts FSC-XXXX-XXXX-XXXX-XXXX

import { createDb } from '../src/db/client.js';
import { getQuoteByReference, loadFirmsByIds } from '../src/db/repository.js';

async function main() {
  const reference = process.argv[2];
  if (!reference) {
    throw new Error('Usage: npx tsx scripts/lookup-quote.ts <quote-reference>');
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Set DATABASE_URL before running this script.');
  }
  const db = createDb(connectionString);

  const quote = await getQuoteByReference(db, reference);
  if (!quote) {
    console.log(`No quote found for reference ${reference}.`);
    await db.destroy();
    return;
  }

  console.log('='.repeat(70));
  console.log(`QUOTE ${reference}`);
  console.log('='.repeat(70));
  console.log(`Status:            ${quote.status}`);
  console.log(`Expiry:            ${quote.expiryAt.toISOString()}`);
  console.log(`Transaction type:  ${quote.transactionType}`);
  console.log();
  console.log('--- Client contact ---');
  if (quote.contact) {
    console.log(`Name:              ${quote.contact.name}`);
    console.log(`Email:             ${quote.contact.email}`);
    console.log(`Phone:             ${quote.contact.phone}`);
  } else {
    console.log('(no contact details on file for this quote)');
  }
  console.log();
  console.log('--- Client answers ---');
  console.log(JSON.stringify(quote.clientAnswers, null, 2));
  console.log();

  const firmsById = await loadFirmsByIds(db, quote.results.map((r) => r.firmId));

  console.log('--- Results ---');
  for (const r of quote.results) {
    const firm = firmsById.get(r.firmId);
    console.log('-'.repeat(50));
    console.log(`Firm:              ${firm?.legalEntityName ?? '(unknown)'}${firm?.tradingName ? ` (t/a ${firm.tradingName})` : ''}`);
    console.log(`SRA number:        ${firm?.sraNumber ?? '(unknown)'}`);
    console.log(`Eligibility:       ${r.eligibilityStatus}`);
    if (r.eligibilityStatus === 'excluded_with_reason') {
      console.log(`Exclusion reason:  ${r.exclusionReason}`);
      continue;
    }
    console.log(`Legal fee:         £${r.legalFeeSubtotal.toFixed(2)}`);
    console.log(`VAT:               £${r.vatTotal.toFixed(2)}`);
    console.log(`Disbursements:     £${r.disbursementsTotal.toFixed(2)}`);
    console.log(`SDLT estimate:     ${r.sdltEstimate !== null ? `£${r.sdltEstimate.toFixed(2)}` : 'n/a'}`);
    console.log(`Total estimate:    ${r.totalEstimate !== null ? `£${r.totalEstimate.toFixed(2)}` : 'n/a'}`);
    console.log('Line items:');
    console.log(JSON.stringify(r.lineItems, null, 2));
  }

  await db.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
