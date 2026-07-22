import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentAdminUser, isMfaEnabledFor } from "@/lib/adminSession";
import { AdminUserBar } from "@/components/AdminUserBar";
import { AdminNav } from "@/components/AdminNav";
import { db } from "@/lib/db";
import { approveFeeRule, getFeeRuleById, rejectFeeRule } from "five-star-conveyancing-quote-engine/admin/feeRuleAdmin";
import { InvalidStateError } from "five-star-conveyancing-quote-engine/admin/feeRuleAdmin";
import { ForbiddenError } from "five-star-conveyancing-quote-engine/admin/roles";
import { listAuditLogForEntity } from "five-star-conveyancing-quote-engine/admin/auditLog";

async function approveAction(feeRuleId: string) {
  "use server";
  const user = await getCurrentAdminUser();
  if (!user) redirect("/admin/login");
  try {
    await approveFeeRule(db, user, feeRuleId);
  } catch (err) {
    const message = err instanceof ForbiddenError || err instanceof InvalidStateError ? err.message : "Something went wrong approving this rule.";
    redirect(`/admin/fee-rules/${feeRuleId}?error=${encodeURIComponent(message)}`);
  }
  redirect("/admin/fee-rules");
}

async function rejectAction(feeRuleId: string, formData: FormData) {
  "use server";
  const user = await getCurrentAdminUser();
  if (!user) redirect("/admin/login");
  const reason = String(formData.get("reason") ?? "");
  try {
    await rejectFeeRule(db, user, feeRuleId, reason);
  } catch (err) {
    const message = err instanceof ForbiddenError || err instanceof InvalidStateError ? err.message : "Something went wrong rejecting this rule.";
    redirect(`/admin/fee-rules/${feeRuleId}?error=${encodeURIComponent(message)}`);
  }
  redirect("/admin/fee-rules");
}

export default async function FeeRuleDetailPage({
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

  let rule;
  try {
    rule = await getFeeRuleById(db, user, id);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return (
        <>
          <SiteHeader />
          <main style={{ maxWidth: 560, margin: "0 auto", padding: "32px 24px" }}>
            <p style={{ fontSize: 14 }}>Your role ({user.role}) doesn&apos;t include permission to view fee rules.</p>
          </main>
        </>
      );
    }
    notFound();
  }

  const auditEntries = await listAuditLogForEntity(db, "fee_rule", id);
  const boundApprove = approveAction.bind(null, id);
  const boundReject = rejectAction.bind(null, id);
  const canApprove = rule.approvalStatus === "pending_review";

  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 560, margin: "0 auto", padding: "32px 24px" }}>
        <AdminNav current="fee-rules" />
        <Link href="/admin/fee-rules" style={{ fontSize: 12 }}>
          ← Back to pending review
        </Link>

        <h1 style={{ fontSize: 20, fontWeight: 500, color: "var(--text-heading)", margin: "8px 0 4px" }}>{rule.chargeName}</h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
          {rule.transactionType} · {rule.chargeType} · status: {rule.approvalStatus}
        </p>
        <AdminUserBar name={user.name} role={user.role} />

        {error && (
          <p style={{ fontSize: 13, background: "#FCEBEB", border: "0.5px solid #F09595", borderRadius: 8, padding: "10px 12px", marginBottom: 16 }}>
            {error}
          </p>
        )}

        <div style={{ background: "white", border: "0.5px solid var(--border)", borderRadius: 8, padding: 16, marginBottom: 20 }}>
          <Row label="Amount">{rule.amount !== null ? `£${rule.amount}` : "—"}</Row>
          <Row label="VAT treatment">{rule.vatTreatment}</Row>
          <Row label="Trigger key">{rule.triggerKey ?? "— (base fee)"}</Row>
          <Row label="Effective date">{rule.effectiveDate}</Row>
          <Row label="Guaranteed / estimated">{rule.isGuaranteed ? "Guaranteed" : "Not guaranteed"} / {rule.isEstimated ? "Estimated" : "Not estimated"}</Row>
          <Row label="Client-facing explanation">{rule.clientFacingExplanation}</Row>
        </div>

        {canApprove ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <form action={boundApprove}>
              <button
                type="submit"
                style={{ background: "var(--accent)", color: "#EAF3EE", border: "none", borderRadius: 6, padding: "10px 18px", fontSize: 14 }}
              >
                Approve
              </button>
            </form>

            <form action={boundReject} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 500 }}>
                Reject with a reason
                <textarea name="reason" required rows={3} style={{ display: "block", width: "100%", marginTop: 4 }} />
              </label>
              <button
                type="submit"
                style={{ alignSelf: "flex-start", background: "transparent", border: "0.5px solid var(--border)", borderRadius: 6, padding: "10px 18px", fontSize: 14 }}
              >
                Reject
              </button>
            </form>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            This rule is &quot;{rule.approvalStatus}&quot; and isn&apos;t awaiting review right now.
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
