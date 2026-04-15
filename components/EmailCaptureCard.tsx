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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
        Get notified when the draw cutoff drops to your score range
      </h3>
      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          disabled={status === "submitting"}
        />
        <button
          type="submit"
          disabled={status === "submitting" || !email}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
        >
          {status === "submitting" ? "Saving…" : "Notify me"}
        </button>
      </form>
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
