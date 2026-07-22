import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { str, isEmail, normalizeEmail } from "@/lib/validate";
import { recordAudit, pushNotification } from "@/lib/admin/sideEffects";
import { sendMemberWelcomeEmail } from "@/lib/email/templates";
import { notifyTeamEvent } from "@/lib/email/teamNotify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/members/activate — the one way a member becomes real.
 *
 * Three input shapes:
 *   { member_id }          reactivate / confirm an existing member
 *   { waitlist_signup_id } promote a waitlist signup (flips it to converted)
 *   { email, ... }         add a member by hand
 *
 * Sends the welcome email, writes the audit row, alerts the team.
 */
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const now = new Date().toISOString();

  const memberId = str(body.member_id, 64);
  const waitlistId = str(body.waitlist_signup_id, 64);

  let member: Record<string, unknown> | null = null;
  let sourceWaitlistId: string | null = null;

  if (memberId) {
    const { data } = await db.from("members").select("*").eq("id", memberId).single();
    if (!data) return NextResponse.json({ error: "Member not found." }, { status: 404 });
    member = data;
    sourceWaitlistId = data.waitlist_signup_id ?? null;
  } else if (waitlistId) {
    const { data: signup } = await db
      .from("waitlist_signups")
      .select("*")
      .eq("id", waitlistId)
      .single();

    if (!signup) {
      return NextResponse.json({ error: "Waitlist signup not found." }, { status: 404 });
    }
    sourceWaitlistId = signup.id;

    const { data, error } = await db
      .from("members")
      .upsert(
        {
          email: normalizeEmail(String(signup.email)),
          first_name: signup.first_name,
          last_name: signup.last_name,
          firm_name: signup.firm_name,
          practice_role: signup.practice_role,
          phone: signup.phone,
          waitlist_signup_id: signup.id,
          status: "active",
          tier: "founding",
          sms_consent: signup.sms_consent,
          sms_consent_text: signup.sms_consent_text,
          sms_consent_at: signup.sms_consent_at,
          updated_at: now,
        },
        { onConflict: "email" }
      )
      .select("*")
      .single();

    if (error) {
      console.error("[members/activate] upsert from waitlist failed", error);
      return NextResponse.json({ error: "Could not activate." }, { status: 500 });
    }
    member = data;
  } else {
    const rawEmail = str(body.email, 254);
    if (!rawEmail || !isEmail(rawEmail)) {
      return NextResponse.json(
        { error: "A member id, waitlist signup id, or valid email is required." },
        { status: 400 }
      );
    }

    const { data, error } = await db
      .from("members")
      .upsert(
        {
          email: normalizeEmail(rawEmail),
          first_name: str(body.first_name, 120),
          last_name: str(body.last_name, 120),
          firm_name: str(body.firm_name ?? body.practice_name, 200),
          practice_role: str(body.practice_role, 120),
          phone: str(body.phone, 40),
          city: str(body.city, 120),
          status: "active",
          tier: "founding",
          updated_at: now,
        },
        { onConflict: "email" }
      )
      .select("*")
      .single();

    if (error) {
      console.error("[members/activate] upsert failed", error);
      return NextResponse.json({ error: "Could not activate." }, { status: 500 });
    }
    member = data;
  }

  const wasAlreadyActive =
    member!.status === "active" && Boolean(member!.activated_at);

  const { data: activated, error: activateError } = await db
    .from("members")
    .update({
      status: "active",
      activated_at: member!.activated_at ?? now,
      activated_by: guard.adminId,
      joined_at: member!.joined_at ?? now,
      updated_at: now,
    })
    .eq("id", member!.id as string)
    .select("*")
    .single();

  if (activateError) {
    console.error("[members/activate] update failed", activateError);
    return NextResponse.json({ error: "Could not activate." }, { status: 500 });
  }

  if (sourceWaitlistId) {
    await db
      .from("waitlist_signups")
      .update({ status: "converted" })
      .eq("id", sourceWaitlistId);
  }

  await recordAudit({
    targetType: "member",
    targetId: String(activated.id),
    action: "activate",
    note: str(body.note, 2000),
    adminId: guard.adminId,
  });

  // Only welcome them once. Re-activating a paused member should not read as
  // "welcome to the network" a second time.
  if (!wasAlreadyActive) {
    await sendMemberWelcomeEmail({
      email: String(activated.email),
      firstName: activated.first_name ? String(activated.first_name) : null,
    }).catch((err) => console.error("[members/activate] welcome email failed", err));

    await pushNotification({
      audience: "admin",
      kind: "member_activated",
      title: `Member activated: ${activated.first_name ?? ""} ${activated.last_name ?? ""}`.trim(),
      body: activated.firm_name ? String(activated.firm_name) : null,
      link: "/admin/members",
      adminId: guard.adminId,
    });

    void notifyTeamEvent({
      kind: "admin_added",
      role: "member",
      name: `${activated.first_name ?? ""} ${activated.last_name ?? ""}`.trim(),
      email: String(activated.email),
      fields: [["Firm", activated.firm_name ? String(activated.firm_name) : null]],
      adminLink: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/admin/members`,
    });
  }

  return NextResponse.json({ ok: true, member: activated });
}
