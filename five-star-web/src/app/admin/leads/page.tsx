import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { AdminUserBar } from "@/components/AdminUserBar";
import { AdminNav } from "@/components/AdminNav";
import { getCurrentAdminUser, isMfaEnabledFor } from "@/lib/adminSession";
import { db } from "@/lib/db";
import { listLeads, listSdltCalculatorLeads } from "five-star-conveyancing-quote-engine/admin/leadAdmin";
import { TEXT_HEADING, TEXT_MUTED, BORDER } from "@/lib/theme";
import { ForbiddenError } from "five-star-conveyancing-quote-engine/admin/roles";

export default async function LeadsPage() {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/admin/login");
  if (!(await isMfaEnabledFor(user.userId))) redirect("/admin/mfa-setup");

  let leads: Awaited<ReturnType<typeof listLeads>> = [];
  let sdltLeads: Awaited<ReturnType<typeof listSdltCalculatorLeads>> = [];
  let permissionError: string | null = null;
  try {
    leads = await listLeads(db, user);
    sdltLeads = await listSdltCalculatorLeads(db, user);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      permissionError = `Your role (${user.role}) doesn't include permission to view leads.`;
    } else {
      throw err;
    }
  }

  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        <AdminNav current="leads" />
        <h1 style={{ fontSize: 20, fontWeight: 500, color: TEXT_HEADING, margin: "8px 0 4px" }}>Leads</h1>
        <AdminUserBar name={user.name} role={user.role} />

        {permissionError && (
          <p style={{ fontSize: 14, background: "#FAEEDA", border: "0.5px solid #EF9F27", borderRadius: 8, padding: "12px 16px" }}>
            {permissionError}
          </p>
        )}

        {!permissionError && leads.length === 0 && (
          <p style={{ fontSize: 14, color: TEXT_MUTED }}>No leads with contact details yet.</p>
        )}

        {!permissionError && leads.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: `1px solid ${BORDER}` }}>
                  <th style={{ padding: "8px 10px" }}>Received</th>
                  <th style={{ padding: "8px 10px" }}>Reference</th>
                  <th style={{ padding: "8px 10px" }}>Type</th>
                  <th style={{ padding: "8px 10px" }}>Status</th>
                  <th style={{ padding: "8px 10px" }}>Name</th>
                  <th style={{ padding: "8px 10px" }}>Email</th>
                  <th style={{ padding: "8px 10px" }}>Phone</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.quoteReference} style={{ borderBottom: `0.5px solid ${BORDER}` }}>
                    <td style={{ padding: "8px 10px", color: TEXT_MUTED, whiteSpace: "nowrap" }}>
                      {new Date(lead.createdAt).toLocaleString("en-GB")}
                    </td>
                    <td style={{ padding: "8px 10px", fontFamily: "monospace", fontSize: 12 }}>
                      <Link href={`/admin/leads/${lead.quoteReference}`}>{lead.quoteReference}</Link>
                    </td>
                    <td style={{ padding: "8px 10px" }}>{lead.transactionType}</td>
                    <td style={{ padding: "8px 10px" }}>{lead.status}</td>
                    <td style={{ padding: "8px 10px" }}>{lead.contact.name}</td>
                    <td style={{ padding: "8px 10px" }}>{lead.contact.email}</td>
                    <td style={{ padding: "8px 10px", whiteSpace: "nowrap" }}>{lead.contact.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!permissionError && (
          <>
            <h2 style={{ fontSize: 16, fontWeight: 500, color: TEXT_HEADING, margin: "32px 0 4px" }}>SDLT/LTT calculator leads</h2>
            <p style={{ fontSize: 12.5, color: TEXT_MUTED, margin: "0 0 12px" }}>
              From the standalone Stamp Duty calculator — not tied to a quote comparison.
            </p>

            {sdltLeads.length === 0 && <p style={{ fontSize: 14, color: TEXT_MUTED }}>No calculator leads yet.</p>}

            {sdltLeads.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ textAlign: "left", borderBottom: `1px solid ${BORDER}` }}>
                      <th style={{ padding: "8px 10px" }}>Received</th>
                      <th style={{ padding: "8px 10px" }}>Email</th>
                      <th style={{ padding: "8px 10px" }}>Price</th>
                      <th style={{ padding: "8px 10px" }}>Jurisdiction</th>
                      <th style={{ padding: "8px 10px" }}>Buyer type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sdltLeads.map((lead) => (
                      <tr key={lead.leadId} style={{ borderBottom: `0.5px solid ${BORDER}` }}>
                        <td style={{ padding: "8px 10px", color: TEXT_MUTED, whiteSpace: "nowrap" }}>
                          {new Date(lead.createdAt).toLocaleString("en-GB")}
                        </td>
                        <td style={{ padding: "8px 10px" }}>{lead.email}</td>
                        <td style={{ padding: "8px 10px" }}>£{lead.price.toLocaleString("en-GB")}</td>
                        <td style={{ padding: "8px 10px" }}>{lead.jurisdiction}</td>
                        <td style={{ padding: "8px 10px" }}>{lead.buyerType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
