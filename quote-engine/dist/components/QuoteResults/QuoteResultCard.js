import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { theme } from '../theme.js';
import { FeeBreakdown } from './FeeBreakdown.js';
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
}
/** True only if every line item on this quote is a fixed, guaranteed figure — never a fabricated "fixed fee" badge on an estimate. */
function isFullyFixedFee(result) {
    return result.lineItems.length > 0 && result.lineItems.every((l) => l.isGuaranteed && !l.isEstimated);
}
export function QuoteResultCard({ result, onSelect, onEmailQuote, onSaveQuote, onSpeakToAdviser }) {
    const displayName = result.firm.tradingName ?? result.firm.legalEntityName;
    if (result.eligibilityStatus === 'excluded_with_reason') {
        return (_jsxs("div", { role: "group", "aria-label": `${displayName} — not available for this quote`, style: {
                background: theme.color.excludedBg,
                border: `0.5px solid ${theme.color.border}`,
                borderRadius: theme.radius.card,
                padding: 16,
                opacity: 0.85,
            }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }, children: [_jsxs("div", { children: [_jsx("p", { style: { fontWeight: 500, fontSize: 15, margin: 0, color: theme.color.excludedText }, children: displayName }), result.firm.sraNumber && (_jsxs("p", { style: { fontSize: 12, color: theme.color.textSecondary, margin: '4px 0 0' }, children: ["SRA ", result.firm.sraNumber] }))] }), _jsx("span", { style: { fontSize: 11, color: theme.color.textSecondary }, children: "Not available for this quote" })] }), _jsx("p", { style: {
                        fontSize: 12,
                        color: theme.color.textBody,
                        margin: '12px 0 0',
                        paddingTop: 12,
                        borderTop: `0.5px solid ${theme.color.border}`,
                    }, children: result.exclusionReason }), _jsx("button", { type: "button", onClick: () => onSpeakToAdviser(result.firm.firmId), style: secondaryButtonStyle, children: "Speak to an adviser" })] }));
    }
    const fixedFee = isFullyFixedFee(result);
    return (_jsxs("div", { role: "group", "aria-label": `${displayName} quote`, style: { background: theme.color.surfaceWhite, border: `0.5px solid ${theme.color.border}`, borderRadius: theme.radius.card, padding: 16 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }, children: [_jsxs("div", { children: [_jsx("p", { style: { fontWeight: 500, fontSize: 15, margin: 0, color: theme.color.textHeading }, children: displayName }), _jsxs("p", { style: { fontSize: 12, color: theme.color.textSecondary, margin: '4px 0 0' }, children: [result.firm.sraNumber && _jsxs("span", { children: ["SRA ", result.firm.sraNumber] }), result.firm.sraNumber && ' · ', _jsx("span", { children: fixedFee ? 'Fixed fee' : 'Estimate — some figures may vary' })] })] }), _jsxs("div", { style: { textAlign: 'right' }, children: [_jsx("p", { style: { fontSize: 20, fontWeight: 500, margin: 0, color: theme.color.textHeading }, children: result.totalEstimate !== null ? formatCurrency(result.totalEstimate) : '—' }), _jsx("p", { style: { fontSize: 11, color: theme.color.textSecondary, margin: '2px 0 0' }, children: "Total estimate, inc. VAT" })] })] }), _jsx("div", { style: { margin: '14px 0', paddingTop: 12, borderTop: `0.5px solid ${theme.color.border}` }, children: _jsx(FeeBreakdown, { lineItems: result.lineItems, legalFeeSubtotal: result.legalFeeSubtotal, vatTotal: result.vatTotal, disbursementsTotal: result.disbursementsTotal, sdltEstimate: result.sdltEstimate }) }), _jsxs("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' }, children: [_jsx("button", { type: "button", onClick: () => onSelect(result.firm.firmId), style: primaryButtonStyle, children: "Select this firm" }), _jsx("button", { type: "button", onClick: () => onEmailQuote(result.firm.firmId), style: secondaryButtonStyle, children: "Email quote" }), _jsx("button", { type: "button", onClick: () => onSaveQuote(result.firm.firmId), style: secondaryButtonStyle, children: "Save quote" })] })] }));
}
const primaryButtonStyle = {
    background: theme.color.accent,
    color: '#EAF3EE',
    border: 'none',
    borderRadius: theme.radius.control,
    padding: '9px 16px',
    fontSize: 13,
    cursor: 'pointer',
};
const secondaryButtonStyle = {
    background: 'transparent',
    color: theme.color.textHeading,
    border: `0.5px solid ${theme.color.border}`,
    borderRadius: theme.radius.control,
    padding: '9px 16px',
    fontSize: 13,
    cursor: 'pointer',
    marginTop: 12,
};
