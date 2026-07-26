import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { AdminUserBar } from "@/components/AdminUserBar";
import { AdminNav } from "@/components/AdminNav";
import { getCurrentAdminUser, isMfaEnabledFor } from "@/lib/adminSession";
import { db } from "@/lib/db";
import { listPendingFeeValueBandApprovals } from "five-star-conveyancing-quote-engine/admin/feeValueBandAdmin";
import { TEXT_HEADING, TEXT_MUTED, BORDER } from "@/lib/theme";
import { ForbiddenError } from "five-star-conveyancing-quote-engine/admin/roles";

export default async function PendingFeeBandsPage() {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/admin/login");
  if (!(await isMfaEnabledFor(user.userId))) redirect("/admin/mfa-setup");

  let pending: Awaited<ReturnType<typeof listPendingFeeValueBandApprovals>> = [];
  let permissionError: string | null = null;
  try {
    pending = await listPendingFeeValueBandApprovals(db, user);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      permissionError = `Your role (${user.role}) doesn't include permission to review fee value bands.`;
    } else {
      throw err;
    }
  }

  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
        <AdminNav current="fee-bands" />
        <h1 style={{ fontSize: 20, fontWeight: 500, color: TEXT_HEADING, margin: "8px 0 4px" }}>Value bands awaiting review</h1>
        <AdminUserBar name={user.name} role={user.role} />

        {permissionError && (
          <p style={{ fontSize: 14, background: "#FAEEDA", border: "0.5px solid #EF9F27", borderRadius: 8, padding: "12px 16px" }}>
            {permissionError}
          </p>
        )}

        {!permissionError && pending.length === 0 && (
          <p style={{ fontSize: 14, color: TEXT_MUTED }}>Nothing is currently pending review.</p>
        )}

        {!permissionError && pending.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pending.map((band) => (
              <Link
                key={band.bandId}
                href={`/admin/fee-bands/${band.bandId}`}
                style={{ display: "block", background: "white", border: `0.5px solid ${BORDER}`, borderRadius: 8, padding: "12px 16px", textDecoration: "none", color: "inherit" }}
              >
                <span style={{ fontWeight: 500, fontSize: 14, display: "block", color: TEXT_HEADING }}>
                  £{band.valueMin.toLocaleString()}–{band.valueMax !== null ? `£${band.valueMax.toLocaleString()}` : "no limit"}
                </span>
                <span style={{ fontSize: 12, color: TEXT_MUTED }}>
                  {band.transactionType} · base fee £{band.baseFee}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
