import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import type { CRSBreakdown } from "@/lib/crs";
import { signUnsubscribeToken } from "@/lib/unsubscribe-token";

export const runtime = "nodejs";

type Body = {
  email: string;
  breakdown: CRSBreakdown;
  termsAccepted: boolean;
  consultantConsent: boolean;
};

const SITE_URL = "https://crsscoring.com";
const FROM = "CRS Scoring <noreply@crsscoring.com>";
const CONTACT_EMAIL = "feedback@crsscoring.com";

function unsubscribeLink(email: string) {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) {
    return `${SITE_URL}/unsubscribed?status=error`;
  }
  const token = signUnsubscribeToken(email, secret);
  return `${SITE_URL}/api/unsubscribe?token=${token}`;
}

function confirmationBody(email: string) {
  return `Hi,

You've subscribed to draw alerts from CRS Scoring (${SITE_URL}).

What you'll receive: Notifications when Express Entry draw cutoffs change, relevant to your CRS score.

To unsubscribe at any time, click here: ${unsubscribeLink(email)}

CRS Scoring
${CONTACT_EMAIL}
[MAILING ADDRESS PLACEHOLDER]`;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { email, breakdown, termsAccepted, consultantConsent } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Invalid email address." }, { status: 400 });
  }
  if (!termsAccepted) {
    return Response.json(
      { error: "Terms of Service acceptance is required." },
      { status: 400 },
    );
  }
  if (!breakdown || typeof breakdown.total !== "number") {
    return Response.json({ error: "Missing CRS breakdown." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return Response.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const cleaned = email.trim().toLowerCase();
  const { error: supabaseError } = await supabase.from("leads").insert({
    email: cleaned,
    crs_score: breakdown.total,
    score_breakdown: breakdown,
    terms_accepted: termsAccepted,
    consultant_consent: consultantConsent,
  });

  const isDuplicate = supabaseError?.code === "23505";
  if (supabaseError && !isDuplicate) {
    return Response.json({ error: supabaseError.message }, { status: 500 });
  }

  if (!isDuplicate && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    try {
      await resend.emails.send({
        from: FROM,
        to: cleaned,
        subject: "You're subscribed to CRS Score draw alerts",
        text: confirmationBody(cleaned),
      });
    } catch (err) {
      console.error("[subscribe] Resend send failed:", err);
    }
  }

  return Response.json({ ok: true, duplicate: isDuplicate });
}
