export const metadata = {
  title: "Contact Us — CRS Scoring",
  description: "Get in touch with CRS Scoring.",
};

export default function ContactPage() {
  return (
    <article className="prose prose-slate mx-auto max-w-3xl">
      <h1>Contact Us</h1>
      <p>
        <strong>Feedback and general inquiries:</strong>{" "}
        <a href="mailto:feedback@crsscoring.com">feedback@crsscoring.com</a>
      </p>
      <p>
        <strong>Privacy requests:</strong>{" "}
        <a href="mailto:privacy@crsscoring.com">privacy@crsscoring.com</a>
      </p>
      <p>
        <strong>Mailing address:</strong> 2909 Washington Rd, Parlin, NJ - 08859
      </p>
      <p>
        <strong>Response time:</strong> We respond to all inquiries within 2 business
        days.
      </p>
    </article>
  );
}
