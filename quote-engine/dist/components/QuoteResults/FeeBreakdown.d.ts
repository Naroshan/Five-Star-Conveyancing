import type { LineItem } from '../../types.js';
export interface FeeBreakdownProps {
    lineItems: LineItem[];
    legalFeeSubtotal: number;
    vatTotal: number;
    disbursementsTotal: number;
    sdltEstimate: number | null;
}
/**
 * Starts collapsed on every breakpoint (Stage 5 confirmed decision — see
 * README) behind a "see full breakdown" toggle, then shows the itemised
 * lines grouped by category once expanded.
 */
export declare function FeeBreakdown({ lineItems, legalFeeSubtotal, vatTotal, disbursementsTotal, sdltEstimate }: FeeBreakdownProps): import("react").JSX.Element;
