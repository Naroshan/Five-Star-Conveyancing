// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeeBreakdown } from '../../src/components/QuoteResults/FeeBreakdown.js';
import type { LineItem } from '../../src/types.js';

const lineItems: LineItem[] = [
  { chargeName: 'Legal fee', category: 'legal_fee', amountExVat: 800, vatTreatment: 'standard', vatAmount: 160, isEstimated: false, isGuaranteed: true, explanation: 'Base fee.' },
  { chargeName: 'Leasehold supplement', category: 'supplement', amountExVat: 150, vatTreatment: 'standard', vatAmount: 30, isEstimated: false, isGuaranteed: true, explanation: 'Lease review.' },
  { chargeName: 'Search pack', category: 'disbursement', amountExVat: 300, vatTreatment: 'exempt', vatAmount: 0, isEstimated: true, isGuaranteed: false, explanation: 'Searches.' },
];

describe('FeeBreakdown', () => {
  it('shows the subtotal lines immediately, starts collapsed, and does not show itemised lines yet', () => {
    render(<FeeBreakdown lineItems={lineItems} legalFeeSubtotal={950} vatTotal={190} disbursementsTotal={300} sdltEstimate={null} />);

    expect(screen.getByText('Legal fee')).toBeInTheDocument();
    expect(screen.getByText('£950.00')).toBeInTheDocument();
    expect(screen.getByText('See full breakdown')).toBeInTheDocument();
    expect(screen.queryByText('Leasehold supplement')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /see full breakdown/i })).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands to show itemised lines, including an "(estimated)" marker, when toggled', async () => {
    const user = userEvent.setup();
    render(<FeeBreakdown lineItems={lineItems} legalFeeSubtotal={950} vatTotal={190} disbursementsTotal={300} sdltEstimate={null} />);

    await user.click(screen.getByRole('button', { name: /see full breakdown/i }));

    expect(screen.getByText('Leasehold supplement')).toBeInTheDocument();
    expect(screen.getByText(/Search pack/)).toBeInTheDocument();
    expect(screen.getByText('(estimated)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hide full breakdown/i })).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows an SDLT line only when an estimate is provided', () => {
    const { rerender } = render(
      <FeeBreakdown lineItems={lineItems} legalFeeSubtotal={950} vatTotal={190} disbursementsTotal={300} sdltEstimate={null} />
    );
    expect(screen.queryByText(/Stamp Duty/)).not.toBeInTheDocument();

    rerender(<FeeBreakdown lineItems={lineItems} legalFeeSubtotal={950} vatTotal={190} disbursementsTotal={300} sdltEstimate={2_000} />);
    expect(screen.getByText(/Stamp Duty/)).toBeInTheDocument();
    expect(screen.getByText('£2,000.00')).toBeInTheDocument();
  });
});
