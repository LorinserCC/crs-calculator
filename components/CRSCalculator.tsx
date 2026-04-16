"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DrawHistoryChart from "./DrawHistoryChart";
import EmailCaptureCard from "./EmailCaptureCard";
import {
  ABILITIES,
  EDUCATION_LABELS,
  INITIAL_INPUT,
  calculateCRS,
  type Ability,
  type CRSBreakdown,
  type CRSInput,
  type EducationLevel,
  type LangTest,
} from "@/lib/crs";

const STEPS = [
  { id: 1, label: "Core" },
  { id: 2, label: "Spouse" },
  { id: 3, label: "Work" },
  { id: 4, label: "Additional" },
] as const;

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900";
const labelClass = "block text-sm font-medium text-slate-700";
const fieldClass = "space-y-1.5";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className={fieldClass}>
      <label className={labelClass}>{label}</label>
      {children}
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function classifyLangValue(
  value: string,
  test: LangTest,
): "complete" | "incomplete" | "invalid" {
  if (value === "") return "incomplete";
  if (test === "IELTS") {
    if (value === "9") return "complete";
    if (/^[1-9]\.[05]$/.test(value)) return "complete";
    if (/^[1-9]$/.test(value)) return "incomplete";
    if (/^[1-9]\.$/.test(value)) return "incomplete";
    return "invalid";
  }
  if (/^(1[012]|[2-9])$/.test(value)) return "complete";
  if (value === "1") return "incomplete";
  return "invalid";
}

function LangInputs({
  test,
  scores,
  onTestChange,
  onScoreChange,
  onGroupComplete,
}: {
  test: LangTest;
  scores: Record<Ability, number>;
  onTestChange: (t: LangTest) => void;
  onScoreChange: (a: Ability, v: number) => void;
  onGroupComplete?: () => void;
}) {
  const step = test === "IELTS" ? 0.5 : 1;
  const max = test === "IELTS" ? 9 : 12;
  const [raw, setRaw] = useState<Record<Ability, string>>(() => ({
    listening: scores.listening ? String(scores.listening) : "",
    speaking: scores.speaking ? String(scores.speaking) : "",
    reading: scores.reading ? String(scores.reading) : "",
    writing: scores.writing ? String(scores.writing) : "",
  }));
  const [invalid, setInvalid] = useState<Record<Ability, boolean>>({
    listening: false,
    speaking: false,
    reading: false,
    writing: false,
  });
  const refs = useRef<Record<Ability, HTMLInputElement | null>>({
    listening: null,
    speaking: null,
    reading: null,
    writing: null,
  });

  function advance(idx: number) {
    const next = ABILITIES[idx + 1];
    if (next) {
      const el = refs.current[next];
      el?.focus();
      el?.select();
    } else {
      onGroupComplete?.();
    }
  }

  function handleChange(a: Ability, idx: number, value: string) {
    setRaw((prev) => ({ ...prev, [a]: value }));
    const state = classifyLangValue(value, test);
    setInvalid((prev) => ({ ...prev, [a]: state === "invalid" }));
    onScoreChange(a, parseFloat(value) || 0);
    if (state === "complete") advance(idx);
  }

  function handleKeyDown(
    a: Ability,
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Enter") {
      e.preventDefault();
      const state = classifyLangValue(raw[a], test);
      if (state !== "invalid") advance(idx);
    }
  }

  return (
    <div className="space-y-3">
      <Field label="Test">
        <select
          className={inputClass}
          value={test}
          onChange={(e) => onTestChange(e.target.value as LangTest)}
        >
          <option value="IELTS">IELTS General</option>
          <option value="CELPIP">CELPIP General</option>
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        {ABILITIES.map((a, idx) => (
          <Field key={a} label={a[0].toUpperCase() + a.slice(1)}>
            <input
              ref={(el) => {
                refs.current[a] = el;
              }}
              type="number"
              inputMode="decimal"
              step={step}
              min={0}
              max={max}
              className={`${inputClass} ${
                invalid[a]
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                  : ""
              }`}
              value={raw[a]}
              onChange={(e) => handleChange(a, idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(a, idx, e)}
            />
          </Field>
        ))}
      </div>
    </div>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 overflow-x-auto pb-2">
      {STEPS.map((s, i) => {
        const done = s.id < current;
        const active = s.id === current;
        return (
          <li key={s.id} className="flex items-center gap-2 shrink-0">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                active
                  ? "bg-slate-900 text-white"
                  : done
                  ? "bg-slate-700 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {s.id}
            </div>
            <span
              className={`text-sm ${
                active ? "font-semibold text-slate-900" : "text-slate-500"
              }`}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 ? (
              <span className="mx-1 h-px w-6 bg-slate-300 sm:w-10" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export default function CRSCalculator() {
  const [step, setStep] = useState(1);
  const [input, setInput] = useState<CRSInput>(INITIAL_INPUT);
  const [submitted, setSubmitted] = useState(false);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const focusNext = () => nextButtonRef.current?.focus();

  const breakdown = useMemo(() => calculateCRS(input), [input]);

  const update = <K extends keyof CRSInput>(k: K, v: CRSInput[K]) =>
    setInput((prev) => ({ ...prev, [k]: v }));

  const next = () => {
    if (step === 4) {
      setSubmitted(true);
      return;
    }
    if (step === 1 && !input.hasSpouse) {
      setStep(3);
      return;
    }
    setStep(step + 1);
  };

  const back = () => {
    if (step === 3 && !input.hasSpouse) {
      setStep(1);
      return;
    }
    setStep(step - 1);
  };

  const reset = () => {
    setInput(INITIAL_INPUT);
    setStep(1);
    setSubmitted(false);
  };

  if (submitted) {
    return <ResultView breakdown={breakdown} onEdit={() => setSubmitted(false)} onReset={reset} />;
  }

  return (
    <div className="space-y-6">
      <StepIndicator current={step} />
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        {step === 1 ? <CoreStep input={input} update={update} focusNext={focusNext} /> : null}
        {step === 2 ? <SpouseStep input={input} update={update} focusNext={focusNext} /> : null}
        {step === 3 ? <WorkStep input={input} update={update} /> : null}
        {step === 4 ? <AdditionalStep input={input} update={update} /> : null}
      </div>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={back}
          disabled={step === 1}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm disabled:opacity-40 hover:bg-slate-50"
        >
          Back
        </button>
        <button
          ref={nextButtonRef}
          type="button"
          onClick={next}
          className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
        >
          {step === 4 ? "Calculate score" : "Next"}
        </button>
      </div>
    </div>
  );
}

type StepProps = {
  input: CRSInput;
  update: <K extends keyof CRSInput>(k: K, v: CRSInput[K]) => void;
  focusNext?: () => void;
};

function CoreStep({ input, update, focusNext }: StepProps) {
  const setFirstScore = (a: Ability, v: number) =>
    update("firstLang", { ...input.firstLang, [a]: v });
  const setSecondScore = (a: Ability, v: number) =>
    update("secondLang", { ...input.secondLang, [a]: v });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Core human capital</h2>
        <p className="text-sm text-slate-500">Age, education, and official language proficiency.</p>
      </div>

      <Field label="Marital status">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => update("hasSpouse", false)}
            className={`flex-1 rounded-md border px-3 py-2 text-sm ${
              !input.hasSpouse
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700"
            }`}
          >
            Single
          </button>
          <button
            type="button"
            onClick={() => update("hasSpouse", true)}
            className={`flex-1 rounded-md border px-3 py-2 text-sm ${
              input.hasSpouse
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700"
            }`}
          >
            Married / Common-law
          </button>
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Age">
          <input
            type="number"
            inputMode="numeric"
            min={17}
            max={60}
            className={inputClass}
            value={input.age}
            onChange={(e) => update("age", parseInt(e.target.value) || 0)}
          />
        </Field>
        <Field label="Level of education">
          <select
            className={inputClass}
            value={input.education}
            onChange={(e) => update("education", e.target.value as EducationLevel)}
          >
            {(Object.keys(EDUCATION_LABELS) as EducationLevel[]).map((k) => (
              <option key={k} value={k}>
                {EDUCATION_LABELS[k]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="space-y-4 rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-900">First official language</h3>
        <LangInputs
          test={input.firstLangTest}
          scores={input.firstLang}
          onTestChange={(t) => update("firstLangTest", t)}
          onScoreChange={setFirstScore}
          onGroupComplete={focusNext}
        />
      </div>

      <div className="space-y-4 rounded-lg border border-slate-200 p-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <input
            type="checkbox"
            checked={input.secondLangEnabled}
            onChange={(e) => update("secondLangEnabled", e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          I have a second official language
        </label>
        {input.secondLangEnabled ? (
          <LangInputs
            test={input.secondLangTest}
            scores={input.secondLang}
            onTestChange={(t) => update("secondLangTest", t)}
            onScoreChange={setSecondScore}
            onGroupComplete={focusNext}
          />
        ) : null}
      </div>
    </div>
  );
}

function SpouseStep({ input, update, focusNext }: StepProps) {
  const setLang = (a: Ability, v: number) =>
    update("spouseLang", { ...input.spouseLang, [a]: v });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Spouse or partner</h2>
        <p className="text-sm text-slate-500">
          Enter your spouse's details. These apply only if they are accompanying you to Canada.
        </p>
      </div>
      <Field label="Spouse's level of education">
        <select
          className={inputClass}
          value={input.spouseEducation}
          onChange={(e) => update("spouseEducation", e.target.value as EducationLevel)}
        >
          {(Object.keys(EDUCATION_LABELS) as EducationLevel[]).map((k) => (
            <option key={k} value={k}>
              {EDUCATION_LABELS[k]}
            </option>
          ))}
        </select>
      </Field>

      <div className="space-y-4 rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Spouse's official language</h3>
        <LangInputs
          test={input.spouseLangTest}
          scores={input.spouseLang}
          onTestChange={(t) => update("spouseLangTest", t)}
          onScoreChange={setLang}
          onGroupComplete={focusNext}
        />
      </div>

      <Field label="Spouse's years of Canadian skilled work experience">
        <select
          className={inputClass}
          value={input.spouseCanadianWorkYears}
          onChange={(e) => update("spouseCanadianWorkYears", parseInt(e.target.value))}
        >
          <option value={0}>None or less than 1 year</option>
          <option value={1}>1 year</option>
          <option value={2}>2 years</option>
          <option value={3}>3 years</option>
          <option value={4}>4 years</option>
          <option value={5}>5 years or more</option>
        </select>
      </Field>
    </div>
  );
}

function WorkStep({ input, update }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Work experience</h2>
        <p className="text-sm text-slate-500">Skilled work experience at NOC TEER 0, 1, 2, or 3.</p>
      </div>
      <Field label="Years of Canadian skilled work experience">
        <select
          className={inputClass}
          value={input.canadianWorkYears}
          onChange={(e) => update("canadianWorkYears", parseInt(e.target.value))}
        >
          <option value={0}>None or less than 1 year</option>
          <option value={1}>1 year</option>
          <option value={2}>2 years</option>
          <option value={3}>3 years</option>
          <option value={4}>4 years</option>
          <option value={5}>5 years or more</option>
        </select>
      </Field>
      <Field label="Years of foreign skilled work experience">
        <select
          className={inputClass}
          value={input.foreignWorkYears}
          onChange={(e) => update("foreignWorkYears", parseInt(e.target.value))}
        >
          <option value={0}>None or less than 1 year</option>
          <option value={1}>1 year</option>
          <option value={2}>2 years</option>
          <option value={3}>3 years or more</option>
        </select>
      </Field>
    </div>
  );
}

function AdditionalStep({ input, update }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Additional points</h2>
        <p className="text-sm text-slate-500">Canadian study, family ties, job offer, and nomination.</p>
      </div>

      <Field label="Canadian post-secondary education">
        <select
          className={inputClass}
          value={input.canadianEducation}
          onChange={(e) =>
            update("canadianEducation", e.target.value as CRSInput["canadianEducation"])
          }
        >
          <option value="none">None</option>
          <option value="one-or-two">1 or 2 year credential</option>
          <option value="three-plus">3+ year credential or Master's/PhD</option>
        </select>
      </Field>

      <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
        <input
          type="checkbox"
          checked={input.siblingInCanada}
          onChange={(e) => update("siblingInCanada", e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300"
        />
        <span className="text-sm text-slate-700">
          <span className="font-medium text-slate-900">Sibling in Canada</span> (citizen or
          permanent resident, aged 18+)
        </span>
      </label>

      <Field label="Arranged employment (job offer)">
        <select
          className={inputClass}
          value={input.jobOffer}
          onChange={(e) => update("jobOffer", e.target.value as CRSInput["jobOffer"])}
        >
          <option value="none">No qualifying job offer</option>
          <option value="teer-0-1-2-3">NOC TEER 0, 1, 2, or 3</option>
          <option value="teer-0-major-00">NOC TEER 0 Major Group 00 (senior management)</option>
        </select>
        <p className="mt-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Job offer points were removed by IRCC on March 25, 2025 — this selection no longer
          affects your CRS score.
        </p>
      </Field>

      <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
        <input
          type="checkbox"
          checked={input.provincialNomination}
          onChange={(e) => update("provincialNomination", e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300"
        />
        <span className="text-sm text-slate-700">
          <span className="font-medium text-slate-900">Provincial or territorial nomination</span>
        </span>
      </label>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-medium tabular-nums text-slate-900">{value}</span>
    </div>
  );
}

function Section({
  title,
  total,
  children,
}: {
  title: string;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{title}</h3>
        <span className="text-base font-semibold tabular-nums text-slate-900">{total}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function SkeletonLines() {
  return (
    <div className="space-y-3">
      <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
      <div className="h-3 w-11/12 animate-pulse rounded bg-slate-200" />
      <div className="h-3 w-9/12 animate-pulse rounded bg-slate-200" />
      <p className="mt-2 text-xs text-slate-400">Analyzing your profile…</p>
    </div>
  );
}

function ExplanationCard({ breakdown }: { breakdown: CRSBreakdown }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"loading" | "streaming" | "done" | "error" | "rate-limited">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch("/api/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            breakdown,
            cutoff: process.env.NEXT_PUBLIC_CUTOFF ?? null,
          }),
          signal: controller.signal,
        });

        if (res.status === 429) {
          setError((await res.text()) || "Rate limited.");
          setStatus("rate-limited");
          return;
        }

        if (!res.ok || !res.body) {
          throw new Error((await res.text()) || `Request failed (${res.status})`);
        }

        setStatus("streaming");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          setText((t) => t + decoder.decode(value, { stream: true }));
        }
        setStatus("done");
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Something went wrong");
        setStatus("error");
      }
    })();

    return () => controller.abort();
  }, [breakdown]);

  const showSkeleton = status === "loading" || (status === "streaming" && !text);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          What this means
        </h3>
        {status === "streaming" && text ? (
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Streaming
          </span>
        ) : null}
      </div>

      {status === "rate-limited" ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {error}
        </p>
      ) : status === "error" ? (
        <p className="text-sm text-rose-600">Could not load explanation: {error}</p>
      ) : showSkeleton ? (
        <SkeletonLines />
      ) : (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{text}</p>
      )}

      <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
        AI-generated general information — not legal advice.
      </p>
    </div>
  );
}

function ResultView({
  breakdown,
  onEdit,
  onReset,
}: {
  breakdown: ReturnType<typeof calculateCRS>;
  onEdit: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
        <p className="text-sm uppercase tracking-wide text-slate-400">Your CRS score</p>
        <p className="mt-1 text-5xl font-bold tabular-nums sm:text-6xl">{breakdown.total}</p>
        <p className="mt-2 text-sm text-slate-400">out of a maximum 1200 points</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Section title="Core / human capital" total={breakdown.core.total}>
          <Row label="Age" value={breakdown.core.age} />
          <Row label="Education" value={breakdown.core.education} />
          <Row label="First language" value={breakdown.core.firstLang} />
          <Row label="Second language" value={breakdown.core.secondLang} />
          <Row label="Canadian work experience" value={breakdown.core.canadianWork} />
        </Section>

        <Section title="Spouse factors" total={breakdown.spouse.total}>
          <Row label="Education" value={breakdown.spouse.education} />
          <Row label="Language" value={breakdown.spouse.language} />
          <Row label="Canadian work experience" value={breakdown.spouse.canadianWork} />
        </Section>

        <Section title="Skill transferability" total={breakdown.skillTransfer.total}>
          <Row label="Education" value={breakdown.skillTransfer.education} />
          <Row label="Foreign work experience" value={breakdown.skillTransfer.foreignWork} />
        </Section>

        <Section title="Additional points" total={breakdown.additional.total}>
          <Row label="Sibling, study, job offer, PNP" value={breakdown.additional.total} />
        </Section>
      </div>

      <ExplanationCard breakdown={breakdown} />

      <EmailCaptureCard breakdown={breakdown} />

      <DrawHistoryChart userScore={breakdown.total} />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Edit answers
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
        >
          Start over
        </button>
      </div>
    </div>
  );
}
