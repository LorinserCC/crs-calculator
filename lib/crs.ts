export type EducationLevel =
  | "none"
  | "secondary"
  | "one-year"
  | "two-year"
  | "bachelors"
  | "two-or-more"
  | "masters"
  | "doctoral";

export type LangTest = "IELTS" | "CELPIP";
export type Ability = "listening" | "speaking" | "reading" | "writing";
export type LangScores = Record<Ability, number>;

export type CRSInput = {
  hasSpouse: boolean;
  age: number;
  education: EducationLevel;
  firstLangTest: LangTest;
  firstLang: LangScores;
  secondLangEnabled: boolean;
  secondLangTest: LangTest;
  secondLang: LangScores;
  canadianWorkYears: number;
  foreignWorkYears: number;
  spouseEducation: EducationLevel;
  spouseLangTest: LangTest;
  spouseLang: LangScores;
  spouseCanadianWorkYears: number;
  canadianEducation: "none" | "one-or-two" | "three-plus";
  siblingInCanada: boolean;
  jobOffer: "none" | "teer-0-major-00" | "teer-0-1-2-3";
  provincialNomination: boolean;
};

export const ABILITIES: Ability[] = ["listening", "speaking", "reading", "writing"];

export const EDUCATION_LABELS: Record<EducationLevel, string> = {
  none: "Less than secondary",
  secondary: "Secondary diploma",
  "one-year": "One-year post-secondary",
  "two-year": "Two-year post-secondary",
  bachelors: "Bachelor's degree (3+ years)",
  "two-or-more": "Two or more credentials (one 3+ years)",
  masters: "Master's or professional degree",
  doctoral: "Doctoral (PhD)",
};

const IELTS_TO_CLB: Record<Ability, [number, number][]> = {
  listening: [[8.5, 10], [8.0, 9], [7.5, 8], [6.0, 7], [5.5, 6], [5.0, 5], [4.5, 4]],
  reading: [[8.0, 10], [7.0, 9], [6.5, 8], [6.0, 7], [5.0, 6], [4.0, 5], [3.5, 4]],
  writing: [[7.5, 10], [7.0, 9], [6.5, 8], [6.0, 7], [5.5, 6], [5.0, 5], [4.0, 4]],
  speaking: [[7.5, 10], [7.0, 9], [6.5, 8], [6.0, 7], [5.5, 6], [5.0, 5], [4.0, 4]],
};

export function toCLB(test: LangTest, ability: Ability, score: number): number {
  if (!Number.isFinite(score) || score <= 0) return 0;
  if (test === "CELPIP") return Math.max(0, Math.min(10, Math.floor(score)));
  for (const [threshold, clb] of IELTS_TO_CLB[ability]) {
    if (score >= threshold) return clb;
  }
  return 0;
}

function ageScore(age: number, withSpouse: boolean): number {
  if (age < 18 || age >= 45) return 0;
  if (age >= 20 && age <= 29) return withSpouse ? 100 : 110;
  const table: Record<number, [number, number]> = {
    18: [90, 99], 19: [95, 105],
    30: [95, 105], 31: [90, 99], 32: [85, 94], 33: [80, 88], 34: [75, 83],
    35: [70, 77], 36: [65, 72], 37: [60, 66], 38: [55, 61], 39: [50, 55],
    40: [45, 50], 41: [35, 39], 42: [25, 28], 43: [15, 17], 44: [5, 6],
  };
  const row = table[age];
  if (!row) return 0;
  return withSpouse ? row[0] : row[1];
}

const EDUCATION_POINTS: Record<EducationLevel, [number, number]> = {
  none: [0, 0],
  secondary: [28, 30],
  "one-year": [84, 90],
  "two-year": [91, 98],
  bachelors: [112, 120],
  "two-or-more": [119, 128],
  masters: [126, 135],
  doctoral: [140, 150],
};

function educationScore(ed: EducationLevel, withSpouse: boolean): number {
  const [a, b] = EDUCATION_POINTS[ed];
  return withSpouse ? a : b;
}

function firstLangPerAbility(clb: number, withSpouse: boolean): number {
  if (clb < 4) return 0;
  if (clb <= 5) return 6;
  if (clb === 6) return withSpouse ? 8 : 9;
  if (clb === 7) return withSpouse ? 16 : 17;
  if (clb === 8) return withSpouse ? 22 : 23;
  if (clb === 9) return withSpouse ? 29 : 31;
  return withSpouse ? 32 : 34;
}

function secondLangPerAbility(clb: number): number {
  if (clb < 5) return 0;
  if (clb <= 6) return 1;
  if (clb <= 8) return 3;
  return 6;
}

function canadianWorkScore(years: number, withSpouse: boolean): number {
  const withTable = [0, 35, 46, 56, 63, 70];
  const withoutTable = [0, 40, 53, 64, 72, 80];
  const idx = Math.min(5, Math.max(0, Math.floor(years)));
  return withSpouse ? withTable[idx] : withoutTable[idx];
}

const SPOUSE_ED_POINTS: Record<EducationLevel, number> = {
  none: 0, secondary: 2, "one-year": 6, "two-year": 7,
  bachelors: 8, "two-or-more": 9, masters: 10, doctoral: 10,
};

function spouseLangPerAbility(clb: number): number {
  if (clb < 5) return 0;
  if (clb <= 6) return 1;
  if (clb <= 8) return 3;
  return 5;
}

function spouseCanadianWorkScore(years: number): number {
  const t = [0, 5, 7, 8, 9, 10];
  return t[Math.min(5, Math.max(0, Math.floor(years)))];
}

function isOneOrTwoYear(ed: EducationLevel): boolean {
  return ed === "one-year" || ed === "two-year";
}

function isBachelorsOrHigher(ed: EducationLevel): boolean {
  return ed === "bachelors" || ed === "two-or-more" || ed === "masters" || ed === "doctoral";
}

function educationTransferability(ed: EducationLevel, langMinCLB: number, canadianYears: number): number {
  const one = isOneOrTwoYear(ed);
  const bach = isBachelorsOrHigher(ed);
  if (!one && !bach) return 0;
  let lang = 0;
  if (langMinCLB >= 9) lang = one ? 25 : 50;
  else if (langMinCLB >= 7) lang = one ? 13 : 25;
  let work = 0;
  if (canadianYears >= 2) work = one ? 25 : 50;
  else if (canadianYears >= 1) work = one ? 13 : 25;
  return Math.min(50, lang + work);
}

function foreignWorkTransferability(foreignYears: number, langMinCLB: number, canadianYears: number): number {
  if (foreignYears < 1) return 0;
  const short = foreignYears < 3;
  let lang = 0;
  if (langMinCLB >= 9) lang = short ? 25 : 50;
  else if (langMinCLB >= 7) lang = short ? 13 : 25;
  let work = 0;
  if (canadianYears >= 2) work = short ? 25 : 50;
  else if (canadianYears >= 1) work = short ? 13 : 25;
  return Math.min(50, lang + work);
}

function additionalPoints(input: CRSInput): number {
  let p = 0;
  if (input.siblingInCanada) p += 15;
  if (input.canadianEducation === "one-or-two") p += 15;
  else if (input.canadianEducation === "three-plus") p += 30;
  // Job offer / arranged employment no longer awards CRS points as of 2025-03-25.
  if (input.provincialNomination) p += 600;
  return Math.min(600, p);
}

export type CRSBreakdown = {
  core: {
    age: number;
    education: number;
    firstLang: number;
    secondLang: number;
    canadianWork: number;
    total: number;
  };
  spouse: {
    education: number;
    language: number;
    canadianWork: number;
    total: number;
  };
  skillTransfer: { education: number; foreignWork: number; total: number };
  additional: { total: number };
  total: number;
};

export function calculateCRS(input: CRSInput): CRSBreakdown {
  const withSpouse = input.hasSpouse;

  const age = ageScore(input.age, withSpouse);
  const education = educationScore(input.education, withSpouse);

  const firstLangCLBs = ABILITIES.map((a) => toCLB(input.firstLangTest, a, input.firstLang[a]));
  const firstLang = firstLangCLBs.reduce((s, clb) => s + firstLangPerAbility(clb, withSpouse), 0);
  const firstLangMin = Math.min(...firstLangCLBs);

  let secondLang = 0;
  if (input.secondLangEnabled) {
    const raw = ABILITIES.reduce(
      (s, a) => s + secondLangPerAbility(toCLB(input.secondLangTest, a, input.secondLang[a])),
      0,
    );
    secondLang = Math.min(withSpouse ? 22 : 24, raw);
  }

  const canadianWork = canadianWorkScore(input.canadianWorkYears, withSpouse);
  const coreTotal = age + education + firstLang + secondLang + canadianWork;

  let spEd = 0, spLang = 0, spWork = 0;
  if (withSpouse) {
    spEd = SPOUSE_ED_POINTS[input.spouseEducation];
    const raw = ABILITIES.reduce(
      (s, a) => s + spouseLangPerAbility(toCLB(input.spouseLangTest, a, input.spouseLang[a])),
      0,
    );
    spLang = Math.min(20, raw);
    spWork = spouseCanadianWorkScore(input.spouseCanadianWorkYears);
  }
  const spouseTotal = spEd + spLang + spWork;

  const edTransfer = educationTransferability(input.education, firstLangMin, input.canadianWorkYears);
  const fwTransfer = foreignWorkTransferability(input.foreignWorkYears, firstLangMin, input.canadianWorkYears);
  const skillTotal = Math.min(100, edTransfer + fwTransfer);

  const additionalTotal = additionalPoints(input);

  return {
    core: { age, education, firstLang, secondLang, canadianWork, total: coreTotal },
    spouse: { education: spEd, language: spLang, canadianWork: spWork, total: spouseTotal },
    skillTransfer: { education: edTransfer, foreignWork: fwTransfer, total: skillTotal },
    additional: { total: additionalTotal },
    total: coreTotal + spouseTotal + skillTotal + additionalTotal,
  };
}

export const INITIAL_INPUT: CRSInput = {
  hasSpouse: false,
  age: 30,
  education: "bachelors",
  firstLangTest: "IELTS",
  firstLang: { listening: 0, speaking: 0, reading: 0, writing: 0 },
  secondLangEnabled: false,
  secondLangTest: "IELTS",
  secondLang: { listening: 0, speaking: 0, reading: 0, writing: 0 },
  canadianWorkYears: 0,
  foreignWorkYears: 0,
  spouseEducation: "none",
  spouseLangTest: "IELTS",
  spouseLang: { listening: 0, speaking: 0, reading: 0, writing: 0 },
  spouseCanadianWorkYears: 0,
  canadianEducation: "none",
  siblingInCanada: false,
  jobOffer: "none",
  provincialNomination: false,
};
