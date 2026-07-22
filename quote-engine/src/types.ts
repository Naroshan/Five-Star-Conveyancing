// Five Star Conveyancing — Quote Engine types
// Mirrors schema.sql. No real firm, fee, or lender data appears anywhere in this module.

export type TransactionType =
  | 'sale'
  | 'purchase'
  | 'sale_and_purchase'
  | 'remortgage'
  | 'transfer_of_equity'
  | 'lease_extension';

export type VatTreatment = 'standard' | 'exempt' | 'outside_scope';
export type ApprovalStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';
export type BoundaryRule = 'inclusive_lower' | 'inclusive_upper';

export interface ClientAnswers {
  transactionType: TransactionType;
  postcode: string;
  jurisdiction: 'england' | 'wales';
  propertyValue: number;
  freeholdOrLeasehold: 'freehold' | 'leasehold';
  mortgageInvolved: boolean;
  lenderId?: string;
  // Arbitrary boolean flags keyed by trigger_key, e.g. newBuild, sharedOwnership,
  // helpToBuy, auction, islamicFinance, bridgingFinance, limitedCompany, giftedDeposit...
  flags: Record<string, boolean>;
}

export type AdminRole =
  | 'super_admin'
  | 'content_editor'
  | 'fee_administrator'
  | 'compliance_reviewer'
  | 'firm_user'
  | 'lead_management_user'
  | 'reporting_user';

export interface AdminUser {
  userId: string;
  name: string;
  email: string;
  role: AdminRole;
  firmId?: string; // populated only for role === 'firm_user', scopes their access
}

export type AuditAction = 'create' | 'update' | 'submit_for_review' | 'approve' | 'reject';

export interface Firm {
  firmId: string;
  legalEntityName: string;
  tradingName: string | null;
  sraNumber: string | null;
  status: 'pending' | 'active' | 'suspended' | 'removed';
  quoteValidityDays: number;
}

export interface FirmTransactionType {
  firmId: string;
  transactionType: TransactionType;
  accepted: boolean;
}

export interface FirmRestriction {
  restrictionId: string;
  firmId: string;
  transactionType: TransactionType;
  restrictionType: string; // 'property_value' | 'leasehold' | 'new_build' | 'geographic' | ...
  valueMin?: number;
  valueMax?: number;
  notes?: string;
}

export interface FeeValueBand {
  bandId: string;
  firmId: string;
  transactionType: TransactionType;
  valueMin: number;
  valueMax: number | null;
  boundaryRule: BoundaryRule;
  baseFee: number;
  effectiveDate: string;
  expiryDate: string | null;
  approvalStatus: ApprovalStatus;
  createdBy: string | null;
  lastModifiedBy: string | null;
  supersedesBandId: string | null;
}

export interface FeeRule {
  feeRuleId: string;
  firmId: string;
  transactionType: TransactionType;
  chargeName: string;
  chargeType: 'base_fee' | 'supplement';
  triggerKey: string | null;
  calculationType: 'fixed' | 'formula';
  amount: number | null;
  minAmount: number | null;
  maxAmount: number | null;
  formulaExpression: string | null;
  vatTreatment: VatTreatment;
  isGuaranteed: boolean;
  isEstimated: boolean;
  effectiveDate: string;
  expiryDate: string | null;
  approvalStatus: ApprovalStatus;
  displayOrder: number;
  clientFacingExplanation: string;
  createdBy: string | null;
  lastModifiedBy: string | null;
  supersedesFeeRuleId: string | null;
}

export interface DisbursementRule {
  disbursementId: string;
  firmId: string;
  transactionType: TransactionType;
  chargeName: string;
  category: string;
  amountType: 'fixed' | 'estimated_range' | 'excluded';
  amount: number | null;
  minAmount: number | null;
  maxAmount: number | null;
  vatTreatment: VatTreatment;
  conditionalTriggerExpression: string | null;
  effectiveDate: string;
  expiryDate: string | null;
  approvalStatus: ApprovalStatus;
  displayOrder: number;
  clientFacingExplanation: string;
  createdBy: string | null;
  lastModifiedBy: string | null;
  supersedesDisbursementId: string | null;
}

export interface SdltBand {
  jurisdiction: 'england' | 'wales';
  bandMin: number;
  bandMax: number | null;
  ratePercentage: number;
  reliefType: string | null;
  effectiveDate: string;
  expiryDate: string | null;
  sourceReference: string;
}

export interface LineItem {
  chargeName: string;
  category: 'legal_fee' | 'supplement' | 'disbursement' | 'sdlt';
  amountExVat: number;
  vatTreatment: VatTreatment;
  vatAmount: number;
  isEstimated: boolean;
  isGuaranteed: boolean;
  explanation: string;
}

export interface CalculationAuditEntry {
  step: string;
  detail: string;
  ruleId?: string;
  effectiveDateUsed?: string;
}

export interface QuoteResult {
  firmId: string;
  eligibilityStatus: 'eligible' | 'excluded_with_reason';
  exclusionReason: string | null;
  lineItems: LineItem[];
  legalFeeSubtotal: number;
  vatTotal: number;
  disbursementsTotal: number;
  sdltEstimate: number | null;
  totalEstimate: number | null;
  calculationAudit: CalculationAuditEntry[];
}

// The full set of firm-scoped rule data the engine needs for one calculation run.
export interface FirmRuleSet {
  firm: Firm;
  transactionTypes: FirmTransactionType[];
  restrictions: FirmRestriction[];
  feeValueBands: FeeValueBand[];
  feeRules: FeeRule[];
  disbursementRules: DisbursementRule[];
}
