import type { ColumnType, Generated } from 'kysely';
type Timestamp = ColumnType<Date, Date | string | undefined, Date | string>;
type DateOnly = ColumnType<Date, Date | string, Date | string>;
export interface FirmsTable {
    firm_id: Generated<string>;
    legal_entity_name: string;
    trading_name: string | null;
    sra_number: string | null;
    status: 'pending' | 'active' | 'suspended' | 'removed';
    quote_validity_days: number;
    created_at: Generated<Timestamp>;
    updated_at: Generated<Timestamp>;
}
export interface FirmTransactionTypesTable {
    firm_id: string;
    transaction_type: string;
    accepted: boolean;
}
export interface FirmRestrictionsTable {
    restriction_id: Generated<string>;
    firm_id: string;
    transaction_type: string;
    restriction_type: string;
    value_min: number | null;
    value_max: number | null;
    notes: string | null;
}
export interface FeeValueBandsTable {
    band_id: Generated<string>;
    firm_id: string;
    transaction_type: string;
    value_min: number;
    value_max: number | null;
    boundary_rule: 'inclusive_lower' | 'inclusive_upper';
    base_fee: number;
    effective_date: DateOnly;
    expiry_date: DateOnly | null;
    approval_status: 'draft' | 'pending_review' | 'approved' | 'rejected';
    created_by: string | null;
    last_modified_by: string | null;
    supersedes_band_id: string | null;
}
export interface FeeRulesTable {
    fee_rule_id: Generated<string>;
    firm_id: string;
    transaction_type: string;
    charge_name: string;
    charge_type: 'base_fee' | 'supplement';
    trigger_key: string | null;
    calculation_type: 'fixed' | 'formula';
    amount: number | null;
    min_amount: number | null;
    max_amount: number | null;
    formula_expression: string | null;
    vat_treatment: 'standard' | 'exempt' | 'outside_scope';
    is_guaranteed: boolean;
    is_estimated: boolean;
    effective_date: DateOnly;
    expiry_date: DateOnly | null;
    approval_status: 'draft' | 'pending_review' | 'approved' | 'rejected';
    display_order: number;
    client_facing_explanation: string;
    created_by: string | null;
    last_modified_by: string | null;
    supersedes_fee_rule_id: string | null;
}
export interface DisbursementRulesTable {
    disbursement_id: Generated<string>;
    firm_id: string;
    transaction_type: string;
    charge_name: string;
    category: string;
    amount_type: 'fixed' | 'estimated_range' | 'excluded';
    amount: number | null;
    min_amount: number | null;
    max_amount: number | null;
    vat_treatment: 'standard' | 'exempt' | 'outside_scope';
    conditional_trigger_expression: string | null;
    effective_date: DateOnly;
    expiry_date: DateOnly | null;
    approval_status: 'draft' | 'pending_review' | 'approved' | 'rejected';
    display_order: number;
    client_facing_explanation: string;
    created_by: string | null;
    last_modified_by: string | null;
    supersedes_disbursement_id: string | null;
}
export interface SdltLttRateTable {
    rate_id: Generated<string>;
    jurisdiction: 'england' | 'wales';
    band_min: number;
    band_max: number | null;
    rate_percentage: number;
    relief_type: string | null;
    effective_date: DateOnly;
    expiry_date: DateOnly | null;
    source_reference: string;
}
export interface QuotesTable {
    quote_id: Generated<string>;
    quote_reference: string;
    transaction_type: string;
    client_answers: unknown;
    created_at: Generated<Timestamp>;
    expiry_at: Timestamp;
    status: 'active' | 'expired' | 'converted';
}
export interface QuoteResultsTable {
    result_id: Generated<string>;
    quote_id: string;
    firm_id: string;
    eligibility_status: 'eligible' | 'excluded_with_reason';
    exclusion_reason: string | null;
    line_items: unknown;
    legal_fee_subtotal: number | null;
    vat_amount: number | null;
    disbursements_total: number | null;
    sdlt_estimate: number | null;
    total_estimate: number | null;
    calculation_audit: unknown;
}
export interface AdminUsersTable {
    user_id: Generated<string>;
    name: string;
    email: string;
    role: 'super_admin' | 'content_editor' | 'fee_administrator' | 'compliance_reviewer' | 'firm_user' | 'lead_management_user' | 'reporting_user';
    firm_id: string | null;
    password_hash: string;
    mfa_secret: string | null;
    mfa_enabled: Generated<boolean>;
    account_status: Generated<'active' | 'suspended'>;
    failed_login_attempts: Generated<number>;
    locked_until: Timestamp | null;
    created_at: Generated<Timestamp>;
}
export interface AdminSessionsTable {
    session_id: Generated<string>;
    user_id: string;
    created_at: Generated<Timestamp>;
    expires_at: Timestamp;
    last_used_at: Generated<Timestamp>;
    user_agent: string | null;
}
export interface AuditLogTable {
    log_id: Generated<string>;
    actor_user_id: string;
    entity_type: string;
    entity_id: string;
    action: 'create' | 'update' | 'submit_for_review' | 'approve' | 'reject';
    before_value: unknown;
    after_value: unknown;
    reason: string | null;
    created_at: Generated<Timestamp>;
}
export interface Database {
    firms: FirmsTable;
    firm_transaction_types: FirmTransactionTypesTable;
    firm_restrictions: FirmRestrictionsTable;
    admin_users: AdminUsersTable;
    admin_sessions: AdminSessionsTable;
    audit_log: AuditLogTable;
    fee_value_bands: FeeValueBandsTable;
    fee_rules: FeeRulesTable;
    disbursement_rules: DisbursementRulesTable;
    sdlt_ltt_rate_table: SdltLttRateTable;
    quotes: QuotesTable;
    quote_results: QuoteResultsTable;
}
export {};
