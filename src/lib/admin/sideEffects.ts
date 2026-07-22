import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * The four side-effect primitives every admin queue reuses. Together they ARE
 * the review-workflow pattern: audit what happened, tell the bell, log the
 * email, alert the team.
 *
 * All are best-effort. A failed audit write must never roll back a completed
 * status change or the record and the trail drift apart in the wrong direction.
 */

export type AuditTarget =
  | "expert_application"
  | "expert"
  | "partner"
  | "partner_application"
  | "member"
  | "waitlist_signup"
  | "founding_invite";

export async function recordAudit(params: {
  targetType: AuditTarget;
  targetId: string;
  action: string;
  note?: string | null;
  adminId: string;
}) {
  try {
    await getSupabaseAdmin().from("review_actions").insert({
      target_type: params.targetType,
      target_id: params.targetId,
      action: params.action,
      note: params.note ?? null,
      admin_id: params.adminId,
    });
  } catch (err) {
    console.error("[audit] insert failed", err);
  }
}

export async function pushNotification(params: {
  audience: "admin" | "member" | "expert" | "partner";
  kind: string;
  title: string;
  body?: string | null;
  link?: string | null;
  adminId?: string | null;
  memberId?: string | null;
  expertId?: string | null;
  partnerId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await getSupabaseAdmin().from("notifications").insert({
      audience: params.audience,
      kind: params.kind,
      title: params.title,
      body: params.body ?? null,
      link: params.link ?? null,
      admin_id: params.adminId ?? null,
      member_id: params.memberId ?? null,
      expert_id: params.expertId ?? null,
      partner_id: params.partnerId ?? null,
      metadata: params.metadata ?? {},
    });
  } catch (err) {
    console.error("[notifications] insert failed", err);
  }
}

export async function recordAuthAudit(params: {
  email?: string | null;
  event: string;
  audience: string;
  ipHash?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await getSupabaseAdmin().from("auth_audit").insert({
      email: params.email ?? null,
      event: params.event,
      audience: params.audience,
      ip_hash: params.ipHash ?? null,
      user_agent: params.userAgent ?? null,
      metadata: params.metadata ?? {},
    });
  } catch (err) {
    console.error("[auth_audit] insert failed", err);
  }
}
