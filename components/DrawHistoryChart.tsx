"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Draw = { date: string; cutoff: number; type: string };

const DRAWS: Draw[] = [
  { date: "2025-01-23", cutoff: 524, type: "CEC" },
  { date: "2025-03-04", cutoff: 541, type: "CEC" },
  { date: "2025-04-08", cutoff: 521, type: "CEC" },
  { date: "2025-05-13", cutoff: 547, type: "CEC" },
  { date: "2025-06-10", cutoff: 379, type: "French language" },
  { date: "2025-07-08", cutoff: 518, type: "CEC" },
  { date: "2025-08-19", cutoff: 472, type: "Healthcare" },
  { date: "2025-09-18", cutoff: 505, type: "Trade occupations" },
  { date: "2025-10-07", cutoff: 534, type: "CEC" },
  { date: "2025-10-23", cutoff: 531, type: "CEC" },
  { date: "2025-11-18", cutoff: 379, type: "French language" },
  { date: "2025-12-10", cutoff: 520, type: "CEC" },
  { date: "2025-12-19", cutoff: 393, type: "French language" },
  { date: "2026-01-06", cutoff: 507, type: "CEC" },
  { date: "2026-01-20", cutoff: 511, type: "CEC" },
  { date: "2026-02-03", cutoff: 509, type: "CEC" },
  { date: "2026-02-23", cutoff: 510, type: "CEC" },
  { date: "2026-03-10", cutoff: 509, type: "CEC" },
  { date: "2026-03-23", cutoff: 511, type: "CEC" },
  { date: "2026-04-02", cutoff: 505, type: "Trade occupations" },
];

function shortDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${m}-${d}`;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: Draw }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-slate-900">{d.date}</p>
      <p className="text-slate-600">
        Cutoff: <span className="font-medium text-slate-900">{d.cutoff}</span>
      </p>
      <p className="text-slate-600">{d.type}</p>
    </div>
  );
}

export default function DrawHistoryChart({ userScore }: { userScore: number }) {
  const yMin = Math.min(userScore, ...DRAWS.map((d) => d.cutoff));
  const yMax = Math.max(userScore, ...DRAWS.map((d) => d.cutoff));
  const pad = 20;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          How your score compares to recent draws
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-slate-900" />
            Draw cutoff
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-t-2 border-dashed border-emerald-600" />
            Your score ({userScore})
          </span>
        </div>
      </div>

      <div className="h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={DRAWS} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tickFormatter={shortDate}
              tick={{ fontSize: 11, fill: "#64748b" }}
              interval="preserveStartEnd"
              minTickGap={20}
            />
            <YAxis
              domain={[Math.floor((yMin - pad) / 10) * 10, Math.ceil((yMax + pad) / 10) * 10]}
              tick={{ fontSize: 11, fill: "#64748b" }}
              width={40}
            />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine
              y={userScore}
              stroke="#059669"
              strokeDasharray="6 4"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="cutoff"
              stroke="#0f172a"
              strokeWidth={2}
              dot={{ r: 3, fill: "#0f172a" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
