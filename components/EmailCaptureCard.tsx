"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import type { CRSBreakdown } from "@/lib/crs";

export default function EmailCaptureCard({ breakdown }: { breakdown: CRSBreakdown }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;

    const cleaned = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      setError("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setError(null);

    try {
      const { error: supabaseError } = await getSupabase().from("leads").insert({
        email: cleaned,
        crs_score: breakdown.total,
        score_breakdown: breakdown,
      });

      if (supabaseError && supabaseError.code !== "23505") {
        setError(supabaseError.message);
        setStatus("error");
        return;
      }

      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900 shadow-sm sm:p-6">
        You're on the list. We'll notify you when the cutoff reaches your score.
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-sky-400 bg-sky-100 p-6 shadow-sm sm:p-8">
      <h3 className="text-lg font-bold leading-snug text-sky-950 sm:text-xl">
        <span aria-hidden="true" className="mr-2">🔔</span>
        Don&apos;t miss your draw — get notified the moment the cutoff reaches your score
      </h3>
      <p className="mt-2 text-sm text-sky-800">
        Join thousands of Express Entry candidates tracking their score.
      </p>
      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full flex-1 rounded-md border border-sky-400 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600"
          disabled={status === "submitting"}
        />
        <button
          type="submit"
          disabled={status === "submitting" || !email}
          className="rounded-md bg-sky-700 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-sky-800 disabled:opacity-50 sm:px-8"
        >
          {status === "submitting" ? "Saving…" : "Notify me"}
        </button>
      </form>
      <p className="mt-3 text-xs text-sky-700">No spam. Unsubscribe anytime.</p>
      {error ? <p className="mt-2 text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
