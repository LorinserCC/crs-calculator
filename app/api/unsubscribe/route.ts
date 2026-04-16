import { createClient } from "@supabase/supabase-js";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return Response.redirect(new URL("/unsubscribed?status=error", url), 302);
  }

  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) {
    console.error("[unsubscribe] UNSUBSCRIBE_SECRET is not set");
    return Response.redirect(new URL("/unsubscribed?status=error", url), 302);
  }

  const payload = verifyUnsubscribeToken(token, secret);
  if (!payload) {
    return Response.redirect(new URL("/unsubscribed?status=invalid", url), 302);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error("[unsubscribe] Supabase env vars missing");
    return Response.redirect(new URL("/unsubscribed?status=error", url), 302);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { error } = await supabase
    .from("leads")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("email", payload.email.toLowerCase());

  if (error) {
    console.error("[unsubscribe] Supabase update failed:", error);
    return Response.redirect(new URL("/unsubscribed?status=error", url), 302);
  }

  return Response.redirect(new URL("/unsubscribed", url), 302);
}
