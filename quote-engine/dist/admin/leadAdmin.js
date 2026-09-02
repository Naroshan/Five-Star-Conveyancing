// Five Star Conveyancing — lead admin service
// Read-only access to the leads captured on `quotes` (see
// db/repository.ts's listRecentLeads) for whoever holds 'leads:view' —
// currently super_admin and lead_management_user. This is the actual
// database-backed record of a lead; the Formspree notification the
// frontend also fires is a best-effort alert, not the record of truth.
import { listRecentLeads } from '../db/repository.js';
import { assertPermission } from './roles.js';
export async function listLeads(db, user, limit) {
    assertPermission(user, 'leads:view');
    return listRecentLeads(db, limit);
}
