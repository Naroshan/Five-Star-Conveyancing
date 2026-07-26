import type { CSSProperties } from 'react';
import type { PublicQuoteResult } from '../../api/publicResult.js';
import { theme } from '../theme.js';
import { ShieldCheckIcon, MailIcon, BookmarkIcon, PhoneIcon, RibbonBadgeIcon } from '../icons.js';
import { FeeBreakdown } from './FeeBreakdown.js';

export interface QuoteResultCardProps {
  result: PublicQuoteResult;
  onSelect: (firmId: string) => void;
  onEmailQuote: (firmId: string) => void;
  onSaveQuote: (firmId: string) => void;
  onSpeakToAdviser: (firmId: string) => void;
  /** True for the lowest-totalEstimate eligible result — a computed fact, not a fabricated claim. */
  isCheapest?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
}

/** True only if every line item on this quote is a fixed, guaranteed figure — never a fabricated "fixed fee" badge on an estimate. */
function isFullyFixedFee(result: PublicQuoteResult): boolean {
  return result.lineItems.length > 0 && result.lineItems.every((l) => l.isGuaranteed && !l.isEstimated);
}

export function QuoteResultCard({ result, onSelect, onEmailQuote, onSaveQuote, onSpeakToAdviser, isCheapest }: QuoteResultCardProps) {
  const displayName = result.firm.tradingName ?? result.firm.legalEntityName;

  if (result.eligibilityStatus === 'excluded_with_reason') {
    return (
      <div
        role="group"
        aria-label={`${displayName} — not available for this quote`}
        style={{
          background: theme.color.excludedBg,
          border: `1px solid ${theme.color.border}`,
          borderRadius: theme.radius.card,
          padding: 18,
          opacity: 0.85,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontWeight: 500, fontSize: 15, margin: 0, color: theme.color.excludedText }}>{displayName}</p>
            {result.firm.sraNumber && (
              <p style={{ fontSize: 12, color: theme.color.textSecondary, margin: '4px 0 0' }}>SRA {result.firm.sraNumber}</p>
            )}
          </div>
          <span style={{ fontSize: 11, color: theme.color.textSecondary }}>Not available for this quote</span>
        </div>
        <p
          style={{
            fontSize: 12,
            color: theme.color.textBody,
            margin: '12px 0 0',
            paddingTop: 12,
            borderTop: `1px solid ${theme.color.border}`,
          }}
        >
          {result.exclusionReason}
        </p>
        <button type="button" onClick={() => onSpeakToAdviser(result.firm.firmId)} style={secondaryButtonStyle}>
          <PhoneIcon size={14} /> Speak to an adviser
        </button>
      </div>
    );
  }

  const fixedFee = isFullyFixedFee(result);

  return (
    <div
      role="group"
      aria-label={`${displayName} quote`}
      style={{
        position: 'relative',
        background: theme.color.surfaceWhite,
        borderRadius: theme.radius.card,
        boxShadow: isCheapest ? theme.shadow.lg : theme.shadow.md,
        padding: 20,
      }}
    >
      {isCheapest && (
        <span
          style={{
            position: 'absolute',
            top: -12,
            left: 18,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: theme.gradient.cta,
            color: 'white',
            fontSize: 11,
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: theme.radius.control,
            boxShadow: theme.shadow.sm,
          }}
        >
          <RibbonBadgeIcon size={12} color="white" /> Cheapest
        </span>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontWeight: 500, fontSize: 15, margin: 0, color: theme.color.textHeading }}>{displayName}</p>
          <p style={{ fontSize: 12, color: theme.color.textSecondary, margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
            {result.firm.sraNumber && (
              <>
                <ShieldCheckIcon size={13} color={theme.color.teal} />
                <span>SRA {result.firm.sraNumber}</span>
                <span>·</span>
              </>
            )}
            <span>{fixedFee ? 'Fixed fee' : 'Estimate — some figures may vary'}</span>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 20, fontWeight: 500, margin: 0, color: theme.color.textHeading }}>
            {result.totalEstimate !== null ? formatCurrency(result.totalEstimate) : '—'}
          </p>
          <p style={{ fontSize: 11, color: theme.color.textSecondary, margin: '2px 0 0' }}>Total estimate, inc. VAT</p>
        </div>
      </div>

      <div style={{ margin: '14px 0', paddingTop: 12, borderTop: `1px solid ${theme.color.border}` }}>
        <FeeBreakdown
          lineItems={result.lineItems}
          legalFeeSubtotal={result.legalFeeSubtotal}
          vatTotal={result.vatTotal}
          disbursementsTotal={result.disbursementsTotal}
          sdltEstimate={result.sdltEstimate}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => onSelect(result.firm.firmId)} style={primaryButtonStyle}>
          Select this firm
        </button>
        <button type="button" onClick={() => onEmailQuote(result.firm.firmId)} style={secondaryButtonStyle}>
          <MailIcon size={14} /> Email quote
        </button>
        <button type="button" onClick={() => onSaveQuote(result.firm.firmId)} style={secondaryButtonStyle}>
          <BookmarkIcon size={14} /> Save quote
        </button>
      </div>
    </div>
  );
}

const primaryButtonStyle: CSSProperties = {
  background: theme.gradient.cta,
  boxShadow: theme.shadow.sm,
  color: 'white',
  fontWeight: 700,
  border: 'none',
  borderRadius: theme.radius.control,
  padding: '9px 18px',
  fontSize: 13,
  cursor: 'pointer',
};

const secondaryButtonStyle: CSSProperties = {
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
};
