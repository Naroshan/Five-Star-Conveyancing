// Five Star Conveyancing — real-data import: 5STAR_FEE_SCALE.xlsx
//
// Source: 5STAR_FEE_SCALE.xlsx, supplied by the client 2026-08-26. Covers
// four firms (Hutchins/TP Legal Ltd, Ackroyd Legal, Guillaumes LLP,
// Beechwood) each with banded Purchase/Sale/Remortgage legal-fee scales,
// a shared disbursement list, and a shared supplement list.
//
// SUPERSEDES the flat £1,000-for-every-transaction-type Ackroyd Legal
// scale from `import-ackroyd-legal.ts` (a different, earlier spreadsheet)
// — confirmed with the client. This script deletes those specific old
// draft rows for Ackroyd Legal before writing the new banded ones, so the
// two scales don't sit side by side contradicting each other. Do not run
// `import-ackroyd-legal.ts` again.
//
// Beechwood Solicitors (SRA 499274, legal entity name per the source
// spreadsheet's own sheet title) is included below.
//
// Deliberate omissions (documented, not guessed):
//   - The "£2,000,000+" tier in the source is a percentage-of-value figure
//     (e.g. "0.08 Percent") with its Total explicitly marked "TBC" — this
//     engine only supports fixed per-band fees, and the source itself
//     hasn't committed to a number, so no band is created above £2,000,000.
//     A property above that value correctly falls through to "no published
//     fee for this value" and is excluded, rather than guessing.
//   - VAT treatment is NOT stated per line in this source (unlike the
//     Ackroyd flat-scale import, which had explicit Net/VAT/Total columns)
//     — every base fee, disbursement, and supplement here is loaded as
//     'standard' VAT treatment as an explicit assumption, not a stated fact.
//   - Supplements without a clean match to an existing client-facing flag
//     are NOT imported (would be dead data at best, wrong at worst):
//     Concessionary, Gifted Deposit (Inside/Outside UK), Mortgage
//     Redemption, SDLT Form, and BOTH "HTB (Equity Loan)" and "HTB (ISA)"
//     — the latter two share what would be the same `helpToBuy` UI flag
//     but the source prices them differently (£250 vs £150), so importing
//     either under that shared flag would silently pick the wrong one (or
//     double-charge if both were imported) for whichever HTB scheme the
//     client actually meant. Left out entirely until the flag list can
//     distinguish them.
//   - The footnotes ("*Added on top of Legal fee but if no mortgage/no SDLT
//     return, [fee] is reduced by £X") describe a discount condition with
//     no equivalent in this schema (no "reduce a fee when a flag is
//     absent" mechanism) — not modeled.
//   - sale_and_purchase gets NO dedicated rows at all: per the engine
//     redesign in this same change, a sale_and_purchase quote prices its
//     sale leg off each firm's own 'sale'-scoped data and its purchase leg
//     off the 'purchase'-scoped data already imported here — nothing
//     extra to add.
//
// Everything this script creates lands in 'draft' status. Nothing here is
// usable by the quote engine (which only reads approval_status = 'approved')
// until a compliance reviewer — a different person from whoever runs this
// import — reviews and approves it through the normal workflow.
//
// NOT IDEMPOTENT: re-running this script against the same database creates
// duplicate draft rows (except the firm/admin-user/transaction-type setup,
// which do check for an existing row first).

import { createDb } from '../src/db/client.js';
import { provisionAdminUser } from '../src/auth/provisioning.js';
import { randomBytes } from 'node:crypto';
import { createFeeValueBandDraft } from '../src/admin/feeValueBandAdmin.js';
import { createFeeRuleDraft } from '../src/admin/feeRuleAdmin.js';
import { createDisbursementRuleDraft } from '../src/admin/disbursementRuleAdmin.js';
import type { AdminUser, TransactionType, VatTreatment } from '../src/types.js';

interface FirmFeeData {
  legalEntityName: string;
  tradingName: string | null;
  sraNumber: string;
  // Fee per THRESHOLDS tier, in ascending order — see THRESHOLDS below.
  purchaseBands: number[];
  saleBands: number[];
  remortgageBands: number[];
}

// Property-value tier ceilings shared by every firm's Purchase/Sale/
// Remortgage scale in the source spreadsheet. Each band covers
// (previous threshold, this threshold], boundary rule inclusive_upper —
// same convention as the existing Ackroyd flat-scale import.
const THRESHOLDS = [125_000, 250_000, 325_000, 400_000, 500_000, 750_000, 1_000_000, 1_250_000, 1_500_000, 1_750_000, 2_000_000];

const FIRMS: FirmFeeData[] = [
  {
    legalEntityName: 'TP Legal Ltd',
    tradingName: 'Hutchins Law',
    sraNumber: '567465',
    purchaseBands: [600, 650, 700, 750, 800, 950, 1_100, 1_200, 1_400, 1_800, 2_000],
    saleBands: [500, 550, 600, 650, 700, 775, 1_000, 1_050, 1_100, 1_150, 1_200],
    remortgageBands: [400, 400, 400, 400, 400, 400, 475, 600, 600, 750, 1_000],
  },
  {
    legalEntityName: 'Ackroyd Legal',
    tradingName: null,
    sraNumber: '554585',
    purchaseBands: [700, 750, 800, 850, 900, 1_000, 1_350, 1_500, 1_750, 2_250, 2_500],
    saleBands: [750, 750, 750, 750, 900, 1_000, 1_100, 1_100, 1_150, 1_250, 1_350],
    remortgageBands: [500, 500, 500, 500, 500, 500, 575, 600, 750, 950, 1_250],
  },
  {
    legalEntityName: 'Guillaumes LLP',
    tradingName: null,
    sraNumber: '566850',
    purchaseBands: [800, 850, 1_100, 1_200, 1_275, 1_450, 1_725, 1_725, 2_000, 2_600, 2_875],
    saleBands: [850, 850, 850, 850, 1_025, 1_150, 1_275, 1_275, 1_325, 1_450, 1_550],
    remortgageBands: [600, 600, 600, 600, 600, 600, 675, 725, 800, 1_100, 1_450],
  },
  {
    legalEntityName: 'Beechwood Solicitors',
    tradingName: null,
    sraNumber: '499274',
    purchaseBands: [950, 1_050, 1_325, 1_475, 1_550, 1_750, 2_100, 2_100, 2_450, 3_150, 3_500],
    saleBands: [900, 1_050, 1_050, 1_050, 1_250, 1_400, 1_550, 1_550, 1_600, 1_750, 1_900],
    remortgageBands: [700, 700, 700, 700, 700, 700, 850, 1_050, 1_050, 1_325, 1_750],
  },
];

// Identical across Purchase and Sale for every firm in the source, except
// Sale has no "Search Pack" line (only relevant when buying a property).
const PURCHASE_DISBURSEMENTS: { chargeName: string; category: string; amount: number }[] = [
  { chargeName: 'CHAPS Fee', category: 'bank_transfer', amount: 50 },
  { chargeName: 'ID Check (PP)', category: 'id_check', amount: 20 },
  { chargeName: 'Completion Searches', category: 'search', amount: 10 },
  { chargeName: 'Post Completion Fees', category: 'other', amount: 150 },
  { chargeName: 'Search Pack', category: 'search', amount: 299 },
  { chargeName: 'Bank transfer fee', category: 'bank_transfer', amount: 50 },
];
const SALE_DISBURSEMENTS: { chargeName: string; category: string; amount: number }[] = [
  { chargeName: 'CHAPS Fee', category: 'bank_transfer', amount: 50 },
  { chargeName: 'ID Check (PP)', category: 'id_check', amount: 20 },
  { chargeName: 'Completion Searches', category: 'search', amount: 10 },
  { chargeName: 'Post Completion Fees', category: 'other', amount: 150 },
  { chargeName: 'Bank transfer fee', category: 'bank_transfer', amount: 50 },
];

// Only supplements with a clean, unambiguous match to an existing
// client-facing flag (see GetAQuoteForm.tsx FLAG_OPTIONS) are imported —
// see the header comment for what's deliberately left out and why.
const PURCHASE_SUPPLEMENTS: { chargeName: string; triggerKey: string; amount: number; explanation: string }[] = [
  { chargeName: 'Islamic Finance', triggerKey: 'islamicFinance', amount: 750, explanation: 'Additional work for Sharia-compliant (Islamic) finance arrangements.' },
  { chargeName: 'Buy to Let', triggerKey: 'buyToLet', amount: 150, explanation: 'Additional work for a buy-to-let purchase.' },
  { chargeName: 'Building Safety Act', triggerKey: 'buildingSafetyAct', amount: 250, explanation: 'Additional work relating to Building Safety Act requirements (relevant to some higher-risk residential buildings).' },
  { chargeName: 'Leasehold', triggerKey: 'leasehold', amount: 150, explanation: 'Additional work reviewing lease terms and service charge accounts, for leasehold properties.' },
  { chargeName: 'Right to Buy', triggerKey: 'rightToBuy', amount: 150, explanation: 'Additional work for a Right to Buy purchase.' },
  { chargeName: 'Shared Ownership', triggerKey: 'sharedOwnership', amount: 350, explanation: 'Additional work for a shared ownership transaction.' },
  { chargeName: 'Unregistered', triggerKey: 'unregisteredTitle', amount: 850, explanation: 'Additional work where the property title is not yet registered at HM Land Registry.' },
];
const SALE_SUPPLEMENTS: { chargeName: string; triggerKey: string; amount: number; explanation: string }[] = [
  { chargeName: 'Islamic Finance', triggerKey: 'islamicFinance', amount: 750, explanation: 'Additional work for Sharia-compliant (Islamic) finance arrangements.' },
  { chargeName: 'Building Safety Act', triggerKey: 'buildingSafetyAct', amount: 250, explanation: 'Additional work relating to Building Safety Act requirements (relevant to some higher-risk residential buildings).' },
  { chargeName: 'Leasehold', triggerKey: 'leasehold', amount: 150, explanation: 'Additional work reviewing lease terms and service charge accounts, for leasehold properties.' },
  { chargeName: 'Shared Ownership', triggerKey: 'sharedOwnership', amount: 350, explanation: 'Additional work for a shared ownership transaction.' },
  { chargeName: 'Unregistered', triggerKey: 'unregisteredTitle', amount: 750, explanation: 'Additional work where the property title is not yet registered at HM Land Registry.' },
];

const EFFECTIVE_DATE = '2026-08-26';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Set DATABASE_URL to the target database before running this import.');
  }
  const db = createDb(connectionString);
  let created = 0;

  // --- Import user (fee_administrator — cannot also approve; see roles.ts) ---
  const existingUser = await db.selectFrom('admin_users').selectAll().where('email', '=', 'data-import@fivestarconveyancing.co.uk').executeTakeFirst();
  const importUserId =
    existingUser?.user_id ??
    (
      await provisionAdminUser(db, {
        name: 'Data Import',
        email: 'data-import@fivestarconveyancing.co.uk',
        role: 'fee_administrator',
        password: randomBytes(24).toString('base64url'),
      })
    ).userId;
  const importUser: AdminUser = { userId: importUserId, name: 'Data Import', email: 'data-import@fivestarconveyancing.co.uk', role: 'fee_administrator' };

  async function importBandedScale(firmId: string, transactionType: TransactionType, fees: number[]) {
    await createFeeRuleDraft(db, importUser, {
      firmId,
      transactionType,
      chargeName: 'Legal Fee',
      chargeType: 'base_fee',
      triggerKey: null,
      calculationType: 'fixed',
      amount: null,
      minAmount: null,
      maxAmount: null,
      formulaExpression: null,
      vatTreatment: 'standard',
      isGuaranteed: true,
      isEstimated: false,
      effectiveDate: EFFECTIVE_DATE,
      expiryDate: null,
      displayOrder: 1,
      clientFacingExplanation: 'Base conveyancing fee, banded by property value — see the published fee scale.',
    });
    created++;

    let valueMin = 0;
    for (let i = 0; i < THRESHOLDS.length; i++) {
      await createFeeValueBandDraft(db, importUser, {
        firmId,
        transactionType,
        valueMin,
        valueMax: THRESHOLDS[i],
        boundaryRule: 'inclusive_upper',
        baseFee: fees[i],
        effectiveDate: EFFECTIVE_DATE,
        expiryDate: null,
      });
      created++;
      valueMin = THRESHOLDS[i];
    }
    // Deliberately no band above the final threshold — see header comment
    // on the £2,000,000+ percentage-based "TBC" tier.
  }

  async function importSupplement(firmId: string, transactionType: TransactionType, chargeName: string, triggerKey: string, amount: number, explanation: string) {
    await createFeeRuleDraft(db, importUser, {
      firmId,
      transactionType,
      chargeName,
      chargeType: 'supplement',
      triggerKey,
      calculationType: 'fixed',
      amount,
      minAmount: null,
      maxAmount: null,
      formulaExpression: null,
      vatTreatment: 'standard',
      isGuaranteed: true,
      isEstimated: false,
      effectiveDate: EFFECTIVE_DATE,
      expiryDate: null,
      displayOrder: 2,
      clientFacingExplanation: explanation,
    });
    created++;
  }

  async function importDisbursement(firmId: string, transactionType: TransactionType, chargeName: string, category: string, amount: number, vatTreatment: VatTreatment) {
    await createDisbursementRuleDraft(db, importUser, {
      firmId,
      transactionType,
      chargeName,
      category,
      amountType: 'fixed',
      amount,
      minAmount: null,
      maxAmount: null,
      vatTreatment,
      conditionalTriggerExpression: null,
      effectiveDate: EFFECTIVE_DATE,
      expiryDate: null,
      displayOrder: 1,
      clientFacingExplanation: `${chargeName}, as published in the firm's fee scale.`,
    });
    created++;
  }

  for (const firm of FIRMS) {
    // --- Firm record (directly confirmed data, not subject to the draft workflow) ---
    const existingFirm = await db.selectFrom('firms').selectAll().where('sra_number', '=', firm.sraNumber).executeTakeFirst();
    const firmId =
      existingFirm?.firm_id ??
      (
        await db
          .insertInto('firms')
          .values({
            legal_entity_name: firm.legalEntityName,
            trading_name: firm.tradingName,
            sra_number: firm.sraNumber,
            status: 'active',
            quote_validity_days: 30,
          })
          .returning('firm_id')
          .executeTakeFirstOrThrow()
      ).firm_id;

    // sale_and_purchase gets no row at all — see header comment. transfer_of_equity
    // and lease_extension aren't in this source, so left unaccepted rather than guessed.
    for (const t of ['purchase', 'sale', 'remortgage'] as TransactionType[]) {
      const exists = await db
        .selectFrom('firm_transaction_types')
        .selectAll()
        .where('firm_id', '=', firmId)
        .where('transaction_type', '=', t)
        .executeTakeFirst();
      if (!exists) {
        await db.insertInto('firm_transaction_types').values({ firm_id: firmId, transaction_type: t, accepted: true }).execute();
      }
    }

    // --- Retire the old flat Ackroyd Legal scale (draft rows only — never
    // approved, never live, so a direct delete is correct; see header). ---
    if (firm.sraNumber === '554585') {
      await db
        .deleteFrom('fee_value_bands')
        .where('firm_id', '=', firmId)
        .where('approval_status', '=', 'draft')
        .where('base_fee', '=', 1_000)
        .execute();
      await db
        .deleteFrom('fee_rules')
        .where('firm_id', '=', firmId)
        .where('approval_status', '=', 'draft')
        .where('charge_type', '=', 'base_fee')
        .where('amount', '=', 1_000)
        .execute();
    }

    await importBandedScale(firmId, 'purchase', firm.purchaseBands);
    await importBandedScale(firmId, 'sale', firm.saleBands);
    await importBandedScale(firmId, 'remortgage', firm.remortgageBands);

    for (const s of PURCHASE_SUPPLEMENTS) {
      await importSupplement(firmId, 'purchase', s.chargeName, s.triggerKey, s.amount, s.explanation);
    }
    for (const s of SALE_SUPPLEMENTS) {
      await importSupplement(firmId, 'sale', s.chargeName, s.triggerKey, s.amount, s.explanation);
    }

    for (const d of PURCHASE_DISBURSEMENTS) {
      await importDisbursement(firmId, 'purchase', d.chargeName, d.category, d.amount, 'standard');
    }
    for (const d of SALE_DISBURSEMENTS) {
      await importDisbursement(firmId, 'sale', d.chargeName, d.category, d.amount, 'standard');
    }

    console.log(`Imported ${firm.legalEntityName}${firm.tradingName ? ` (t/a ${firm.tradingName})` : ''} — firm_id=${firmId}`);
  }

  console.log(`Import complete. ${created} draft records created across ${FIRMS.length} firms.`);
  console.log('All records are in draft status — none are usable by the quote engine until a compliance reviewer approves them.');

  await db.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
