import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { str, isEmail, normalizeEmail, isSendableEmail } from "@/lib/validate";
import { recordAudit, pushNotification } from "@/lib/admin/sideEffects";
import { sendFoundingExpertEmail } from "@/lib/email/templates";
import { notifyTeamEvent } from "@/lib/email/teamNotify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROLES = ["expert", "partner", "both"] as const;
const ACTIONS = ["send", "revoke", "notify_team"] as const;

type Ctx = { params: Promise<{ id: string }> };

function siteOrigin(req: NextRequest): string {
  return process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
}

/**
 * PATCH /api/admin/founding-invite/[id] — edit a draft.
 * Refuses once the invite has been accepted or revoked: those are settled
 * records, and editing the terms under an acceptance would rewrite history.
 */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const { data: invite } = await db
    .from("founding_invites")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!invite) return NextResponse.json({ error: "Invite not found." }, { status: 404 });

  if (invite.status === "accepted" || invite.status === "revoked") {
    return NextResponse.json(
      { error: `This invite is already ${invite.status} and cannot be edited.` },
      { status: 409 }
    );
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  const role = str(body.role, 16);
  if (role) {
    if (!ROLES.includes(role as (typeof ROLES)[number])) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }
    patch.role = role;
  }

  const rawEmail = str(body.email, 254);
  if (rawEmail) {
    if (!isEmail(rawEmail)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }
    patch.email = normalizeEmail(rawEmail);
  }

  const fullName = str(body.full_name, 200);
  if (fullName) patch.full_name = fullName;
  if ("company_name" in body) patch.company_name = str(body.company_name, 200);
  if ("member_offer" in body) patch.member_offer = str(body.member_offer, 2000);
  if ("phone" in body) patch.phone = str(body.phone, 40);
  if ("notes" in body) patch.notes = str(body.notes, 2000);
  if (Array.isArray(body.companies)) patch.companies = body.companies;

  const { data, error } = await db
    .from("founding_invites")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("[founding-invite/:id] PATCH failed", error);
    return NextResponse.json({ error: "Could not update the invite." }, { status: 500 });
  }

  await recordAudit({
    targetType: "founding_invite",
    targetId: id,
    action: "edit_draft",
    adminId: guard.adminId,
  });

  return NextResponse.json({ ok: true, invite: data });
}

/**
 * POST /api/admin/founding-invite/[id] — { action }
 *
 *   send        the ONLY action that emails anyone
 *   revoke      kill an unaccepted invite
 *   notify_team internal alert only, no status change
 */
export async function POST(req: NextRequest, ctx: Ctx) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const action = str(body.action, 32);
  if (!action || !ACTIONS.includes(action as (typeof ACTIONS)[number])) {
    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const { data: invite } = await db
    .from("founding_invites")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!invite) return NextResponse.json({ error: "Invite not found." }, { status: 404 });

  const now = new Date().toISOString();

  // -------------------------------------------------------------- send ----
  if (action === "send") {
    if (invite.status === "accepted" || invite.status === "revoked") {
      return NextResponse.json(
        { error: `This invite is already ${invite.status}.` },
        { status: 409 }
      );
    }
    // Placeholder addresses (.invalid / .local / .example / .test) are refused
    // outright rather than silently bouncing.
    if (!isSendableEmail(invite.email)) {
      return NextResponse.json(
        { error: "That is not a real, sendable email address." },
        { status: 400 }
      );
    }
    if (
      (invite.role === "partner" || invite.role === "both") &&
      !str(invite.company_name, 200)
    ) {
      return NextResponse.json(
        { error: "A company name is required before sending a partner invite." },
        { status: 400 }
      );
    }

    const inviteUrl = `${siteOrigin(req)}/founding/${invite.code}`;

    const result = await sendFoundingExpertEmail({
      email: String(invite.email),
      fullName: String(invite.full_name),
      inviteUrl,
    });

    // Unlike the applicant-facing emails, this one is NOT fail-soft. If the
    // invite did not go out, saying "sent" would leave the team believing an
    // offer is in someone's inbox when it is not.
    if (!result.sent) {
      return NextResponse.json(
        { error: "The invite email could not be sent. Nothing was marked as sent." },
        { status: 502 }
      );
    }

    const { data, error } = await db
      .from("founding_invites")
      .update({
        // Advance only draft -> sent. Re-sending a "sent" invite leaves the
        // original sent_at intact.
        status: invite.status === "draft" ? "sent" : invite.status,
        sent_at: invite.sent_at ?? now,
        updated_at: now,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("[founding-invite/:id] send update failed", error);
      return NextResponse.json(
        { error: "The email went out but the status could not be saved." },
        { status: 500 }
      );
    }

    await recordAudit({
      targetType: "founding_invite",
      targetId: id,
      action: "send",
      note: `Sent to ${invite.email}`,
      adminId: guard.adminId,
    });

    await pushNotification({
      audience: "admin",
      kind: "founding_invite_sent",
      title: `Founding invite sent: ${invite.full_name}`,
      link: "/admin/founding",
      adminId: guard.adminId,
    });

    void notifyTeamEvent({
      kind: "invite_sent",
      role: invite.role as "expert" | "partner" | "both",
      name: String(invite.full_name),
      email: String(invite.email),
      adminLink: `${siteOrigin(req)}/admin/founding`,
    });

    return NextResponse.json({ ok: true, invite: data });
  }

  // ------------------------------------------------------------ revoke ----
  if (action === "revoke") {
    if (invite.status === "accepted") {
      return NextResponse.json(
        { error: "This invite has already been accepted and cannot be revoked." },
        { status: 409 }
      );
    }

    const { data, error } = await db
      .from("founding_invites")
      .update({ status: "revoked", revoked_at: now, updated_at: now })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("[founding-invite/:id] revoke failed", error);
      return NextResponse.json({ error: "Could not revoke the invite." }, { status: 500 });
    }

    await recordAudit({
      targetType: "founding_invite",
      targetId: id,
      action: "revoke",
      adminId: guard.adminId,
    });

    return NextResponse.json({ ok: true, invite: data });
  }

  // ------------------------------------------------------- notify_team ----
  if (invite.status === "draft" || invite.status === "revoked") {
    return NextResponse.json(
      { error: `Nothing to notify the team about on a ${invite.status} invite.` },
      { status: 409 }
    );
  }

  void notifyTeamEvent({
    kind: invite.status === "accepted" ? "invite_accepted" : "invite_sent",
    role: invite.role as "expert" | "partner" | "both",
    name: String(invite.full_name),
    email: String(invite.email),
    fields: [
      ["Company", invite.company_name ? String(invite.company_name) : null],
      ["Member offer", invite.member_offer ? String(invite.member_offer) : null],
      ["Agreement version", String(invite.agreement_version)],
    ],
    adminLink: `${siteOrigin(req)}/admin/founding`,
  });

  await recordAudit({
    targetType: "founding_invite",
    targetId: id,
    action: "notify_team",
    adminId: guard.adminId,
  });

  return NextResponse.json({ ok: true });
}
