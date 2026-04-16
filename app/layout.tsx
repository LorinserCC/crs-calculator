import type { Metadata } from "next";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRS Score Calculator",
  description: "Comprehensive Ranking System score calculator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2665780342818907"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-5">
            <h1 className="text-xl font-semibold tracking-tight">
              CRS Score Calculator
            </h1>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; 2026 CRS Scoring. Not legal advice.</p>
            <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <a href="/privacy" className="hover:text-slate-900">Privacy</a>
              <a href="/terms" className="hover:text-slate-900">Terms</a>
              <a href="/contact" className="hover:text-slate-900">Contact</a>
              <a href="/unsubscribe" className="hover:text-slate-900">
                Unsubscribe from emails
              </a>
              <a href="mailto:feedback@crsscoring.com" className="hover:text-slate-900">
                feedback@crsscoring.com
              </a>
            </nav>
          </div>
        </footer>
        <CookieConsentBanner />
      </body>
    </html>
  );
}
