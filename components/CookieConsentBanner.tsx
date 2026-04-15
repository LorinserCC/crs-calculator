"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "crsscoring-cookie-consent";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage unavailable — show once per page load
      setVisible(true);
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white shadow-lg">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-4 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
        <p>
          We use essential cookies to operate this site. By continuing to use
          crsscoring.com you agree to our{" "}
          <a href="/privacy" className="font-medium underline hover:text-slate-900">
            Privacy Policy
          </a>
          .
        </p>
        <div className="flex items-center gap-3">
          <a
            href="/privacy"
            className="text-sm font-medium text-slate-600 underline hover:text-slate-900"
          >
            Learn more
          </a>
          <button
            type="button"
            onClick={accept}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
