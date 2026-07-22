import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import AdminAppShell from "@/components/admin/AdminAppShell";
import NotAuthorised from "@/components/admin/NotAuthorised";
import "./admin.css";

export const metadata: Metadata = {
  title: "LMN Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * The authorisation gate for every console page.
 *
 * Middleware only proves a session exists. The allow-list check has to happen
 * here, because only the service-role client can read admin_users past RLS.
 *
 * Two failure modes, handled differently on purpose:
 *   401 no session      -> straight to the login screen.
 *   403 not on the team -> a dead-end screen with a sign-out button. Redirecting
 *                          here would bounce forever: middleware sends any
 *                          signed-in visitor back from /admin/login to /admin,
 *                          and this layout would refuse them again.
 */
export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const guard = await requireAdmin();

  if (!guard.ok) {
    if (guard.response.status === 403) return <NotAuthorised />;
    redirect("/admin/login");
  }

  return (
    <AdminAppShell role={guard.role} email={guard.email}>
      {children}
    </AdminAppShell>
  );
}
