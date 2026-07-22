// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuoteResultsList } from '../../src/components/QuoteResults/QuoteResultsList.js';
import type { PublicQuoteResult } from '../../src/api/publicResult.js';

function makeResult(overrides: Partial<PublicQuoteResult> & { firmId: string; name: string }): PublicQuoteResult {
  return {
    firm: { firmId: overrides.firmId, legalEntityName: overrides.name, tradingName: null, sraNumber: '111111' },
    eligibilityStatus: 'eligible',
    exclusionReason: null,
    lineItems: [
      { chargeName: 'Legal fee', category: 'legal_fee', amountExVat: 0, vatTreatment: 'standard', vatAmount: 0, isEstimated: false, isGuaranteed: true, explanation: '' },
    ],
    legalFeeSubtotal: 0,
    vatTotal: 0,
    disbursementsTotal: 0,
    sdltEstimate: null,
    totalEstimate: 0,
    ...overrides,
  };
}

const cheapFixed = makeResult({ firmId: 'firm-cheap', name: 'Cheap Fixed Firm', legalFeeSubtotal: 500, totalEstimate: 900 });
const expensiveEstimate = makeResult({
  firmId: 'firm-pricey',
  name: 'Pricey Estimate Firm',
  legalFeeSubtotal: 900,
  totalEstimate: 1_500,
  lineItems: [
    { chargeName: 'Legal fee', category: 'legal_fee', amountExVat: 900, vatTreatment: 'standard', vatAmount: 180, isEstimated: false, isGuaranteed: true, explanation: '' },
    { chargeName: 'Search pack', category: 'disbursement', amountExVat: 300, vatTreatment: 'exempt', vatAmount: 0, isEstimated: true, isGuaranteed: false, explanation: '' },
  ],
});
const excluded = makeResult({
  firmId: 'firm-excluded',
  name: 'Excluded Firm',
  eligibilityStatus: 'excluded_with_reason',
  exclusionReason: 'Does not accept this transaction type.',
  totalEstimate: null,
});

function noop() {}

describe('QuoteResultsList', () => {
  it('shows an empty state with a speak-to-adviser CTA when there are no results at all', () => {
    render(<QuoteResultsList results={[]} onSelect={noop} onEmailQuote={noop} onSaveQuote={noop} onSpeakToAdviser={noop} />);
    expect(screen.getByText(/couldn't find a quote/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Speak to an adviser' })).toBeInTheDocument();
  });

  it('shows a "no eligible firms" banner but still lists excluded firms with their reasons, when every result is excluded', () => {
    render(<QuoteResultsList results={[excluded]} onSelect={noop} onEmailQuote={noop} onSaveQuote={noop} onSpeakToAdviser={noop} />);
    expect(screen.getByText(/No firms matched every answer/)).toBeInTheDocument();
    expect(screen.getByText('Excluded Firm')).toBeInTheDocument();
    expect(screen.getByText('Does not accept this transaction type.')).toBeInTheDocument();
  });

  it('sorts by lowest total cost by default', () => {
    render(
      <QuoteResultsList results={[expensiveEstimate, cheapFixed]} onSelect={noop} onEmailQuote={noop} onSaveQuote={noop} onSpeakToAdviser={noop} />
    );
    const names = screen.getAllByRole('group').map((el) => within(el).getByText(/Firm$/).textContent);
    expect(names[0]).toBe('Cheap Fixed Firm');
    expect(names[1]).toBe('Pricey Estimate Firm');
  });

  it('re-sorts by legal fee when the sort dropdown changes', async () => {
    const user = userEvent.setup();
    // Make the "cheap total" firm have the higher legal fee to prove the sort key actually changes.
    const cheapTotalHighLegalFee = { ...cheapFixed, legalFeeSubtotal: 2_000 };
    render(
      <QuoteResultsList
        results={[cheapTotalHighLegalFee, expensiveEstimate]}
        onSelect={noop}
        onEmailQuote={noop}
        onSaveQuote={noop}
        onSpeakToAdviser={noop}
      />
    );

    await user.selectOptions(screen.getByLabelText('Sort by'), 'Legal fee');

    const names = screen.getAllByRole('group').map((el) => within(el).getByText(/Firm$/).textContent);
    expect(names[0]).toBe('Pricey Estimate Firm'); // legal fee 900, lower than 2,000
  });

  it('filters to fixed-fee-only firms when the checkbox is checked, and excluded firms remain visible regardless', async () => {
    const user = userEvent.setup();
    render(
      <QuoteResultsList
        results={[cheapFixed, expensiveEstimate, excluded]}
        onSelect={noop}
        onEmailQuote={noop}
        onSaveQuote={noop}
        onSpeakToAdviser={noop}
      />
    );

    await user.click(screen.getByLabelText('Fixed fee only'));

    expect(screen.getByText('Cheap Fixed Firm')).toBeInTheDocument();
    expect(screen.queryByText('Pricey Estimate Firm')).not.toBeInTheDocument(); // has an estimated line item
    expect(screen.getByText('Excluded Firm')).toBeInTheDocument(); // exclusions are never filtered out
  });
});
