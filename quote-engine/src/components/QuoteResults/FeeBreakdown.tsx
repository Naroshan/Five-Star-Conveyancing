import { useState } from 'react';
import type { LineItem } from '../../types.js';
import { theme } from '../theme.js';

export interface FeeBreakdownProps {
  lineItems: LineItem[];
  legalFeeSubtotal: number;
  vatTotal: number;
  disbursementsTotal: number;
  sdltEstimate: number | null;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
}

/**
 * Starts collapsed on every breakpoint (Stage 5 confirmed decision — see
 * README) behind a "see full breakdown" toggle, then shows the itemised
 * lines grouped by category once expanded.
 */
export function FeeBreakdown({ lineItems, legalFeeSubtotal, vatTotal, disbursementsTotal, sdltEstimate }: FeeBreakdownProps) {
  const [expanded, setExpanded] = useState(false);

  const supplements = lineItems.filter((l) => l.category === 'supplement');
  const disbursements = lineItems.filter((l) => l.category === 'disbursement');
  const baseFee = lineItems.find((l) => l.category === 'legal_fee');

  return (
    <div style={{ fontSize: 12, color: theme.color.textBody }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '3px 0',
        }}
      >
        <span>Legal fee</span>
        <span>{formatCurrency(legalFeeSubtotal)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
        <span>VAT</span>
        <span>{formatCurrency(vatTotal)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
        <span>Disbursements</span>
        <span>{formatCurrency(disbursementsTotal)}</span>
      </div>
      {sdltEstimate !== null && (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
          <span>Stamp Duty Land Tax (indicative)</span>
          <span>{formatCurrency(sdltEstimate)}</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        style={{
          background: 'none',
          border: 'none',
          padding: '6px 0 0',
          color: theme.color.accent,
          fontSize: 12,
          cursor: 'pointer',
          textDecoration: 'underline',
        }}
      >
        {expanded ? 'Hide full breakdown' : 'See full breakdown'}
      </button>

      {expanded && (
        <div
          style={{
            marginTop: 8,
            paddingTop: 8,
            borderTop: `0.5px solid ${theme.color.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {baseFee && <LineItemRow item={baseFee} />}
          {supplements.map((item) => (
            <LineItemRow key={item.chargeName} item={item} />
          ))}
          {disbursements.map((item) => (
            <LineItemRow key={item.chargeName} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function LineItemRow({ item }: { item: LineItem }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
      <span>
        {item.chargeName}
        {item.isEstimated && <span style={{ color: theme.color.textSecondary }}> (estimated)</span>}
      </span>
      <span>{formatCurrency(item.amountExVat)}</span>
    </div>
  );
}
