import type { TransactionType } from "five-star-conveyancing-quote-engine/types";

export interface TransactionTypeOption {
  value: TransactionType;
  label: string;
  noun: string;
}

// Shared by GetAQuoteForm's Service step and HeroQuoteWidget's type
// selector, so both stay in sync with a single source of truth.
export const TRANSACTION_TYPES: TransactionTypeOption[] = [
  { value: "purchase", label: "Buying a Property", noun: "purchase" },
  { value: "sale", label: "Selling a Property", noun: "sale" },
  { value: "sale_and_purchase", label: "Selling and Buying a Property", noun: "sale and purchase" },
  { value: "remortgage", label: "Remortgaging a Property", noun: "remortgage" },
  { value: "transfer_of_equity", label: "Transferring Ownership", noun: "transfer of equity" },
  { value: "lease_extension", label: "Extending a Lease", noun: "lease extension" },
];

// A lease extension is, by definition, on a leasehold property — no need to ask.
export function tenureIsFixedLeasehold(transactionType: TransactionType): boolean {
  return transactionType === "lease_extension";
}
