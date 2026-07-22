import { redirect } from "next/navigation";
import { getCurrentAdminUser, isMfaEnabledFor } from "@/lib/adminSession";

export default async function AdminIndexPage() {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/admin/login");
  if (!(await isMfaEnabledFor(user.userId))) redirect("/admin/mfa-setup");
  redirect("/admin/fee-rules");
}
