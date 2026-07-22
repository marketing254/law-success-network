import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { requireAdmin } from "@/lib/auth/guards";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { str, isEmail, normalizeEmail } from "@/lib/validate";
import { recordAudit, pushNotification } from "@/lib/admin/sideEffects";
import { AGREEMENT_VERSION } from "@/lib/agreements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROLES = ["expert", "partner", "both"] as const;

function generateCode(): string {
  // 24 url-safe chars, unguessable.
  return randomBytes(18).toString("base64url").slice(0, 24);
}

function siteOrigin(req: NextRequest): string {
  return process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
}

/** GET /api/admin/founding-invite — every invite, with its shareable URL. */
export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { data, error } = await getSupabaseAdmin()
    .from("founding_invites")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("[founding-invite] GET failed", error);
    return NextResponse.json({ error: "Could not load invites." }, { status: 500 });
  }

  const origin = siteOrigin(req);
  return NextResponse.json({
    invites: (data ?? []).map((i) => ({
      ...i,
      invite_url: `${origin}/founding/${i.code}`,
    })),
  });
}

/**
 * POST /api/admin/founding-invite — create a DRAFT.
 *
 * Creating an invite NEVER emails, NEVER renders a PDF and NEVER provisions
 * anything. It only writes a draft row. Sending is a separate, explicit action
 * on /api/admin/founding-invite/[id].
 *
 * This is deliberate. These invites carry terms the public site never shows
 * (the founding cohort is free for life), so an accidental send is not a
 * cosmetic mistake, it is an unintended offer. Draft-first makes an accidental
 * send impossible.
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

  const role = str(body.role, 16);
  const fullName = str(body.full_name, 200);
  const rawEmail = str(body.email, 254);

  if (!role || !ROLES.includes(role as (typeof ROLES)[number])) {
    return NextResponse.json(
      { error: "Role must be expert, partner or both." },
      { status: 400 }
    );
  }
  if (!fullName) {
    return NextResponse.json({ error: "Full name is required." }, { status: 400 });
  }
  if (!rawEmail || !isEmail(rawEmail)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const companies = Array.isArray(body.companies) ? body.companies : [];

  const { data, error } = await getSupabaseAdmin()
    .from("founding_invites")
    .insert({
      code: generateCode(),
      role,
      full_name: fullName,
      email: normalizeEmail(rawEmail),
      company_name: str(body.company_name, 200),
      member_offer: str(body.member_offer, 2000),
      phone: str(body.phone, 40),
      notes: str(body.notes, 2000),
      companies,
      status: "draft",
      agreement_version: AGREEMENT_VERSION,
      agreement_pdf_path: null,
      created_by: guard.adminId,
    })
    .select("*")
    .single();

  if (error) {
    console.error("[founding-invite] POST failed", error);
    return NextResponse.json({ error: "Could not create the invite." }, { status: 500 });
  }

  await recordAudit({
    targetType: "founding_invite",
    targetId: data.id,
    action: "create_draft",
    note: `${role} invite drafted for ${fullName}`,
    adminId: guard.adminId,
  });

  await pushNotification({
    audience: "admin",
    kind: "founding_invite_drafted",
    title: `Founding invite drafted: ${fullName}`,
    body: "Nothing has been sent. Use Send when the details are right.",
    link: "/admin/founding",
    adminId: guard.adminId,
  });

  return NextResponse.json({
    ok: true,
    invite: { ...data, invite_url: `${siteOrigin(req)}/founding/${data.code}` },
  });
}
