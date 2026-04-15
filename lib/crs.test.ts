import { describe, expect, it } from "vitest";
import { calculateCRS, INITIAL_INPUT, type CRSInput } from "./crs";

function profile(overrides: Partial<CRSInput>): CRSInput {
  return { ...INITIAL_INPUT, ...overrides };
}

describe("CRS calculator — IRCC grid", () => {
  it("single, 29, Bachelor's, IELTS 7.0 across all four = 365", () => {
    const b = calculateCRS(
      profile({
        age: 29,
        education: "bachelors",
        firstLang: { listening: 7.0, reading: 7.0, writing: 7.0, speaking: 7.0 },
      }),
    );
    expect(b.core.age).toBe(110);
    expect(b.core.education).toBe(120);
    expect(b.core.firstLang).toBe(110);
    expect(b.skillTransfer.total).toBe(25);
    expect(b.total).toBe(365);
  });

  it("single, 29, Bachelor's, true CLB 8 all abilities (L7.5 R6.5 W6.5 S6.5) = 347", () => {
    const b = calculateCRS(
      profile({
        age: 29,
        education: "bachelors",
        firstLang: { listening: 7.5, reading: 6.5, writing: 6.5, speaking: 6.5 },
      }),
    );
    expect(b.core.firstLang).toBe(92);
    expect(b.skillTransfer.total).toBe(25);
    expect(b.total).toBe(347);
  });

  it("single, 29, Master's, IELTS CLB 9+ all, 3yr Canadian work caps skill transfer at 100", () => {
    const b = calculateCRS(
      profile({
        age: 29,
        education: "masters",
        firstLang: { listening: 8.0, reading: 7.0, writing: 7.0, speaking: 7.0 },
        canadianWorkYears: 3,
        foreignWorkYears: 3,
      }),
    );
    expect(b.core.age).toBe(110);
    expect(b.core.education).toBe(135);
    expect(b.core.firstLang).toBe(124);
    expect(b.core.canadianWork).toBe(64);
    expect(b.skillTransfer.total).toBe(100);
  });

  it("PNP adds 600 additional points", () => {
    const b = calculateCRS(profile({ provincialNomination: true }));
    expect(b.additional.total).toBe(600);
  });

  it("age outside 18-44 range scores 0", () => {
    expect(calculateCRS(profile({ age: 17 })).core.age).toBe(0);
    expect(calculateCRS(profile({ age: 45 })).core.age).toBe(0);
  });

  it("single, 28, Master's, IELTS L8.5/S8.0/R8.0/W7.5, 3yr Canadian work = 495", () => {
    const b = calculateCRS(
      profile({
        age: 28,
        education: "masters",
        firstLang: { listening: 8.5, speaking: 8.0, reading: 8.0, writing: 7.5 },
        canadianWorkYears: 3,
      }),
    );
    expect(b.core.age).toBe(110);
    expect(b.core.education).toBe(135);
    expect(b.core.firstLang).toBe(136);
    expect(b.core.canadianWork).toBe(64);
    expect(b.skillTransfer.total).toBe(50);
    expect(b.total).toBe(495);
  });

  it("married, 32, Master's, IELTS 8.5 all, 2yr Canadian; spouse Bachelor's + IELTS 5.0 all = 447", () => {
    const b = calculateCRS(
      profile({
        hasSpouse: true,
        age: 32,
        education: "masters",
        firstLang: { listening: 8.5, speaking: 8.5, reading: 8.5, writing: 8.5 },
        canadianWorkYears: 2,
        spouseEducation: "bachelors",
        spouseLang: { listening: 5.0, speaking: 5.0, reading: 5.0, writing: 5.0 },
        spouseCanadianWorkYears: 0,
      }),
    );
    expect(b.core.age).toBe(85);
    expect(b.core.education).toBe(126);
    expect(b.core.firstLang).toBe(128);
    expect(b.core.canadianWork).toBe(46);
    expect(b.spouse.education).toBe(8);
    expect(b.spouse.language).toBe(4);
    expect(b.skillTransfer.total).toBe(50);
    expect(b.total).toBe(447);
  });

  it("single, 45, 2-year diploma, IELTS 6.0 all, no work = 179 (age 45+ scores 0)", () => {
    const b = calculateCRS(
      profile({
        age: 45,
        education: "two-year",
        firstLang: { listening: 6.0, speaking: 6.0, reading: 6.0, writing: 6.0 },
      }),
    );
    expect(b.core.age).toBe(0);
    expect(b.core.education).toBe(98);
    expect(b.core.firstLang).toBe(68);
    expect(b.skillTransfer.total).toBe(13);
    expect(b.total).toBe(179);
  });

  it("single, 35, Bachelor's, IELTS 7.0 all, 1yr Canadian, PNP = 997 (PNP adds exactly 600)", () => {
    const b = calculateCRS(
      profile({
        age: 35,
        education: "bachelors",
        firstLang: { listening: 7.0, speaking: 7.0, reading: 7.0, writing: 7.0 },
        canadianWorkYears: 1,
        provincialNomination: true,
      }),
    );
    expect(b.core.age).toBe(77);
    expect(b.core.education).toBe(120);
    expect(b.core.firstLang).toBe(110);
    expect(b.core.canadianWork).toBe(40);
    expect(b.skillTransfer.total).toBe(50);
    expect(b.additional.total).toBe(600);
    expect(b.total).toBe(997);
  });

  it("single, 30, Bachelor's, IELTS 7.0 first lang, second lang enabled but CLB <5 = 360", () => {
    const b = calculateCRS(
      profile({
        age: 30,
        education: "bachelors",
        firstLang: { listening: 7.0, speaking: 7.0, reading: 7.0, writing: 7.0 },
        secondLangEnabled: true,
        secondLang: { listening: 0, speaking: 0, reading: 0, writing: 0 },
      }),
    );
    expect(b.core.age).toBe(105);
    expect(b.core.education).toBe(120);
    expect(b.core.firstLang).toBe(110);
    expect(b.core.secondLang).toBe(0);
    expect(b.skillTransfer.total).toBe(25);
    expect(b.total).toBe(360);
  });

  it("single, 27, Bachelor's, IELTS 7.0 all, Canadian 3+ year credential = 395 (bonus +30)", () => {
    const b = calculateCRS(
      profile({
        age: 27,
        education: "bachelors",
        firstLang: { listening: 7.0, speaking: 7.0, reading: 7.0, writing: 7.0 },
        canadianEducation: "three-plus",
      }),
    );
    expect(b.core.age).toBe(110);
    expect(b.core.education).toBe(120);
    expect(b.core.firstLang).toBe(110);
    expect(b.skillTransfer.total).toBe(25);
    expect(b.additional.total).toBe(30);
    expect(b.total).toBe(395);
  });

  it("single, 33, Bachelor's, IELTS 7.0 all, sibling in Canada = 358 (bonus +15)", () => {
    const b = calculateCRS(
      profile({
        age: 33,
        education: "bachelors",
        firstLang: { listening: 7.0, speaking: 7.0, reading: 7.0, writing: 7.0 },
        siblingInCanada: true,
      }),
    );
    expect(b.core.age).toBe(88);
    expect(b.core.education).toBe(120);
    expect(b.core.firstLang).toBe(110);
    expect(b.skillTransfer.total).toBe(25);
    expect(b.additional.total).toBe(15);
    expect(b.total).toBe(358);
  });

  it("single, 31, Bachelor's, IELTS 7.5 all, 3+yr foreign work = 391 (edu×lang 25 + foreign×lang 25)", () => {
    const b = calculateCRS(
      profile({
        age: 31,
        education: "bachelors",
        firstLang: { listening: 7.5, speaking: 7.5, reading: 7.5, writing: 7.5 },
        foreignWorkYears: 3,
      }),
    );
    expect(b.core.age).toBe(99);
    expect(b.core.education).toBe(120);
    expect(b.core.firstLang).toBe(122);
    expect(b.core.canadianWork).toBe(0);
    expect(b.skillTransfer.education).toBe(25);
    expect(b.skillTransfer.foreignWork).toBe(25);
    expect(b.skillTransfer.total).toBe(50);
    expect(b.total).toBe(391);
  });

  it("single, 20, Master's, IELTS 8.5 all, 5+yr Canadian, 3+yr foreign, Canadian ed, sibling = 606 (caps applied)", () => {
    const b = calculateCRS(
      profile({
        age: 20,
        education: "masters",
        firstLang: { listening: 8.5, speaking: 8.5, reading: 8.5, writing: 8.5 },
        canadianWorkYears: 5,
        foreignWorkYears: 3,
        canadianEducation: "three-plus",
        siblingInCanada: true,
      }),
    );
    expect(b.core.age).toBe(110);
    expect(b.core.education).toBe(135);
    expect(b.core.firstLang).toBe(136);
    expect(b.core.canadianWork).toBe(80);
    expect(b.skillTransfer.education).toBe(50);
    expect(b.skillTransfer.foreignWork).toBe(50);
    expect(b.skillTransfer.total).toBe(100);
    expect(b.additional.total).toBe(45);
    expect(b.total).toBe(606);
  });

  it("married, 29, Master's, IELTS 8.5 all, 3yr Canadian; spouse Master's + IELTS 5.5 all + 1yr Canadian = 479", () => {
    const b = calculateCRS(
      profile({
        hasSpouse: true,
        age: 29,
        education: "masters",
        firstLang: { listening: 8.5, speaking: 8.5, reading: 8.5, writing: 8.5 },
        canadianWorkYears: 3,
        spouseEducation: "masters",
        spouseLang: { listening: 5.5, speaking: 5.5, reading: 5.5, writing: 5.5 },
        spouseCanadianWorkYears: 1,
      }),
    );
    expect(b.core.age).toBe(100);
    expect(b.core.education).toBe(126);
    expect(b.core.firstLang).toBe(128);
    expect(b.core.canadianWork).toBe(56);
    expect(b.spouse.education).toBe(10);
    expect(b.spouse.language).toBe(4);
    expect(b.spouse.canadianWork).toBe(5);
    expect(b.skillTransfer.total).toBe(50);
    expect(b.total).toBe(479);
  });

  it("single, 34, Bachelor's, IELTS 7.0 all, 1yr Canadian, TEER 0 Major 00 job offer = 403 (job offer = 0 post-2025-03-25)", () => {
    const b = calculateCRS(
      profile({
        age: 34,
        education: "bachelors",
        firstLang: { listening: 7.0, speaking: 7.0, reading: 7.0, writing: 7.0 },
        canadianWorkYears: 1,
        jobOffer: "teer-0-major-00",
      }),
    );
    expect(b.core.age).toBe(83);
    expect(b.core.education).toBe(120);
    expect(b.core.firstLang).toBe(110);
    expect(b.core.canadianWork).toBe(40);
    expect(b.skillTransfer.total).toBe(50);
    expect(b.additional.total).toBe(0);
    expect(b.total).toBe(403);
  });

  it("job offer of any TEER awards 0 additional points (IRCC 2025-03-25 rule)", () => {
    expect(calculateCRS(profile({ jobOffer: "teer-0-major-00" })).additional.total).toBe(0);
    expect(calculateCRS(profile({ jobOffer: "teer-0-1-2-3" })).additional.total).toBe(0);
  });

  it("single, 18, secondary diploma, IELTS 6.0 all = 197 (age 18 single = 99 per IRCC, not 110)", () => {
    const b = calculateCRS(
      profile({
        age: 18,
        education: "secondary",
        firstLang: { listening: 6.0, speaking: 6.0, reading: 6.0, writing: 6.0 },
      }),
    );
    expect(b.core.age).toBe(99);
    expect(b.core.education).toBe(30);
    expect(b.core.firstLang).toBe(68);
    expect(b.skillTransfer.total).toBe(0);
    expect(b.total).toBe(197);
  });

  it("single, 46, Bachelor's, IELTS 7.0 all = 255 (age 46 scores 0)", () => {
    const b = calculateCRS(
      profile({
        age: 46,
        education: "bachelors",
        firstLang: { listening: 7.0, speaking: 7.0, reading: 7.0, writing: 7.0 },
      }),
    );
    expect(b.core.age).toBe(0);
    expect(b.core.education).toBe(120);
    expect(b.core.firstLang).toBe(110);
    expect(b.skillTransfer.total).toBe(25);
    expect(b.total).toBe(255);
  });

  it("with-spouse age/education tables are lower than single", () => {
    const single = calculateCRS(profile({ age: 29, education: "bachelors" }));
    const withSpouse = calculateCRS(
      profile({ age: 29, education: "bachelors", hasSpouse: true }),
    );
    expect(withSpouse.core.age).toBe(100);
    expect(withSpouse.core.education).toBe(112);
    expect(single.core.age).toBe(110);
    expect(single.core.education).toBe(120);
  });

});
