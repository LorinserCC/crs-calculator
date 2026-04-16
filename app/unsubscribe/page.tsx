"use client";

import { useState } from "react";

export default function UnsubscribeRequestPage() {
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
      const res = await fetch("/api/request-unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleaned }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        setError(payload.error ?? `Request failed (${res.status}).`);
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <article className="prose prose-slate mx-auto max-w-3xl">
        <h1>Check your inbox</h1>
        <p>
          If that email address is subscribed to CRS Scoring, we&apos;ve sent a message
          with a one-click link to unsubscribe. It may take a minute or two to arrive.
        </p>
        <p>
          Didn&apos;t get it? Check your spam folder, or email{" "}
          <a href="mailto:privacy@crsscoring.com">privacy@crsscoring.com</a>.
        </p>
      </article>
    );
  }

  return (
    <article className="prose prose-slate mx-auto max-w-3xl">
      <h1>Unsubscribe from emails</h1>
      <p>
        Enter the email address you used to subscribe. We&apos;ll send you a one-click
        link to unsubscribe.
      </p>
      <form onSubmit={onSubmit} className="not-prose mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full flex-1 rounded-md border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          disabled={status === "submitting"}
        />
        <button
          type="submit"
          disabled={status === "submitting" || !email}
          className="rounded-md bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
        >
          {status === "submitting" ? "Sending…" : "Send unsubscribe link"}
        </button>
      </form>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </article>
  );
}
