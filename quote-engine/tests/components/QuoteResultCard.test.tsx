// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuoteResultCard } from '../../src/components/QuoteResults/QuoteResultCard.js';
import type { PublicQuoteResult } from '../../src/api/publicResult.js';

const eligibleResult: PublicQuoteResult = {
  firm: { firmId: 'firm-a', legalEntityName: 'Test Firm A (fixture)', tradingName: null, sraNumber: '123456' },
  eligibilityStatus: 'eligible',
  exclusionReason: null,
  lineItems: [
    { chargeName: 'Legal fee', category: 'legal_fee', amountExVat: 800, vatTreatment: 'standard', vatAmount: 160, isEstimated: false, isGuaranteed: true, explanation: 'Base fee.' },
  ],
  legalFeeSubtotal: 800,
  vatTotal: 160,
  disbursementsTotal: 300,
  sdltEstimate: null,
  totalEstimate: 1_260,
};

const excludedResult: PublicQuoteResult = {
  firm: { firmId: 'firm-b', legalEntityName: 'Test Firm B (fixture)', tradingName: null, sraNumber: '654321' },
  eligibilityStatus: 'excluded_with_reason',
  exclusionReason: "This firm's maximum property value for this transaction type is £500,000.",
  lineItems: [],
  legalFeeSubtotal: 0,
  vatTotal: 0,
  disbursementsTotal: 0,
  sdltEstimate: null,
  totalEstimate: null,
};

function noop() {}

describe('QuoteResultCard — eligible result', () => {
  it('shows the firm name, SRA number, and total, and a "Fixed fee" badge when every line is guaranteed', () => {
    render(<QuoteResultCard result={eligibleResult} onSelect={noop} onEmailQuote={noop} onSaveQuote={noop} onSpeakToAdviser={noop} />);
    expect(screen.getByText('Test Firm A (fixture)')).toBeInTheDocument();
    expect(screen.getByText(/SRA 123456/)).toBeInTheDocument();
    expect(screen.getByText('£1,260.00')).toBeInTheDocument();
    expect(screen.getByText('Fixed fee')).toBeInTheDocument();
  });

  it('shows an "Estimate" label instead when any line item is not guaranteed', () => {
    const withEstimate: PublicQuoteResult = {
      ...eligibleResult,
      lineItems: [...eligibleResult.lineItems, { chargeName: 'Search pack', category: 'disbursement', amountExVat: 300, vatTreatment: 'exempt', vatAmount: 0, isEstimated: true, isGuaranteed: false, explanation: 'x' }],
    };
    render(<QuoteResultCard result={withEstimate} onSelect={noop} onEmailQuote={noop} onSaveQuote={noop} onSpeakToAdviser={noop} />);
    expect(screen.queryByText('Fixed fee')).not.toBeInTheDocument();
    expect(screen.getByText(/Estimate/)).toBeInTheDocument();
  });

  it('calls the corresponding callback with the firm id for each action button', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onEmailQuote = vi.fn();
    const onSaveQuote = vi.fn();
    render(<QuoteResultCard result={eligibleResult} onSelect={onSelect} onEmailQuote={onEmailQuote} onSaveQuote={onSaveQuote} onSpeakToAdviser={noop} />);

    await user.click(screen.getByRole('button', { name: 'Select this firm' }));
    await user.click(screen.getByRole('button', { name: 'Email quote' }));
    await user.click(screen.getByRole('button', { name: 'Save quote' }));

    expect(onSelect).toHaveBeenCalledWith('firm-a');
    expect(onEmailQuote).toHaveBeenCalledWith('firm-a');
    expect(onSaveQuote).toHaveBeenCalledWith('firm-a');
  });
});

describe('QuoteResultCard — excluded result', () => {
  it('shows the exclusion reason and only a "Speak to an adviser" action — no select/email/save', () => {
    render(<QuoteResultCard result={excludedResult} onSelect={noop} onEmailQuote={noop} onSaveQuote={noop} onSpeakToAdviser={noop} />);

    expect(screen.getByText('Test Firm B (fixture)')).toBeInTheDocument();
    expect(screen.getByText(/maximum property value/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Speak to an adviser' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Select this firm' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Email quote' })).not.toBeInTheDocument();
    expect(screen.queryByText('£')).not.toBeInTheDocument(); // never shows a total for an excluded firm
  });

  it('calls onSpeakToAdviser with the firm id', async () => {
    const user = userEvent.setup();
    const onSpeakToAdviser = vi.fn();
    render(<QuoteResultCard result={excludedResult} onSelect={noop} onEmailQuote={noop} onSaveQuote={noop} onSpeakToAdviser={onSpeakToAdviser} />);

    await user.click(screen.getByRole('button', { name: 'Speak to an adviser' }));
    expect(onSpeakToAdviser).toHaveBeenCalledWith('firm-b');
  });
});
