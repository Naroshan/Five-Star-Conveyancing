import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { theme } from '../theme.js';
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
}
/**
 * Starts collapsed on every breakpoint (Stage 5 confirmed decision — see
 * README) behind a "see full breakdown" toggle, then shows the itemised
 * lines grouped by category once expanded.
 */
export function FeeBreakdown({ lineItems, legalFeeSubtotal, vatTotal, disbursementsTotal, sdltEstimate }) {
    const [expanded, setExpanded] = useState(false);
    const supplements = lineItems.filter((l) => l.category === 'supplement');
    const disbursements = lineItems.filter((l) => l.category === 'disbursement');
    const baseFee = lineItems.find((l) => l.category === 'legal_fee');
    return (_jsxs("div", { style: { fontSize: 12, color: theme.color.textBody }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '3px 0',
                }, children: [_jsx("span", { children: "Legal fee" }), _jsx("span", { children: formatCurrency(legalFeeSubtotal) })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', padding: '3px 0' }, children: [_jsx("span", { children: "VAT" }), _jsx("span", { children: formatCurrency(vatTotal) })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', padding: '3px 0' }, children: [_jsx("span", { children: "Disbursements" }), _jsx("span", { children: formatCurrency(disbursementsTotal) })] }), sdltEstimate !== null && (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', padding: '3px 0' }, children: [_jsx("span", { children: "Stamp Duty Land Tax (indicative)" }), _jsx("span", { children: formatCurrency(sdltEstimate) })] })), _jsx("button", { type: "button", onClick: () => setExpanded((v) => !v), "aria-expanded": expanded, style: {
                    background: 'none',
                    border: 'none',
                    padding: '6px 0 0',
                    color: theme.color.accent,
                    fontSize: 12,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                }, children: expanded ? 'Hide full breakdown' : 'See full breakdown' }), expanded && (_jsxs("div", { style: {
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: `0.5px solid ${theme.color.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                }, children: [baseFee && _jsx(LineItemRow, { item: baseFee }), supplements.map((item) => (_jsx(LineItemRow, { item: item }, item.chargeName))), disbursements.map((item) => (_jsx(LineItemRow, { item: item }, item.chargeName)))] }))] }));
}
function LineItemRow({ item }) {
    return (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', gap: 8 }, children: [_jsxs("span", { children: [item.chargeName, item.isEstimated && _jsx("span", { style: { color: theme.color.textSecondary }, children: " (estimated)" })] }), _jsx("span", { children: formatCurrency(item.amountExVat) })] }));
}
