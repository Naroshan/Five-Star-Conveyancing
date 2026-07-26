import type { PublicQuoteResult } from '../../api/publicResult.js';
export interface QuoteResultCardProps {
    result: PublicQuoteResult;
    onSelect: (firmId: string) => void;
    onEmailQuote: (firmId: string) => void;
    onSaveQuote: (firmId: string) => void;
    onSpeakToAdviser: (firmId: string) => void;
    /** True for the lowest-totalEstimate eligible result — a computed fact, not a fabricated claim. */
    isCheapest?: boolean;
}
export declare function QuoteResultCard({ result, onSelect, onEmailQuote, onSaveQuote, onSpeakToAdviser, isCheapest }: QuoteResultCardProps): import("react").JSX.Element;
