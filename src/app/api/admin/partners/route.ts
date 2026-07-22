import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { str, isEmail, normalizeEmail, safeUrl } from "@/lib/validate";
import { recordAudit, pushNotification } from "@/lib/admin/sideEffects";
import { sendPartnerApprovalEmail } from "@/lib/email/templates";
import { notifyTeamEvent } from "@/lib/email/teamNotify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS = ["approve", "reject", "suspend", "unsuspend"] as const;
type Action = (typeof ACTIONS)[number];

/**
 * GET /api/admin/partners
 *   ?simple=1 -> approved partners, for pickers
 *   default   -> up to 500 partners
 */
export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const db = getSupabaseAdmin();

  if (req.nextUrl.searchParams.get("simple") === "1") {
    const { data, error } = await db
      .from("partners")
      .select("id, company_name, display_name, status")
      .eq("status", "approved")
      .order("company_name");

    if (error) {
      console.error("[admin/partners] simple GET failed", error);
      return NextResponse.json({ error: "Could not load partners." }, { status: 500 });
    }
    return NextResponse.json({ partners: data ?? [] });
  }

  const { data, error } = await db
    .from("partners")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("[admin/partners] GET failed", error);
    return NextResponse.json({ error: "Could not load partners." }, { status: 500 });
  }

  return NextResponse.json({ partners: data ?? [] });
}

/** PATCH /api/admin/partners — { id, action, note? } */
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
  const { data: partner, error: loadError } = await db
    .from("partners")
    .select("*")
    .eq("id", id)
    .single();

  if (loadError || !partner) {
    return NextResponse.json({ error: "Partner not found." }, { status: 404 });
  }

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { updated_at: now };
  if (note) patch.notes = note;

  switch (action) {
    case "approve":
      patch.status = "approved";
      patch.verified = true;
      patch.approved_at = partner.approved_at ?? now;
      break;
    case "reject":
      patch.status = "rejected";
      patch.verified = false;
      break;
    case "suspend":
      patch.status = "suspended";
      break;
    case "unsuspend":
      // `verified` is deliberately untouched: a partner who was verified
      // before a suspension keeps that badge when the suspension is lifted.
      patch.status = "approved";
      break;
  }

  const { data: updated, error: updateError } = await db
    .from("partners")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError) {
    console.error("[admin/partners] PATCH failed", updateError);
    return NextResponse.json({ error: "Could not update the partner." }, { status: 500 });
  }

  // Keep the application row's status in step, so the two never disagree.
  if (partner.application_id) {
    await db
      .from("partner_applications")
      .update({ status: patch.status, updated_at: now })
      .eq("id", partner.application_id);
  }

  await recordAudit({
    targetType: "partner",
    targetId: id,
    action,
    note,
    adminId: guard.adminId,
  });

  // Only the FIRST approval mails. Re-approving an already-approved partner
  // must not send a second "you're approved" email.
  const wasApproved = partner.status === "approved";

  if (action === "approve" && !wasApproved) {
    await sendPartnerApprovalEmail({
      email: String(partner.contact_email),
      contactName: partner.contact_name ? String(partner.contact_name) : null,
      companyName: String(partner.company_name),
    }).catch((err) => console.error("[admin/partners] approval email failed", err));

    await pushNotification({
      audience: "partner",
      kind: "partner_approved",
      title: "Your partner account is approved",
      body: "Your listing goes live with the network at launch.",
      link: "/partners",
      partnerId: id,
    });

    await pushNotification({
      audience: "admin",
      kind: "partner_approved",
      title: `Partner approved: ${partner.company_name}`,
      link: "/admin/partners",
      adminId: guard.adminId,
    });

    void notifyTeamEvent({
      kind: "approved",
      role: "partner",
      name: `${partner.contact_name} (${partner.company_name})`,
      email: String(partner.contact_email),
      adminLink: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/admin/partners`,
    });
  }

  if (action === "reject") {
    await pushNotification({
      audience: "admin",
      kind: "partner_rejected",
      title: `Partner rejected: ${partner.company_name}`,
      body: note,
      link: "/admin/partners",
      adminId: guard.adminId,
    });
  }

  return NextResponse.json({ ok: true, partner: updated });
}

/**
 * POST /api/admin/partners — invite / add a partner directly.
 *
 * Two paths:
 *   - covered company (billing_parent_id set): billing inherits from the
 *     principal, so the row is created pending review with plan_id "covered".
 *   - standalone: created approved + verified, because an admin adding a
 *     partner by hand has already vetted them.
 *
 * Neither path emails. Use the founding invite flow when a partner should
 * receive something.
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

  const companyName = str(body.company_name, 200);
  const contactName = str(body.contact_name, 200);
  const rawEmail = str(body.contact_email, 254);

  if (!companyName || !contactName || !rawEmail || !isEmail(rawEmail)) {
    return NextResponse.json(
      { error: "Company name, contact name and a valid email are required." },
      { status: 400 }
    );
  }

  const contactEmail = normalizeEmail(rawEmail);
  const billingParentId = str(body.billing_parent_id, 64);
  const isCovered = Boolean(billingParentId);
  const db = getSupabaseAdmin();

  const { data: partner, error } = await db
    .from("partners")
    .insert({
      company_name: companyName,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: str(body.contact_phone, 40),
      secondary_email: str(body.secondary_email, 254),
      secondary_phone: str(body.secondary_phone, 40),
      signature_name: str(body.signature_name, 200),
      signature_title: str(body.signature_title, 200),
      category: str(body.category, 120),
      website: safeUrl(body.website),
      description: str(body.description, 2000),
      member_offer: str(body.member_offer, 2000),
      calendar_link: safeUrl(body.calendar_link),
      notes: str(body.notes, 2000),
      status: isCovered ? "pending_review" : "approved",
      verified: !isCovered,
      approved_at: isCovered ? null : new Date().toISOString(),
      plan_id: isCovered ? "covered" : "founding",
      billing_parent_id: billingParentId,
      invited_by: guard.adminId,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A partner with that contact email already exists." },
        { status: 409 }
      );
    }
    console.error("[admin/partners] POST failed", error);
    return NextResponse.json({ error: "Could not add the partner." }, { status: 500 });
  }

  await recordAudit({
    targetType: "partner",
    targetId: partner.id,
    action: isCovered ? "admin_add_company" : "admin_add",
    note: str(body.notes, 2000),
    adminId: guard.adminId,
  });

  await pushNotification({
    audience: "admin",
    kind: isCovered ? "partner_company_added" : "partner_added",
    title: `Partner added: ${companyName}`,
    link: "/admin/partners",
    adminId: guard.adminId,
  });

  void notifyTeamEvent({
    kind: "admin_added",
    role: "partner",
    name: `${contactName} (${companyName})`,
    email: contactEmail,
    highlight: isCovered ? "Covered company: billing inherits from the principal." : undefined,
    adminLink: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/admin/partners`,
  });

  return NextResponse.json({ ok: true, partner, covered: isCovered });
}
