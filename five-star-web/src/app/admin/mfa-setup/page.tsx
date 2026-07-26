import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentAdminUser } from "@/lib/adminSession";
import { MfaSetupClient } from "@/components/MfaSetupClient";
import { TEXT_HEADING, TEXT_MUTED } from "@/lib/theme";

export default async function MfaSetupPage() {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/admin/login");

  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 420, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, color: TEXT_HEADING, marginBottom: 4 }}>Set up MFA</h1>
        <p style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 20 }}>
          Required for every admin account, per Stage 1 of this project.
        </p>
        <MfaSetupClient />
      </main>
    </>
  );
}
