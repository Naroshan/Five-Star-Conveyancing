-- Adds "select this firm" lead handoff support: records which firm (if
-- any) the client picked off their quote results, and when. Mirrors the
-- same columns added to quote-engine/schema.sql.
alter table quotes
  add column selected_firm_id uuid references firms(firm_id),
  add column selected_at timestamptz;
