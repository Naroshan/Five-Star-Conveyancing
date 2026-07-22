import { useMemo, useState } from 'react';
import type { PublicQuoteResult } from '../../api/publicResult.js';
import { theme } from '../theme.js';
import { QuoteResultCard } from './QuoteResultCard.js';

export interface QuoteResultsListProps {
  results: PublicQuoteResult[];
  onSelect: (firmId: string) => void;
  onEmailQuote: (firmId: string) => void;
  onSaveQuote: (firmId: string) => void;
  onSpeakToAdviser: (firmId: string) => void;
}

type SortOption = 'total_cost' | 'legal_fee';

// Stage 3 (FR8) also specifies sorting/filtering by review rating, response
// time, lender-panel compatibility, and local office. Those aren't wired up
// here because the current API response doesn't carry that data yet (it
// lives in firm_reviews / firm_offices / lender_firm_panel — see Stage 4 —
// which the API layer hasn't been extended to join in). Only sorts backed
// by real data in the response are implemented; nothing here is a
// placeholder that looks functional but isn't.
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'total_cost', label: 'Lowest total cost' },
  { value: 'legal_fee', label: 'Legal fee' },
];

function isFullyFixedFee(result: PublicQuoteResult): boolean {
  return result.lineItems.length > 0 && result.lineItems.every((l) => l.isGuaranteed && !l.isEstimated);
}

export function QuoteResultsList({ results, onSelect, onEmailQuote, onSaveQuote, onSpeakToAdviser }: QuoteResultsListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('total_cost');
  const [fixedFeeOnly, setFixedFeeOnly] = useState(false);

  const eligible = useMemo(() => results.filter((r) => r.eligibilityStatus === 'eligible'), [results]);
  const excluded = useMemo(() => results.filter((r) => r.eligibilityStatus === 'excluded_with_reason'), [results]);

  const visibleEligible = useMemo(() => {
    const filtered = fixedFeeOnly ? eligible.filter(isFullyFixedFee) : eligible;
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'total_cost') return (a.totalEstimate ?? Infinity) - (b.totalEstimate ?? Infinity);
      return a.legalFeeSubtotal - b.legalFeeSubtotal;
    });
    return sorted;
  }, [eligible, sortBy, fixedFeeOnly]);

  if (results.length === 0) {
    return (
      <div style={emptyStateStyle}>
        <p style={{ fontWeight: 500, fontSize: 16, margin: '0 0 4px', color: theme.color.textHeading }}>
          We couldn't find a quote for this
        </p>
        <p style={{ fontSize: 13, color: theme.color.textSecondary, margin: '0 0 16px' }}>
          None of our participating firms currently cover this type of transaction. An adviser can help you find the right
          option.
        </p>
        <button type="button" onClick={() => onSpeakToAdviser('')} style={adviserButtonStyle}>
          Speak to an adviser
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {eligible.length > 0 && (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', fontSize: 13 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Sort by
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} style={selectStyle}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={fixedFeeOnly} onChange={(e) => setFixedFeeOnly(e.target.checked)} />
            Fixed fee only
          </label>
        </div>
      )}

      {eligible.length === 0 && (
        <div style={emptyStateStyle}>
          <p style={{ fontWeight: 500, fontSize: 16, margin: '0 0 4px', color: theme.color.textHeading }}>
            No firms matched every answer this time
          </p>
          <p style={{ fontSize: 13, color: theme.color.textSecondary, margin: 0 }}>
            The firms below couldn't be included, with the reason shown for each. An adviser can help with alternatives.
          </p>
        </div>
      )}

      {visibleEligible.map((result) => (
        <QuoteResultCard
          key={result.firm.firmId}
          result={result}
          onSelect={onSelect}
          onEmailQuote={onEmailQuote}
          onSaveQuote={onSaveQuote}
          onSpeakToAdviser={onSpeakToAdviser}
        />
      ))}

      {/* Excluded firms are always shown, never hidden — Stage 1/2 decision: "shown with a reason" rather than silently dropped. */}
      {excluded.map((result) => (
        <QuoteResultCard
          key={result.firm.firmId}
          result={result}
          onSelect={onSelect}
          onEmailQuote={onEmailQuote}
          onSaveQuote={onSaveQuote}
          onSpeakToAdviser={onSpeakToAdviser}
        />
      ))}
    </div>
  );
}

const emptyStateStyle = {
  background: theme.color.offWhite,
  border: `0.5px solid ${theme.color.border}`,
  borderRadius: theme.radius.card,
  padding: 20,
  textAlign: 'center' as const,
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
