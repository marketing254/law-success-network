import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { str, isEmail, normalizeEmail, safeUrl, bool } from "@/lib/validate";
import { recordAudit, pushNotification } from "@/lib/admin/sideEffects";
import { sendExpertApprovalEmail } from "@/lib/email/templates";
import { notifyTeamEvent } from "@/lib/email/teamNotify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS = ["start_review", "approve", "decline", "mark_onboarded", "reset"] as const;
type Action = (typeof ACTIONS)[number];

/**
 * GET /api/admin/experts
 *   ?simple=1  -> active experts, for pickers
 *   default    -> up to 500 applications
 */
export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const db = getSupabaseAdmin();

  if (req.nextUrl.searchParams.get("simple") === "1") {
    const { data, error } = await db
      .from("experts")
      .select("id, full_name, display_name, status")
      .not("status", "in", '("archived","suspended")')
      .order("full_name");

    if (error) {
      console.error("[admin/experts] simple GET failed", error);
      return NextResponse.json({ error: "Could not load experts." }, { status: 500 });
    }
    return NextResponse.json({ experts: data ?? [] });
  }

  const { data, error } = await db
    .from("expert_applications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("[admin/experts] GET failed", error);
    return NextResponse.json({ error: "Could not load applications." }, { status: 500 });
  }

  return NextResponse.json({ applications: data ?? [] });
}

/**
 * Idempotent provisioning: upsert the experts row from an approved application.
 *
 * Deliberately does NOT create an auth user or mail a magic link. LMN is in
 * waitlist mode with no expert portal yet, so minting logins to a portal that
 * does not exist would only create dead credentials. When the portal ships,
 * add auth.admin.createUser + generateLink here; the rest of the flow is
 * already in place.
 */
async function provisionExpert(params: {
  application: Record<string, unknown>;
  adminId: string;
  isFounding?: boolean;
}) {
  const db = getSupabaseAdmin();
  const app = params.application;
  const email = normalizeEmail(String(app.email));

  const { data: existing } = await db
    .from("experts")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data, error } = await db
    .from("experts")
    .insert({
      application_id: app.id,
      email,
      full_name: app.full_name,
      phone: app.phone,
      company_name: app.company_name,
      specialty: app.specialty,
      topics: app.topics,
      website: app.website,
      booking_link: app.booking_link,
      status: "invited",
      is_founding: params.isFounding ?? false,
      invited_by: params.adminId,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[provisionExpert] insert failed", error);
    return null;
  }
  return data.id as string;
}

/**
 * PATCH /api/admin/experts — { id, action, note? }
 *
 * Lifecycle: new -> reviewing -> approved -> onboarded (or -> declined).
 * `reset` returns an application to new.
 */
export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const id = str(body.id, 64);
  const action = str(body.action, 32) as Action | null;
  const note = str(body.note, 2000);

  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  if (!action || !ACTIONS.includes(action)) {
    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const { data: application, error: loadError } = await db
    .from("expert_applications")
    .select("*")
    .eq("id", id)
    .single();

  if (loadError || !application) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { updated_at: now };
  if (note) patch.notes = note;

  switch (action) {
    case "start_review":
      patch.status = "reviewing";
      patch.contacted_at = now;
      break;
    case "approve":
      patch.status = "approved";
      patch.contacted_at = now;
      break;
    case "decline":
      patch.status = "declined";
      patch.contacted_at = now;
      break;
    case "mark_onboarded":
      patch.status = "onboarded";
      break;
    case "reset":
      patch.status = "new";
      break;
  }

  const { data: updated, error: updateError } = await db
    .from("expert_applications")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError) {
    console.error("[admin/experts] PATCH failed", updateError);
    return NextResponse.json(
      { error: "Could not update the application." },
      { status: 500 }
    );
  }

  await recordAudit({
    targetType: "expert_application",
    targetId: id,
    action,
    note,
    adminId: guard.adminId,
  });

  // Approval is the transition that provisions and mails. Only fire it on the
  // FIRST approval, so re-clicking never sends a second welcome email.
  const wasAlreadyApproved =
    application.status === "approved" || application.status === "onboarded";

  if (action === "approve" && !wasAlreadyApproved) {
    await provisionExpert({ application, adminId: guard.adminId });

    await sendExpertApprovalEmail({
      email: String(application.email),
      fullName: String(application.full_name),
    }).catch((err) => console.error("[admin/experts] approval email failed", err));

    await pushNotification({
      audience: "admin",
      kind: "expert_approved",
      title: `Expert approved: ${application.full_name}`,
      body: String(application.specialty ?? ""),
      link: "/admin/experts",
      adminId: guard.adminId,
    });

    void notifyTeamEvent({
      kind: "approved",
      role: "expert",
      name: String(application.full_name),
      email: String(application.email),
      adminLink: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/admin/experts`,
    });
  }

  if (action === "decline") {
    await pushNotification({
      audience: "admin",
      kind: "expert_declined",
      title: `Expert declined: ${application.full_name}`,
      body: note,
      link: "/admin/experts",
      adminId: guard.adminId,
    });
  }

  return NextResponse.json({ ok: true, application: updated });
}

/**
 * POST /api/admin/experts — add an expert directly, bypassing the public form.
 *
 * Same field set as the public form (never a reduced one), so a hand-added
 * expert carries the same record as an inbound applicant.
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

  const fullName = str(body.full_name, 200);
  const rawEmail = str(body.email, 254);
  const specialty = str(body.specialty, 200);

  if (!fullName || !rawEmail || !isEmail(rawEmail) || !specialty) {
    return NextResponse.json(
      { error: "Name, a valid email and specialty are required." },
      { status: 400 }
    );
  }

  const email = normalizeEmail(rawEmail);
  const now = new Date().toISOString();
  const db = getSupabaseAdmin();

  const payload = {
    full_name: fullName,
    email,
    phone: str(body.phone, 40),
    company_name: str(body.company_name, 200),
    specialty,
    topics: str(body.topics, 2000),
    website: safeUrl(body.website),
    booking_link: safeUrl(body.booking_link),
    what_you_teach: str(body.what_you_teach, 4000),
    notes: str(body.notes, 2000),
    status: "approved",
    source: "admin-add",
    contacted_at: now,
    agreement_accepted: true,
    agreement_accepted_at: now,
    also_partner: bool(body.also_partner),
    company_offer: str(body.company_offer, 1000),
    considered_founding: bool(body.considered_founding),
    updated_at: now,
  };

  const { data: application, error } = await db
    .from("expert_applications")
    .upsert(payload, { onConflict: "email" })
    .select("*")
    .single();

  if (error) {
    console.error("[admin/experts] POST failed", error);
    return NextResponse.json({ error: "Could not add the expert." }, { status: 500 });
  }

  await recordAudit({
    targetType: "expert_application",
    targetId: application.id,
    action: "admin_create",
    note: str(body.notes, 2000),
    adminId: guard.adminId,
  });

  await provisionExpert({
    application,
    adminId: guard.adminId,
    isFounding: bool(body.is_founding),
  });

  await pushNotification({
    audience: "admin",
    kind: "expert_added",
    title: `Expert added: ${fullName}`,
    body: specialty,
    link: "/admin/experts",
    adminId: guard.adminId,
  });

  void notifyTeamEvent({
    kind: "admin_added",
    role: "expert",
    name: fullName,
    email,
    adminLink: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/admin/experts`,
  });

  // No email is sent here. An admin-added expert is usually someone the team is
  // already talking to; use the founding invite flow when they should be mailed.
  return NextResponse.json({ ok: true, application });
}
