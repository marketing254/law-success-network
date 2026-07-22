import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/overview — the dashboard KPI tiles and the sidebar badges.
 * One round of parallel counts; the shape below is what both read.
 */
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const db = getSupabaseAdmin();
  const count = (head: PromiseLike<{ count: number | null }>) => head;

  const since = (days: number) =>
    new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  try {
    const [
      waitlistTotal,
      waitlistNew,
      waitlist24h,
      membersTotal,
      membersActive,
      membersWeek,
      expertsTotal,
      expertsNew,
      expertsReviewing,
      expertsApproved,
      expertsDeclined,
      expertsOnboarded,
      partnersTotal,
      partnersPending,
      partnersApproved,
      partnersRejected,
      partnersSuspended,
      partnersVerified,
      invitesDraft,
      invitesSent,
      invitesAccepted,
      recentApplications,
      recentWaitlist,
    ] = await Promise.all([
      count(db.from("waitlist_signups").select("*", { count: "exact", head: true })),
      count(
        db
          .from("waitlist_signups")
          .select("*", { count: "exact", head: true })
          .eq("status", "new")
      ),
      count(
        db
          .from("waitlist_signups")
          .select("*", { count: "exact", head: true })
          .gte("created_at", since(1))
      ),
      count(db.from("members").select("*", { count: "exact", head: true })),
      count(
        db
          .from("members")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
      ),
      count(
        db
          .from("members")
          .select("*", { count: "exact", head: true })
          .gte("created_at", since(7))
      ),
      count(db.from("expert_applications").select("*", { count: "exact", head: true })),
      count(
        db
          .from("expert_applications")
          .select("*", { count: "exact", head: true })
          .eq("status", "new")
      ),
      count(
        db
          .from("expert_applications")
          .select("*", { count: "exact", head: true })
          .eq("status", "reviewing")
      ),
      count(
        db
          .from("expert_applications")
          .select("*", { count: "exact", head: true })
          .eq("status", "approved")
      ),
      count(
        db
          .from("expert_applications")
          .select("*", { count: "exact", head: true })
          .eq("status", "declined")
      ),
      count(
        db
          .from("expert_applications")
          .select("*", { count: "exact", head: true })
          .eq("status", "onboarded")
      ),
      count(db.from("partners").select("*", { count: "exact", head: true })),
      count(
        db
          .from("partners")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending_review")
      ),
      count(
        db
          .from("partners")
          .select("*", { count: "exact", head: true })
          .eq("status", "approved")
      ),
      count(
        db
          .from("partners")
          .select("*", { count: "exact", head: true })
          .eq("status", "rejected")
      ),
      count(
        db
          .from("partners")
          .select("*", { count: "exact", head: true })
          .eq("status", "suspended")
      ),
      count(
        db
          .from("partners")
          .select("*", { count: "exact", head: true })
          .eq("verified", true)
      ),
      count(
        db
          .from("founding_invites")
          .select("*", { count: "exact", head: true })
          .eq("status", "draft")
      ),
      count(
        db
          .from("founding_invites")
          .select("*", { count: "exact", head: true })
          .eq("status", "sent")
      ),
      count(
        db
          .from("founding_invites")
          .select("*", { count: "exact", head: true })
          .eq("status", "accepted")
      ),
      db
        .from("expert_applications")
        .select("id, full_name, email, specialty, status, created_at")
        .order("created_at", { ascending: false })
        .limit(6),
      db
        .from("waitlist_signups")
        .select("id, full_name, email, firm_name, status, created_at")
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

    const expertsPending = (expertsNew.count ?? 0) + (expertsReviewing.count ?? 0);

    return NextResponse.json({
      waitlist: {
        total: waitlistTotal.count ?? 0,
        new: waitlistNew.count ?? 0,
        last24h: waitlist24h.count ?? 0,
      },
      members: {
        total: membersTotal.count ?? 0,
        active: membersActive.count ?? 0,
        thisWeek: membersWeek.count ?? 0,
      },
      experts: {
        total: expertsTotal.count ?? 0,
        pending: expertsPending,
        new: expertsNew.count ?? 0,
        reviewing: expertsReviewing.count ?? 0,
        approved: expertsApproved.count ?? 0,
        declined: expertsDeclined.count ?? 0,
        onboarded: expertsOnboarded.count ?? 0,
      },
      partners: {
        total: partnersTotal.count ?? 0,
        pending: partnersPending.count ?? 0,
        approved: partnersApproved.count ?? 0,
        rejected: partnersRejected.count ?? 0,
        suspended: partnersSuspended.count ?? 0,
        verified: partnersVerified.count ?? 0,
      },
      founding: {
        draft: invitesDraft.count ?? 0,
        sent: invitesSent.count ?? 0,
        accepted: invitesAccepted.count ?? 0,
      },
      // Honest, not aspirational: 100 founding seats, and the remaining count
      // is derived from real activated members rather than a hard-coded figure.
      foundingCap: 100,
      recentApplications: recentApplications.data ?? [],
      recentWaitlist: recentWaitlist.data ?? [],
    });
  } catch (err) {
    console.error("[admin/overview] failed", err);
    return NextResponse.json({ error: "Could not load the overview." }, { status: 500 });
  }
}
