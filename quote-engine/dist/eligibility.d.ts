import type { ClientAnswers, FirmRuleSet } from './types.js';
export interface EligibilityCheck {
    eligible: boolean;
    reason: string | null;
}
export declare function checkEligibility(ruleSet: FirmRuleSet, answers: ClientAnswers): EligibilityCheck;
