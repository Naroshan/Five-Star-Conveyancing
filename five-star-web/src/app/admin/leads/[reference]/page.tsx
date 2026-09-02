import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { AdminUserBar } from "@/components/AdminUserBar";
import { AdminNav } from "@/components/AdminNav";
import { getCurrentAdminUser, isMfaEnabledFor } from "@/lib/adminSession";
import { db } from "@/lib/db";
import { getLeadDetail } from "five-star-conveyancing-quote-engine/admin/leadAdmin";
import { TEXT_HEADING, TEXT_MUTED, BORDER } from "@/lib/theme";
import { ForbiddenError } from "five-star-conveyancing-quote-engine/admin/roles";

function money(value: number | null): string {
  return value === null ? "n/a" : `£${value.toFixed(2)}`;
}

export default async function LeadDetailPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const user = await getCurrentAdminUser();
  if (!user) redirect("/admin/login");
  if (!(await isMfaEnabledFor(user.userId))) redirect("/admin/mfa-setup");

  let lead: Awaited<ReturnType<typeof getLeadDetail>> = null;
  let permissionError: string | null = null;
  try {
    lead = await getLeadDetail(db, user, reference);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      permissionError = `Your role (${user.role}) doesn't include permission to view leads.`;
    } else {
      throw err;
    }
  }

  if (!permissionError && !lead) notFound();

  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        <AdminNav current="leads" />
        <p style={{ margin: "8px 0" }}>
          <Link href="/admin/leads" style={{ fontSize: 13, color: TEXT_MUTED }}>
            ← Back to leads
          </Link>
        </p>
        <h1 style={{ fontSize: 20, fontWeight: 500, color: TEXT_HEADING, margin: "8px 0 4px", fontFamily: "monospace" }}>{reference}</h1>
        <AdminUserBar name={user.name} role={user.role} />

        {permissionError && (
          <p style={{ fontSize: 14, background: "#FAEEDA", border: "0.5px solid #EF9F27", borderRadius: 8, padding: "12px 16px" }}>
            {permissionError}
          </p>
        )}

        {!permissionError && lead && (
          <>
            <section style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: TEXT_HEADING, marginBottom: 8 }}>Contact</h2>
              {lead.contact ? (
                <table style={{ fontSize: 13 }}>
                  <tbody>
                    <tr>
                      <td style={{ color: TEXT_MUTED, paddingRight: 16 }}>Name</td>
                      <td>{lead.contact.name}</td>
                    </tr>
                    <tr>
                      <td style={{ color: TEXT_MUTED, paddingRight: 16 }}>Email</td>
                      <td>{lead.contact.email}</td>
                    </tr>
                    <tr>
                      <td style={{ color: TEXT_MUTED, paddingRight: 16 }}>Phone</td>
                      <td>{lead.contact.phone}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p style={{ fontSize: 13, color: TEXT_MUTED }}>No contact details on file for this quote.</p>
              )}
            </section>

            <section style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: TEXT_HEADING, marginBottom: 8 }}>Submission</h2>
              <table style={{ fontSize: 13 }}>
                <tbody>
                  <tr>
                    <td style={{ color: TEXT_MUTED, paddingRight: 16 }}>Status</td>
                    <td>{lead.status}</td>
                  </tr>
                  <tr>
                    <td style={{ color: TEXT_MUTED, paddingRight: 16 }}>Transaction type</td>
                    <td>{lead.transactionType}</td>
                  </tr>
                  <tr>
                    <td style={{ color: TEXT_MUTED, paddingRight: 16, verticalAlign: "top" }}>Answers</td>
                    <td>
                      <pre style={{ margin: 0, fontSize: 12, background: "#F6F5FA", padding: 10, borderRadius: 6, overflowX: "auto" }}>
                        {JSON.stringify(lead.clientAnswers, null, 2)}
                      </pre>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: TEXT_HEADING, marginBottom: 8 }}>Firm results</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {lead.results.map((r) => (
                  <div key={r.firm.firmId} style={{ border: `0.5px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
                    <div style={{ fontWeight: 600, color: TEXT_HEADING }}>
                      {r.firm.tradingName ?? r.firm.legalEntityName}
                      {r.firm.sraNumber ? ` (SRA ${r.firm.sraNumber})` : ""}
                    </div>
                    {r.eligibilityStatus === "excluded_with_reason" ? (
                      <p style={{ color: TEXT_MUTED, margin: "4px 0 0" }}>Excluded: {r.exclusionReason}</p>
                    ) : (
                      <p style={{ color: TEXT_MUTED, margin: "4px 0 0" }}>
                        Legal fee {money(r.legalFeeSubtotal)} · VAT {money(r.vatTotal)} · Disbursements {money(r.disbursementsTotal)} · SDLT{" "}
                        {money(r.sdltEstimate)} · Total {money(r.totalEstimate)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
