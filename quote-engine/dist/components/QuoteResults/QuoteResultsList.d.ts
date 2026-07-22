import type { PublicQuoteResult } from '../../api/publicResult.js';
export interface QuoteResultsListProps {
    results: PublicQuoteResult[];
    onSelect: (firmId: string) => void;
    onEmailQuote: (firmId: string) => void;
    onSaveQuote: (firmId: string) => void;
    onSpeakToAdviser: (firmId: string) => void;
}
export declare function QuoteResultsList({ results, onSelect, onEmailQuote, onSaveQuote, onSpeakToAdviser }: QuoteResultsListProps): import("react").JSX.Element;
