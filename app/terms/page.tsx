{/* NOTE: This is a starter-draft Terms of Service. Have counsel review before relying on it. */}

export const metadata = {
  title: "Terms of Service — CRS Score Calculator",
  description: "Terms governing use of crsscoring.com.",
};

export default function TermsPage() {
  return (
    <article className="prose prose-slate mx-auto max-w-3xl">
      <h1>Terms of Service</h1>
      <p className="text-sm text-slate-500">Last updated: April 15, 2026</p>

      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of
        crsscoring.com and the related Comprehensive Ranking System (CRS) calculator
        (the &ldquo;Service&rdquo;) operated by crsscoring.com (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;, or &ldquo;our&rdquo;). By using the Service, you agree to be
        bound by these Terms.
      </p>

      <h2>1. Not legal or immigration advice</h2>
      <p>
        The Service provides general information and an estimated CRS score based on
        inputs you provide, along with AI-generated commentary. It is
        <strong> not legal advice, not immigration advice, and not a substitute for
        consulting a licensed Regulated Canadian Immigration Consultant (RCIC) or
        immigration lawyer.</strong> We are not affiliated with Immigration, Refugees and
        Citizenship Canada (IRCC).
      </p>

      <h2>2. No guarantee of accuracy</h2>
      <p>
        We aim to reflect the official IRCC scoring rules as published on
        canada.ca, but CRS rules change and your actual eligibility and score will be
        determined solely by IRCC. We make no representations or warranties about the
        accuracy, completeness, or current validity of any score, explanation, draw
        history, or other information displayed.
      </p>

      <h2>3. Eligibility</h2>
      <p>
        You must be at least 16 years old to use the Service. By using the Service, you
        represent that the information you provide is accurate to the best of your
        knowledge and that your use complies with all applicable laws.
      </p>

      <h2>4. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any unlawful purpose;</li>
        <li>
          Attempt to interfere with, disrupt, or gain unauthorized access to the Service
          or its infrastructure;
        </li>
        <li>Scrape, reverse engineer, or reuse the Service&apos;s content at scale without
          our written permission; or</li>
        <li>Submit false, misleading, or another person&apos;s email address.</li>
      </ul>

      <h2>5. Email notifications and consultant referrals</h2>
      <p>
        If you subscribe to draw notifications, we will email you when Express Entry
        cutoffs or other material events occur. You can unsubscribe at any time via the
        link in any email or by contacting us.
      </p>
      <p>
        If you opt in to the optional consultant-referral checkbox, you consent to us
        sharing your email address and CRS profile with one or more licensed RCICs or
        immigration law firms, who may contact you about services. Each lead is shared at
        most once. You may withdraw this consent at any time.
      </p>

      <h2>6. Advertising</h2>
      <p>
        The Service displays third-party advertising, including via Google AdSense. We do
        not control or endorse the content of ads. Interactions with advertisers are
        between you and the advertiser.
      </p>

      <h2>7. Intellectual property</h2>
      <p>
        The Service, including its design, text, graphics, and code, is owned by us or
        our licensors and is protected by intellectual property laws. You may use the
        Service for personal, non-commercial purposes only.
      </p>

      <h2>8. Disclaimers</h2>
      <p>
        THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT
        WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES
        OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT, TO
        THE MAXIMUM EXTENT PERMITTED BY LAW.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE WILL NOT BE LIABLE FOR ANY INDIRECT,
        INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS,
        REVENUES, OR DATA, ARISING FROM OR RELATED TO YOUR USE OF THE SERVICE. OUR
        TOTAL LIABILITY FOR ALL CLAIMS WILL NOT EXCEED CAD $100.
      </p>

      <h2>10. Indemnification</h2>
      <p>
        You agree to indemnify and hold us harmless from claims arising out of your
        misuse of the Service or violation of these Terms.
      </p>

      <h2>11. Changes to the Service or Terms</h2>
      <p>
        We may modify or discontinue the Service or these Terms at any time. Continued
        use after changes become effective constitutes acceptance of the new Terms.
      </p>

      <h2>12. Governing law</h2>
      <p>
        These Terms are governed by the laws of the Province of Ontario, Canada, without
        regard to conflict-of-law principles. The courts located in Ontario will have
        exclusive jurisdiction over any disputes.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions? Email{" "}
        <a href="mailto:legal@crsscoring.com">legal@crsscoring.com</a>.
      </p>
    </article>
  );
}
