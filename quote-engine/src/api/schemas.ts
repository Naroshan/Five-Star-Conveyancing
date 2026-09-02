// Five Star Conveyancing — API request validation
//
// Validates the shape and types of an incoming quote request. This is
// deliberately scoped to the *universal* question set (Stage 1, Section 5) —
// every transaction type shares these fields. Per-transaction-type required
// fields (e.g. "remaining lease term" for lease extensions) are the natural
// next layer on top of this and aren't built out for all six transaction
// types yet; see the README for what's covered.

import { z } from 'zod';

const UK_POSTCODE_PATTERN = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;

export const transactionTypeSchema = z.enum([
  'sale',
  'purchase',
  'sale_and_purchase',
  'remortgage',
  'transfer_of_equity',
  'lease_extension',
]);

const propertyValueField = z.number().positive().max(50_000_000);

export const clientAnswersSchema = z
  .object({
    transactionType: transactionTypeSchema,
    postcode: z.string().trim().regex(UK_POSTCODE_PATTERN, 'Enter a valid UK postcode'),
    jurisdiction: z.enum(['england', 'wales']),
    // sale_and_purchase uses salePropertyValue/purchasePropertyValue instead
    // of propertyValue — enforced below, since it has two property values
    // (the property being sold and the property being bought), not one.
    propertyValue: propertyValueField.optional(),
    salePropertyValue: propertyValueField.optional(),
    purchasePropertyValue: propertyValueField.optional(),
    freeholdOrLeasehold: z.enum(['freehold', 'leasehold']),
    mortgageInvolved: z.boolean(),
    lenderId: z.string().uuid().optional(),
    // Loosely typed on purpose — the fee engine looks up flags by trigger_key,
    // which is data-driven per firm, not a fixed enum the API can validate
    // against. Unknown keys are harmless (no rule will match them); this schema
    // only guarantees every value is actually a boolean.
    flags: z.record(z.string(), z.boolean()).default({}),
  })
  .superRefine((data, ctx) => {
    if (data.transactionType === 'sale_and_purchase') {
      if (data.salePropertyValue === undefined) {
        ctx.addIssue({ code: 'custom', path: ['salePropertyValue'], message: 'salePropertyValue is required for sale_and_purchase.' });
      }
      if (data.purchasePropertyValue === undefined) {
        ctx.addIssue({ code: 'custom', path: ['purchasePropertyValue'], message: 'purchasePropertyValue is required for sale_and_purchase.' });
      }
      if (data.propertyValue !== undefined) {
        ctx.addIssue({ code: 'custom', path: ['propertyValue'], message: 'propertyValue must be omitted for sale_and_purchase — use salePropertyValue/purchasePropertyValue instead.' });
      }
    } else {
      if (data.propertyValue === undefined) {
        ctx.addIssue({ code: 'custom', path: ['propertyValue'], message: 'propertyValue is required.' });
      }
      if (data.salePropertyValue !== undefined || data.purchasePropertyValue !== undefined) {
        ctx.addIssue({ code: 'custom', path: ['salePropertyValue'], message: 'salePropertyValue/purchasePropertyValue are only used for sale_and_purchase.' });
      }
    }
  });

export type ValidatedClientAnswers = z.infer<typeof clientAnswersSchema>;

export function validateClientAnswers(body: unknown) {
  return clientAnswersSchema.safeParse(body);
}

// The client's own contact details — see api/createQuote.ts and
// api/selectFirm.ts for where this is collected and persisted. Phone
// validation is deliberately loose (just "long enough to plausibly be a
// number") rather than a strict UK-format regex, to avoid rejecting real
// numbers (extensions, spaces, leading +44) over a cosmetic format check.
export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  email: z.string().trim().email('Enter a valid email address').max(320),
  phone: z.string().trim().min(5, 'Enter a valid phone number').max(30),
});

export type ValidatedContact = z.infer<typeof contactSchema>;

export function validateContact(body: unknown) {
  return contactSchema.safeParse(body);
}
