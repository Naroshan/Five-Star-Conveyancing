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

export const clientAnswersSchema = z.object({
  transactionType: transactionTypeSchema,
  postcode: z.string().trim().regex(UK_POSTCODE_PATTERN, 'Enter a valid UK postcode'),
  jurisdiction: z.enum(['england', 'wales']),
  propertyValue: z.number().positive().max(50_000_000),
  freeholdOrLeasehold: z.enum(['freehold', 'leasehold']),
  mortgageInvolved: z.boolean(),
  lenderId: z.string().uuid().optional(),
  // Loosely typed on purpose — the fee engine looks up flags by trigger_key,
  // which is data-driven per firm, not a fixed enum the API can validate
  // against. Unknown keys are harmless (no rule will match them); this schema
  // only guarantees every value is actually a boolean.
  flags: z.record(z.string(), z.boolean()).default({}),
});

export type ValidatedClientAnswers = z.infer<typeof clientAnswersSchema>;

export function validateClientAnswers(body: unknown) {
  return clientAnswersSchema.safeParse(body);
}
