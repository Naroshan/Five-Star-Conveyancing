import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentAdminUser, isMfaEnabledFor } from "@/lib/adminSession";
import { AdminUserBar } from "@/components/AdminUserBar";
import { AdminNav } from "@/components/AdminNav";
import { db } from "@/lib/db";
import { approveFeeValueBand, getFeeValueBandById, rejectFeeValueBand } from "five-star-conveyancing-quote-engine/admin/feeValueBandAdmin";
import { InvalidStateError } from "five-star-conveyancing-quote-engine/admin/feeRuleAdmin";
import { ForbiddenError } from "five-star-conveyancing-quote-engine/admin/roles";
import { listAuditLogForEntity } from "five-star-conveyancing-quote-engine/admin/auditLog";

async function approveAction(bandId: string) {
  "use server";
  const user = await getCurrentAdminUser();
  if (!user) redirect("/admin/login");
  try {
    await approveFeeValueBand(db, user, bandId);
  } catch (err) {
    const message = err instanceof ForbiddenError || err instanceof InvalidStateError ? err.message : "Something went wrong approving this band.";
    redirect(`/admin/fee-bands/${bandId}?error=${encodeURIComponent(message)}`);
  }
  redirect("/admin/fee-bands");
}

async function rejectAction(bandId: string, formData: FormData) {
  "use server";
  const user = await getCurrentAdminUser();
  if (!user) redirect("/admin/login");
  const reason = String(formData.get("reason") ?? "");
  try {
    await rejectFeeValueBand(db, user, bandId, reason);
  } catch (err) {
    const message = err instanceof ForbiddenError || err instanceof InvalidStateError ? err.message : "Something went wrong rejecting this band.";
    redirect(`/admin/fee-bands/${bandId}?error=${encodeURIComponent(message)}`);
  }
  redirect("/admin/fee-bands");
}

export default async function FeeBandDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const user = await getCurrentAdminUser();
  if (!user) redirect("/admin/login");
  if (!(await isMfaEnabledFor(user.userId))) redirect("/admin/mfa-setup");

  let band;
  try {
    band = await getFeeValueBandById(db, user, id);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return (
        <>
          <SiteHeader />
          <main style={{ maxWidth: 560, margin: "0 auto", padding: "32px 24px" }}>
            <p style={{ fontSize: 14 }}>Your role ({user.role}) doesn&apos;t include permission to view value bands.</p>
          </main>
        </>
      );
    }
    notFound();
  }

  const auditEntries = await listAuditLogForEntity(db, "fee_value_band", id);
  const boundApprove = approveAction.bind(null, id);
  const boundReject = rejectAction.bind(null, id);
  const canApprove = band.approvalStatus === "pending_review";

  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 560, margin: "0 auto", padding: "32px 24px" }}>
        <AdminNav current="fee-bands" />
        <Link href="/admin/fee-bands" style={{ fontSize: 12 }}>
          ← Back to pending review
        </Link>

        <h1 style={{ fontSize: 20, fontWeight: 500, color: "var(--text-heading)", margin: "8px 0 4px" }}>
          £{band.valueMin.toLocaleString()}–{band.valueMax !== null ? `£${band.valueMax.toLocaleString()}` : "no limit"}
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
          {band.transactionType} · status: {band.approvalStatus}
        </p>
        <AdminUserBar name={user.name} role={user.role} />

        {error && (
          <p style={{ fontSize: 13, background: "#FCEBEB", border: "0.5px solid #F09595", borderRadius: 8, padding: "10px 12px", marginBottom: 16 }}>
            {error}
          </p>
        )}

        <div style={{ background: "white", border: "0.5px solid var(--border)", borderRadius: 8, padding: 16, marginBottom: 20 }}>
          <Row label="Base fee">£{band.baseFee}</Row>
          <Row label="Boundary rule">{band.boundaryRule}</Row>
          <Row label="Effective date">{band.effectiveDate}</Row>
          <Row label="Expiry date">{band.expiryDate ?? "— (currently open-ended)"}</Row>
          <Row label="Supersedes">{band.supersedesBandId ?? "— (not a replacement for an existing band)"}</Row>
        </div>

        {canApprove ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <form action={boundApprove}>
              <button type="submit" style={{ background: "var(--accent)", color: "#EAF3EE", border: "none", borderRadius: 6, padding: "10px 18px", fontSize: 14 }}>
                Approve
              </button>
            </form>
            <form action={boundReject} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 500 }}>
                Reject with a reason
                <textarea name="reason" required rows={3} style={{ display: "block", width: "100%", marginTop: 4 }} />
              </label>
              <button type="submit" style={{ alignSelf: "flex-start", background: "transparent", border: "0.5px solid var(--border)", borderRadius: 6, padding: "10px 18px", fontSize: 14 }}>
                Reject
              </button>
            </form>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            This band is &quot;{band.approvalStatus}&quot; and isn&apos;t awaiting review right now.
          </p>
        )}

        <h2 style={{ fontSize: 15, fontWeight: 500, color: "var(--text-heading)", marginTop: 28, marginBottom: 10 }}>History</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {auditEntries.map((entry) => (
            <div key={entry.logId} style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {entry.action} · {new Date(entry.createdAt).toLocaleString("en-GB")}
              {entry.reason ? ` · "${entry.reason}"` : ""}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "6px 0", borderBottom: "0.5px solid var(--border)", fontSize: 13 }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ textAlign: "right" }}>{children}</span>
    </div>
  );
}
