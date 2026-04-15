{/* NOTE: This is a starter-draft Privacy Policy. Have counsel review before relying on it. */}

export const metadata = {
  title: "Privacy Policy — CRS Score Calculator",
  description: "How crsscoring.com collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-slate mx-auto max-w-3xl">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-slate-500">Last updated: April 15, 2026</p>

      <p>
        This Privacy Policy describes how crsscoring.com (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;, or &ldquo;our&rdquo;) collects, uses, and shares information when
        you use our Comprehensive Ranking System (CRS) score calculator and related
        services (the &ldquo;Service&rdquo;).
      </p>

      <h2>1. Information we collect</h2>
      <p>
        <strong>Information you provide.</strong> When you use the calculator, you enter
        profile details (age, education, language test results, work experience, spouse
        information, and related Express Entry factors). When you opt in to draw
        notifications, we collect your email address and your consent choices.
      </p>
      <p>
        <strong>Information collected automatically.</strong> Like most websites, we and
        our third-party providers automatically collect information through cookies and
        similar technologies, including your IP address, browser type, device identifiers,
        pages viewed, and referring URLs.
      </p>

      <h2>2. How we use information</h2>
      <ul>
        <li>To calculate your CRS score and generate an AI-powered explanation.</li>
        <li>
          To send draw notifications and related product updates if you have opted in.
        </li>
        <li>
          If you opt in, to connect you with licensed immigration consultants who may
          contact you about services that could help improve your score.
        </li>
        <li>To operate, maintain, and improve the Service.</li>
        <li>To comply with legal obligations and enforce our Terms of Service.</li>
      </ul>

      <h2>3. Third parties</h2>
      <p>
        We use the following categories of third-party providers, each under their own
        privacy terms:
      </p>
      <ul>
        <li>
          <strong>Anthropic</strong> — processes your CRS breakdown to generate the AI
          explanation. We do not send your email or other identifiers with this request.
        </li>
        <li>
          <strong>Supabase</strong> — stores lead submissions (email, CRS score,
          breakdown, consent flags, timestamps).
        </li>
        <li>
          <strong>Vercel</strong> — hosts and serves the site.
        </li>
        <li>
          <strong>Google AdSense</strong> — serves advertising. AdSense uses cookies to
          deliver ads based on your visits to this and other sites. You can opt out of
          personalized advertising at
          {" "}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google Ad Settings
          </a>
          .
        </li>
      </ul>

      <h2>4. Sharing with immigration consultants</h2>
      <p>
        If you check the optional consent box when subscribing, we may share your email
        address and CRS profile with one or more licensed Regulated Canadian Immigration
        Consultants (RCICs) or immigration law firms. Each lead is shared at most once.
        Consultants are responsible for their own privacy practices once contact is made.
        You can withdraw this consent at any time by emailing us.
      </p>

      <h2>5. Cookies</h2>
      <p>
        We use essential cookies to operate the Service and, via Google AdSense, cookies
        for advertising. You can disable cookies in your browser settings, but some
        features may not work without them.
      </p>

      <h2>6. Data retention</h2>
      <p>
        We retain lead information for as long as your subscription is active and for a
        reasonable period afterward to comply with legal obligations. You may request
        deletion at any time.
      </p>

      <h2>7. Your rights</h2>
      <p>
        Depending on where you live (including the EU/UK under GDPR, California under the
        CCPA/CPRA, and Canada under PIPEDA), you may have rights to access, correct,
        delete, or port your personal information, and to object to or restrict certain
        processing. To exercise these rights, email us using the contact address below.
      </p>

      <h2>8. Security</h2>
      <p>
        We use reasonable technical and organizational measures to protect your
        information, but no system is perfectly secure.
      </p>

      <h2>9. Children</h2>
      <p>
        The Service is not directed to children under 16, and we do not knowingly collect
        personal information from them.
      </p>

      <h2>10. Changes to this Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The &ldquo;Last updated&rdquo;
        date above reflects when the policy was most recently changed.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions or requests? Email{" "}
        <a href="mailto:privacy@crsscoring.com">privacy@crsscoring.com</a>.
      </p>

      <p className="mt-8 text-sm text-slate-500">
        This Service provides general information only and is not legal or immigration
        advice. For complex situations, consult a licensed RCIC or immigration lawyer.
      </p>
    </article>
  );
}
