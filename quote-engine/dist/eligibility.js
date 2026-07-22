// Five Star Conveyancing — Eligibility filter
// A firm is excluded (with a client-facing reason) rather than silently hidden,
// per the confirmed Stage 2/3 decision.
export function checkEligibility(ruleSet, answers) {
    const { firm, transactionTypes, restrictions } = ruleSet;
    if (firm.status !== 'active') {
        return { eligible: false, reason: 'This firm is not currently accepting new instructions.' };
    }
    const acceptsTransactionType = transactionTypes.some((t) => t.transactionType === answers.transactionType && t.accepted);
    if (!acceptsTransactionType) {
        return {
            eligible: false,
            reason: `This firm does not currently handle ${humanizeTransactionType(answers.transactionType)}.`,
        };
    }
    for (const restriction of restrictions) {
        if (restriction.transactionType !== answers.transactionType)
            continue;
        if (restriction.restrictionType === 'property_value') {
            const { valueMin, valueMax } = restriction;
            if (valueMin !== undefined && answers.propertyValue < valueMin) {
                return {
                    eligible: false,
                    reason: `This firm's minimum property value for this transaction type is £${valueMin.toLocaleString('en-GB')}.`,
                };
            }
            if (valueMax !== undefined && answers.propertyValue > valueMax) {
                return {
                    eligible: false,
                    reason: `This firm's maximum property value for this transaction type is £${valueMax.toLocaleString('en-GB')}.`,
                };
            }
        }
        if (restriction.restrictionType === 'leasehold' && answers.freeholdOrLeasehold === 'leasehold') {
            return {
                eligible: false,
                reason: restriction.notes ?? 'This firm does not currently accept leasehold transactions of this type.',
            };
        }
        if (restriction.restrictionType === 'new_build' && answers.flags.newBuild) {
            return {
                eligible: false,
                reason: restriction.notes ?? "This firm doesn't currently accept new-build transactions of this type.",
            };
        }
        // Additional restriction types (geographic, auction, shared_ownership, etc.)
        // follow the same pattern: check the relevant answers.flags[...] entry against
        // the restriction and return an eligible: false result with a specific reason.
    }
    return { eligible: true, reason: null };
}
function humanizeTransactionType(t) {
    const map = {
        sale: 'sales',
        purchase: 'purchases',
        sale_and_purchase: 'combined sale and purchase transactions',
        remortgage: 'remortgages',
        transfer_of_equity: 'transfers of equity',
        lease_extension: 'lease extensions',
    };
    return map[t];
}
