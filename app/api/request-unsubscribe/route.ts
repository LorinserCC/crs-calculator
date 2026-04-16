import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { signUnsubscribeToken } from "@/lib/unsubscribe-token";

export const runtime = "nodejs";

const SITE_URL = "https://crsscoring.com";
const FROM = "CRS Scoring <noreply@crsscoring.com>";
const CONTACT_EMAIL = "feedback@crsscoring.com";

function emailBody(link: string) {
  return `Hi,

You asked us to send you a link to unsubscribe from CRS Scoring draw alerts.

To unsubscribe, click here: ${link}

If you didn't request this, you can safely ignore this email — nothing will change.

CRS Scoring
${CONTACT_EMAIL}`;
}

export async function POST(req: Request) {
  let body: { email?: string };
  try {
    body = (await req.json()) as { email?: string };
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const unsubscribeSecret = process.env.UNSUBSCRIBE_SECRET;
  const resendKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !supabaseKey || !unsubscribeSecret) {
    console.error("[request-unsubscribe] env vars missing");
    return Response.json({ error: "Service is not configured." }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from("leads")
    .select("email")
    .eq("email", email)
    .limit(1);

  if (error) {
    console.error("[request-unsubscribe] Supabase lookup failed:", error);
    return Response.json({ error: "Lookup failed." }, { status: 500 });
  }

  if (data && data.length > 0 && resendKey) {
    const link = `${SITE_URL}/api/unsubscribe?token=${signUnsubscribeToken(email, unsubscribeSecret)}`;
    const resend = new Resend(resendKey);
    try {
      await resend.emails.send({
        from: FROM,
        to: email,
        subject: "Your CRS Scoring unsubscribe link",
        text: emailBody(link),
      });
    } catch (err) {
      console.error("[request-unsubscribe] Resend send failed:", err);
    }
  }

  // Always return success so we don't disclose whether the email is on the list.
  return Response.json({ ok: true });
}
