-- Five Star Conveyancing — Quote Engine schema (subset of the full Stage 4 data architecture)
-- Structural only. No real firm, fee, or lender data. PostgreSQL dialect.

create extension if not exists "pgcrypto";

create table firms (
  firm_id uuid primary key default gen_random_uuid(),
  legal_entity_name text not null,
  trading_name text,
  sra_number text,
  status text not null check (status in ('pending', 'active', 'suspended', 'removed')),
  quote_validity_days integer not null default 30,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table firm_transaction_types (
  firm_id uuid not null references firms(firm_id),
  transaction_type text not null check (transaction_type in
    ('sale', 'purchase', 'sale_and_purchase', 'remortgage', 'transfer_of_equity', 'lease_extension')),
  accepted boolean not null default true,
  primary key (firm_id, transaction_type)
);

create table firm_restrictions (
  restriction_id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references firms(firm_id),
  transaction_type text not null,
  restriction_type text not null, -- 'property_value' | 'leasehold' | 'new_build' | 'geographic' | etc.
  value_min numeric,
  value_max numeric,
  notes text
);

create table fee_value_bands (
  band_id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references firms(firm_id),
  transaction_type text not null,
  value_min numeric not null,
  value_max numeric, -- null = no upper bound
  boundary_rule text not null check (boundary_rule in ('inclusive_lower', 'inclusive_upper')),
  base_fee numeric not null,
  effective_date date not null,
  expiry_date date,
  approval_status text not null default 'draft'
    check (approval_status in ('draft', 'pending_review', 'approved', 'rejected'))
);

create table fee_rules (
  fee_rule_id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references firms(firm_id),
  transaction_type text not null,
  charge_name text not null,
  charge_type text not null check (charge_type in ('base_fee', 'supplement')),
  trigger_key text, -- null for base_fee rows; the client-answer flag that activates a supplement
  calculation_type text not null check (calculation_type in ('fixed', 'formula')),
  amount numeric,
  min_amount numeric,
  max_amount numeric,
  formula_expression text,
  vat_treatment text not null check (vat_treatment in ('standard', 'exempt', 'outside_scope')),
  is_guaranteed boolean not null default false,
  is_estimated boolean not null default false,
  effective_date date not null,
  expiry_date date,
  approval_status text not null default 'draft'
    check (approval_status in ('draft', 'pending_review', 'approved', 'rejected')),
  display_order integer not null default 0,
  client_facing_explanation text not null
);

create table disbursement_rules (
  disbursement_id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references firms(firm_id),
  transaction_type text not null,
  charge_name text not null,
  category text not null,
  amount_type text not null check (amount_type in ('fixed', 'estimated_range', 'excluded')),
  amount numeric,
  min_amount numeric,
  max_amount numeric,
  vat_treatment text not null check (vat_treatment in ('standard', 'exempt', 'outside_scope')),
  conditional_trigger_expression text,
  effective_date date not null,
  expiry_date date,
  approval_status text not null default 'draft'
    check (approval_status in ('draft', 'pending_review', 'approved', 'rejected')),
  display_order integer not null default 0,
  client_facing_explanation text not null
);

create table sdlt_ltt_rate_table (
  rate_id uuid primary key default gen_random_uuid(),
  jurisdiction text not null check (jurisdiction in ('england', 'wales')),
  band_min numeric not null,
  band_max numeric, -- null = no upper bound
  rate_percentage numeric not null,
  relief_type text,
  effective_date date not null,
  expiry_date date,
  source_reference text not null -- must cite an authoritative source before use in production
);

create table quotes (
  quote_id uuid primary key default gen_random_uuid(),
  quote_reference text not null unique, -- opaque token, safe to appear in a URL
  transaction_type text not null,
  client_answers jsonb not null,
  created_at timestamptz not null default now(),
  expiry_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'expired', 'converted'))
);

create table quote_results (
  result_id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes(quote_id),
  firm_id uuid not null references firms(firm_id),
  eligibility_status text not null check (eligibility_status in ('eligible', 'excluded_with_reason')),
  exclusion_reason text,
  legal_fee_subtotal numeric,
  vat_amount numeric,
  disbursements_total numeric,
  sdlt_estimate numeric,
  total_estimate numeric,
  calculation_audit jsonb not null
);

create index idx_fee_value_bands_lookup on fee_value_bands (firm_id, transaction_type, approval_status);
create index idx_fee_rules_lookup on fee_rules (firm_id, transaction_type, approval_status);
create index idx_disbursement_rules_lookup on disbursement_rules (firm_id, transaction_type, approval_status);
create index idx_quote_results_quote on quote_results (quote_id);
