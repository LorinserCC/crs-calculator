import Anthropic from "@anthropic-ai/sdk";
import type { CRSBreakdown } from "@/lib/crs";

export const runtime = "nodejs";

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT) return false;
  bucket.count += 1;
  return true;
}

const SYSTEM_PROMPT = `You are an assistant that helps prospective immigrants understand their Canada Express Entry CRS (Comprehensive Ranking System) score.

You will be given the user's CRS score breakdown by category and the current Express Entry draw cutoff.

Your response must:
1. Explain in plain English what their total score means relative to the current cutoff — are they comfortably above, borderline, or well below?
2. Identify the 2–3 biggest point gaps in their profile and give specific, concrete actions to close each gap (e.g., "retake IELTS for CLB 9+ in all four skills to unlock up to 50 skill-transferability points", "gain a second year of Canadian skilled work to move to the 53-point tier").
3. If their total score is below 450, briefly mention Provincial Nominee Programs (PNPs) can add 600 points and are often the most realistic route for candidates in this range.
4. Always recommend consulting a licensed Regulated Canadian Immigration Consultant (RCIC) or an immigration lawyer for complex situations.
5. Never provide legal advice. You provide general information only.

IMPORTANT: As of March 25, 2025, IRCC removed all CRS points for arranged employment (job offers). A qualifying job offer no longer adds points to CRS (previously 50 or 200). Do NOT suggest getting a job offer as a way to improve their CRS score, and do NOT mention job offer points as a potential gap. A job offer may still matter for other program eligibility, but it does not affect the CRS score itself.

Keep the tone friendly, encouraging, and practical. Use short paragraphs. Keep total length around 220–320 words. Do not use markdown headings.`;

export async function POST(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0].trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return new Response(
      "You\u2019ve requested several analyses in a short time. Please wait a few minutes before trying again.",
      { status: 429, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response("ANTHROPIC_API_KEY is not set on the server.", { status: 500 });
  }

  const { breakdown, cutoff } = (await req.json()) as {
    breakdown: CRSBreakdown;
    cutoff?: string | number | null;
  };

  const userContent = `Candidate's CRS score breakdown:

Total: ${breakdown.total} / 1200

Core / human capital (${breakdown.core.total}):
- Age: ${breakdown.core.age}
- Education: ${breakdown.core.education}
- First official language: ${breakdown.core.firstLang}
- Second official language: ${breakdown.core.secondLang}
- Canadian work experience: ${breakdown.core.canadianWork}

Spouse factors (${breakdown.spouse.total}):
- Education: ${breakdown.spouse.education}
- Language: ${breakdown.spouse.language}
- Canadian work experience: ${breakdown.spouse.canadianWork}

Skill transferability (${breakdown.skillTransfer.total}):
- Education combinations: ${breakdown.skillTransfer.education}
- Foreign work combinations: ${breakdown.skillTransfer.foreignWork}

Additional points (PNP, sibling, Canadian study, job offer): ${breakdown.additional.total}

Current Express Entry draw cutoff: ${cutoff ?? "unknown"}

Write the explanation now, following your instructions.`;

  const client = new Anthropic();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 900,
          system: [
            { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
          ],
          messages: [{ role: "user", content: userContent }],
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(encoder.encode(`\n\n[Error: ${message}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
