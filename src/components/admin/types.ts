/**
 * Shapes returned by /api/admin/*. Hand-written from the route handlers and the
 * SQL migrations rather than generated, so anything the console reads is typed.
 */

export type AdminRole = "owner" | "admin" | "reviewer" | "support";

/* ------------------------------------------------------------------ overview */

export type Overview = {
  waitlist: { total: number; new: number; last24h: number };
  members: { total: number; active: number; thisWeek: number };
  experts: {
    total: number;
    pending: number;
    new: number;
    reviewing: number;
    approved: number;
    declined: number;
    onboarded: number;
  };
  partners: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
    verified: number;
  };
  founding: { draft: number; sent: number; accepted: number };
  foundingCap: number;
  recentApplications: RecentApplication[];
  recentWaitlist: RecentWaitlist[];
};

export type RecentApplication = {
  id: string;
  full_name: string | null;
  email: string;
  specialty: string | null;
  status: string;
  created_at: string;
};

export type RecentWaitlist = {
  id: string;
  full_name: string | null;
  email: string;
  firm_name: string | null;
  status: string;
  created_at: string;
};

/* ------------------------------------------------------------------ waitlist */

export type WaitlistStatus = "new" | "contacted" | "converted" | "declined";

export type WaitlistSignup = {
  id: string;
  role: string | null;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  firm_name: string | null;
  practice_role: string | null;
  phone: string | null;
  city_state: string | null;
  message: string | null;
  source: string | null;
  status: string;
  contacted_at: string | null;
  created_at: string;
};

/* ------------------------------------------------------------------- members */

export type Member = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  firm_name: string | null;
  practice_role: string | null;
  phone: string | null;
  city: string | null;
  status: string;
  tier: string;
  waitlist_signup_id: string | null;
  joined_at: string | null;
  activated_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
};

/* ------------------------------------------------------------------- experts */

export type ExpertApplication = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  specialty: string | null;
  topics: string | null;
  website: string | null;
  booking_link: string | null;
  what_you_teach: string | null;
  status: string;
  source: string | null;
  notes: string | null;
  contacted_at: string | null;
  also_partner: boolean | null;
  company_offer: string | null;
  considered_founding: boolean | null;
  created_at: string;
  updated_at: string | null;
};

export type ExpertAction =
  | "start_review"
  | "approve"
  | "decline"
  | "mark_onboarded"
  | "reset";

/* ------------------------------------------------------------------ partners */

export type Partner = {
  id: string;
  application_id: string | null;
  company_name: string;
  display_name: string | null;
  contact_name: string | null;
  contact_email: string;
  contact_phone: string | null;
  secondary_email: string | null;
  secondary_phone: string | null;
  signature_name: string | null;
  signature_title: string | null;
  category: string | null;
  website: string | null;
  description: string | null;
  member_offer: string | null;
  logo_url: string | null;
  calendar_link: string | null;
  status: string;
  verified: boolean;
  plan_id: string | null;
  billing_parent_id: string | null;
  approved_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
};

export type PartnerOption = {
  id: string;
  company_name: string;
  display_name: string | null;
  status: string;
};

export type PartnerAction = "approve" | "reject" | "suspend" | "unsuspend";

/* ---------------------------------------------------------- founding invites */

export type FoundingRole = "expert" | "partner" | "both";

export type FoundingInvite = {
  id: string;
  code: string;
  role: string;
  full_name: string;
  email: string;
  company_name: string | null;
  member_offer: string | null;
  phone: string | null;
  notes: string | null;
  status: string;
  agreement_version: string;
  sent_at: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string | null;
  invite_url: string;
};

/* --------------------------------------------------------------- admin team */

export type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  active: boolean;
  last_active_at: string | null;
  created_at: string;
};

/* ----------------------------------------------------------------- audit log */

export type ReviewAction = {
  id: string;
  target_type: string;
  target_id: string | null;
  action: string;
  note: string | null;
  admin_id: string | null;
  admin_name: string;
  created_at: string;
};

export type AuthEvent = {
  id: string;
  email: string | null;
  event: string;
  audience: string | null;
  created_at: string;
};
