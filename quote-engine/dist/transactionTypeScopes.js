// Five Star Conveyancing — transaction-type scope resolution
//
// sale_and_purchase has no scale of its own — no firm in the real fee data
// publishes a separate "combined" scale, only Purchase and Sale. So every
// place that loads or matches fee_value_bands/fee_rules/disbursement_rules/
// firm_restrictions/firm_transaction_types by transaction type resolves
// sale_and_purchase into its two component scopes instead.
export function resolveTransactionTypeScopes(transactionType) {
    return transactionType === 'sale_and_purchase' ? ['purchase', 'sale'] : [transactionType];
}
