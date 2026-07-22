import type { PublicQuoteResult } from '../../api/publicResult.js';
export interface QuoteResultCardProps {
    result: PublicQuoteResult;
    onSelect: (firmId: string) => void;
    onEmailQuote: (firmId: string) => void;
    onSaveQuote: (firmId: string) => void;
    onSpeakToAdviser: (firmId: string) => void;
}
export declare function QuoteResultCard({ result, onSelect, onEmailQuote, onSaveQuote, onSpeakToAdviser }: QuoteResultCardProps): import("react").JSX.Element;
