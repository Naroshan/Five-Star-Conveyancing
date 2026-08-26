import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { theme } from '../theme.js';
import { ShieldCheckIcon, MailIcon, BookmarkIcon, PhoneIcon, RibbonBadgeIcon, MapPinIcon } from '../icons.js';
import { FeeBreakdown } from './FeeBreakdown.js';
function firmInitials(name) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}
/** Firm logo if one is on file, otherwise a plain initials badge — never a broken image, never an invented mark. */
function FirmLogo({ firm, displayName, size }) {
    const badgeStyle = {
        width: size,
        height: size,
        borderRadius: theme.radius.control,
        flexShrink: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };
    if (firm.logoUrl) {
        return (_jsx("span", { style: badgeStyle, children: _jsx("img", { src: firm.logoUrl, alt: `${displayName} logo`, style: { width: '100%', height: '100%', objectFit: 'contain' } }) }));
    }
    return (_jsx("span", { style: { ...badgeStyle, background: theme.color.excludedBg, color: theme.color.textSecondary, fontSize: size * 0.4, fontWeight: 700 }, children: firmInitials(displayName) }));
}
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
}
/** True only if every line item on this quote is a fixed, guaranteed figure — never a fabricated "fixed fee" badge on an estimate. */
function isFullyFixedFee(result) {
    return result.lineItems.length > 0 && result.lineItems.every((l) => l.isGuaranteed && !l.isEstimated);
}
export function QuoteResultCard({ result, onSelect, onEmailQuote, onSaveQuote, onSpeakToAdviser, isCheapest }) {
    const displayName = result.firm.tradingName ?? result.firm.legalEntityName;
    if (result.eligibilityStatus === 'excluded_with_reason') {
        return (_jsxs("div", { role: "group", "aria-label": `${displayName} — not available for this quote`, style: {
                background: theme.color.excludedBg,
                border: `1px solid ${theme.color.border}`,
                borderRadius: theme.radius.card,
                padding: 18,
                opacity: 0.85,
            }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'flex-start', gap: 12 }, children: [_jsx(FirmLogo, { firm: result.firm, displayName: displayName, size: 36 }), _jsxs("div", { children: [_jsx("p", { style: { fontWeight: 500, fontSize: 15, margin: 0, color: theme.color.excludedText }, children: displayName }), result.firm.sraNumber && (_jsxs("p", { style: { fontSize: 12, color: theme.color.textSecondary, margin: '4px 0 0' }, children: ["SRA ", result.firm.sraNumber] }))] })] }), _jsx("span", { style: { fontSize: 11, color: theme.color.textSecondary }, children: "Not available for this quote" })] }), _jsx("p", { style: {
                        fontSize: 12,
                        color: theme.color.textBody,
                        margin: '12px 0 0',
                        paddingTop: 12,
                        borderTop: `1px solid ${theme.color.border}`,
                    }, children: result.exclusionReason }), _jsxs("button", { type: "button", onClick: () => onSpeakToAdviser(result.firm.firmId), style: secondaryButtonStyle, children: [_jsx(PhoneIcon, { size: 14 }), " Speak to an adviser"] })] }));
    }
    const fixedFee = isFullyFixedFee(result);
    return (_jsxs("div", { role: "group", "aria-label": `${displayName} quote`, style: {
            position: 'relative',
            background: theme.color.surfaceWhite,
            borderRadius: theme.radius.card,
            boxShadow: isCheapest ? theme.shadow.lg : theme.shadow.md,
            padding: 20,
        }, children: [isCheapest && (_jsxs("span", { style: {
                    position: 'absolute',
                    top: -12,
                    left: 18,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    background: theme.gradient.cta,
                    color: theme.color.navy,
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: theme.radius.control,
                    boxShadow: theme.shadow.sm,
                }, children: [_jsx(RibbonBadgeIcon, { size: 12, color: theme.color.navy }), " Cheapest"] })), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'flex-start', gap: 12 }, children: [_jsx(FirmLogo, { firm: result.firm, displayName: displayName, size: 40 }), _jsxs("div", { children: [_jsx("p", { style: { fontWeight: 500, fontSize: 15, margin: 0, color: theme.color.textHeading }, children: displayName }), _jsxs("p", { style: { fontSize: 12, color: theme.color.textSecondary, margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }, children: [result.firm.sraNumber && (_jsxs(_Fragment, { children: [_jsx(ShieldCheckIcon, { size: 13, color: theme.color.teal }), _jsxs("span", { style: { fontWeight: 700 }, children: ["SRA ", result.firm.sraNumber] }), _jsx("span", { children: "\u00B7" })] })), _jsx("span", { children: fixedFee ? 'Fixed fee' : 'Estimate — some figures may vary' })] }), result.firm.address && (_jsxs("p", { style: { fontSize: 11.5, color: theme.color.textSecondary, margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }, children: [_jsx(MapPinIcon, { size: 12, color: theme.color.textSecondary }), _jsx("span", { children: result.firm.address })] }))] })] }), _jsxs("div", { style: { textAlign: 'right' }, children: [_jsx("p", { style: { fontSize: 20, fontWeight: 500, margin: 0, color: theme.color.textHeading }, children: result.totalEstimate !== null ? formatCurrency(result.totalEstimate) : '—' }), _jsx("p", { style: { fontSize: 11, color: theme.color.textSecondary, margin: '2px 0 0' }, children: "Total estimate, inc. VAT" })] })] }), _jsx("div", { style: { margin: '14px 0', paddingTop: 12, borderTop: `1px solid ${theme.color.border}` }, children: _jsx(FeeBreakdown, { lineItems: result.lineItems, legalFeeSubtotal: result.legalFeeSubtotal, vatTotal: result.vatTotal, disbursementsTotal: result.disbursementsTotal, sdltEstimate: result.sdltEstimate }) }), _jsxs("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' }, children: [_jsx("button", { type: "button", onClick: () => onSelect(result.firm.firmId), className: "cta-button", style: primaryButtonStyle, children: "Instruct this firm" }), _jsxs(HoverableSecondaryButton, { onClick: () => onEmailQuote(result.firm.firmId), children: [_jsx(MailIcon, { size: 14 }), " Email quote"] }), _jsxs(HoverableSecondaryButton, { onClick: () => onSaveQuote(result.firm.firmId), children: [_jsx(BookmarkIcon, { size: 14 }), " Save quote"] })] })] }));
}
const primaryButtonStyle = {
    background: theme.gradient.cta,
    boxShadow: theme.shadow.sm,
    color: theme.color.navy,
    fontWeight: 700,
    border: 'none',
    borderRadius: theme.radius.control,
    padding: '9px 18px',
    fontSize: 13,
    cursor: 'pointer',
};
const secondaryButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'transparent',
    color: theme.color.textHeading,
    border: `1px solid ${theme.color.border}`,
    borderRadius: theme.radius.control,
    padding: '9px 16px',
    fontSize: 13,
    cursor: 'pointer',
    marginTop: 12,
    transition: 'background 0.15s ease, border-color 0.15s ease',
};
/** No CSS module in this package (everything is inline styles) — hover state
 * driven by React state instead of a :hover rule, same pattern as elsewhere
 * in this codebase where a shared stylesheet isn't available. */
function HoverableSecondaryButton({ onClick, children }) {
    const [hovered, setHovered] = useState(false);
    return (_jsx("button", { type: "button", onClick: onClick, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false), style: {
            ...secondaryButtonStyle,
            background: hovered ? theme.color.excludedBg : secondaryButtonStyle.background,
            borderColor: hovered ? theme.color.teal : theme.color.border,
        }, children: children }));
}
