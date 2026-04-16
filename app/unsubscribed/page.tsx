export const metadata = {
  title: "Unsubscribed — CRS Scoring",
  description: "You have been unsubscribed from CRS Scoring draw alerts.",
};

export default function UnsubscribedPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams?.status;

  if (status === "invalid" || status === "error") {
    return (
      <article className="prose prose-slate mx-auto max-w-3xl">
        <h1>We couldn&apos;t process that unsubscribe link</h1>
        <p>
          The link may have expired or been copied incorrectly. Please use the
          unsubscribe link from the most recent email we sent you, or email{" "}
          <a href="mailto:privacy@crsscoring.com">privacy@crsscoring.com</a> and we will
          remove you manually.
        </p>
      </article>
    );
  }

  return (
    <article className="prose prose-slate mx-auto max-w-3xl">
      <h1>You&apos;ve been unsubscribed</h1>
      <p>
        You have been unsubscribed from CRS Scoring draw alerts. You will no longer
        receive emails from us.
      </p>
    </article>
  );
}
