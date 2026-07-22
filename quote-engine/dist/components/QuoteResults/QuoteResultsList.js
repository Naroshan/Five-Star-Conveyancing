import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { theme } from '../theme.js';
import { QuoteResultCard } from './QuoteResultCard.js';
// Stage 3 (FR8) also specifies sorting/filtering by review rating, response
// time, lender-panel compatibility, and local office. Those aren't wired up
// here because the current API response doesn't carry that data yet (it
// lives in firm_reviews / firm_offices / lender_firm_panel — see Stage 4 —
// which the API layer hasn't been extended to join in). Only sorts backed
// by real data in the response are implemented; nothing here is a
// placeholder that looks functional but isn't.
const SORT_OPTIONS = [
    { value: 'total_cost', label: 'Lowest total cost' },
    { value: 'legal_fee', label: 'Legal fee' },
];
function isFullyFixedFee(result) {
    return result.lineItems.length > 0 && result.lineItems.every((l) => l.isGuaranteed && !l.isEstimated);
}
export function QuoteResultsList({ results, onSelect, onEmailQuote, onSaveQuote, onSpeakToAdviser }) {
    const [sortBy, setSortBy] = useState('total_cost');
    const [fixedFeeOnly, setFixedFeeOnly] = useState(false);
    const eligible = useMemo(() => results.filter((r) => r.eligibilityStatus === 'eligible'), [results]);
    const excluded = useMemo(() => results.filter((r) => r.eligibilityStatus === 'excluded_with_reason'), [results]);
    const visibleEligible = useMemo(() => {
        const filtered = fixedFeeOnly ? eligible.filter(isFullyFixedFee) : eligible;
        const sorted = [...filtered].sort((a, b) => {
            if (sortBy === 'total_cost')
                return (a.totalEstimate ?? Infinity) - (b.totalEstimate ?? Infinity);
            return a.legalFeeSubtotal - b.legalFeeSubtotal;
        });
        return sorted;
    }, [eligible, sortBy, fixedFeeOnly]);
    if (results.length === 0) {
        return (_jsxs("div", { style: emptyStateStyle, children: [_jsx("p", { style: { fontWeight: 500, fontSize: 16, margin: '0 0 4px', color: theme.color.textHeading }, children: "We couldn't find a quote for this" }), _jsx("p", { style: { fontSize: 13, color: theme.color.textSecondary, margin: '0 0 16px' }, children: "None of our participating firms currently cover this type of transaction. An adviser can help you find the right option." }), _jsx("button", { type: "button", onClick: () => onSpeakToAdviser(''), style: adviserButtonStyle, children: "Speak to an adviser" })] }));
    }
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: [eligible.length > 0 && (_jsxs("div", { style: { display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', fontSize: 13 }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 6 }, children: ["Sort by", _jsx("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), style: selectStyle, children: SORT_OPTIONS.map((opt) => (_jsx("option", { value: opt.value, children: opt.label }, opt.value))) })] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 6 }, children: [_jsx("input", { type: "checkbox", checked: fixedFeeOnly, onChange: (e) => setFixedFeeOnly(e.target.checked) }), "Fixed fee only"] })] })), eligible.length === 0 && (_jsxs("div", { style: emptyStateStyle, children: [_jsx("p", { style: { fontWeight: 500, fontSize: 16, margin: '0 0 4px', color: theme.color.textHeading }, children: "No firms matched every answer this time" }), _jsx("p", { style: { fontSize: 13, color: theme.color.textSecondary, margin: 0 }, children: "The firms below couldn't be included, with the reason shown for each. An adviser can help with alternatives." })] })), visibleEligible.map((result) => (_jsx(QuoteResultCard, { result: result, onSelect: onSelect, onEmailQuote: onEmailQuote, onSaveQuote: onSaveQuote, onSpeakToAdviser: onSpeakToAdviser }, result.firm.firmId))), excluded.map((result) => (_jsx(QuoteResultCard, { result: result, onSelect: onSelect, onEmailQuote: onEmailQuote, onSaveQuote: onSaveQuote, onSpeakToAdviser: onSpeakToAdviser }, result.firm.firmId)))] }));
}
const emptyStateStyle = {
    background: theme.color.offWhite,
    border: `0.5px solid ${theme.color.border}`,
    borderRadius: theme.radius.card,
    padding: 20,
    textAlign: 'center',
};
const adviserButtonStyle = {
    background: theme.color.accent,
    color: '#EAF3EE',
    border: 'none',
    borderRadius: theme.radius.control,
    padding: '9px 16px',
    fontSize: 13,
    cursor: 'pointer',
};
const selectStyle = {
    border: `0.5px solid ${theme.color.border}`,
    borderRadius: theme.radius.control,
    padding: '4px 8px',
    fontSize: 13,
};
