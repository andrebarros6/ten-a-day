import { describe, expect, it } from "vitest";
import raw from "../../content.json";
import { byNumber, bySlug, content, KEEP, PIPS, protocols, supplements, todayProtocols } from "./content";
import { m, t } from "./labels";

describe("content.json", () => {
  it("has ten protocols numbered 1 to 10 with unique slugs", () => {
    expect(protocols.map((p) => p.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(new Set(protocols.map((p) => p.slug)).size).toBe(10);
  });

  it("lists Today in the order from the brief", () => {
    expect(todayProtocols.map((p) => p.number)).toEqual([1, 2, 3, 4, 5, 9, 6, 7, 10, 8]);
    expect(KEEP).toBe(7);
  });

  it("gives every protocol an evidence rating, summary and studies", () => {
    for (const p of protocols) {
      expect(PIPS[p.evidenceLevel], p.slug).toBeGreaterThan(0);
      expect(p.evidenceSummary.length, p.slug).toBeGreaterThan(20);
      expect(p.studies.length, p.slug).toBeGreaterThan(0);
      for (const s of p.studies) expect(s.searchUrl, s.title).toMatch(/^https:\/\//);
    }
  });

  it("keeps the corrections and cautions the brief says must survive", () => {
    expect(byNumber(2).caution).toContain("Never stare at the sun");
    expect(byNumber(3).caution).toContain("Cold water");
    expect(byNumber(9).note).toContain("never gives its number");
    expect(JSON.stringify(byNumber(2).studies)).toContain("overstates the peak figure");
    expect(JSON.stringify(byNumber(9).studies)).toContain("each one lasted three minutes");
    expect(byNumber(10).evidenceSummary).toContain("did not measure how much sleep anyone needs");
    const byName = (n: string) => supplements.find((s) => s.name.startsWith(n))!;
    expect(byName("EPA").caution).toContain("Lovaza");
    expect(byName("Vitamin D").caution).toContain("4,000 IU");
    expect(byName("Alpha-GPC").caution).toContain("46% more strokes");
  });

  it("leaves out the excluded topics", () => {
    // Study titles are excluded from the search: one paper on sighing is titled "peptidergic".
    const body = JSON.stringify([
      protocols.map((p) => ({ ...p, studies: [] })),
      supplements.map((s) => ({ ...s, studies: [] })),
      content.supplementsAlsoNamed,
    ]).toLowerCase();
    for (const topic of ["peptide", "glp-1", "psychedelic"]) expect(body).not.toContain(topic);
    expect(content.excludedOnPurpose).toHaveLength(3);
  });

  it("is used as imported, not copied", () => {
    expect(content).toBe(raw);
    expect(bySlug("late-light")?.number).toBe(6);
    expect(bySlug("nope")).toBeUndefined();
    expect(() => byNumber(11)).toThrow();
  });
});

describe("messages", () => {
  it("has a hint for every protocol", () => {
    for (const p of protocols) expect((m.windows.hints as Record<string, string>)[String(p.number)]).toBeTruthy();
  });

  it("fills placeholders and leaves unknown ones visible", () => {
    expect(t("{n} more", { n: 3 })).toBe("3 more");
    expect(t("{missing}", {})).toBe("{missing}");
  });

  it("says the app is unofficial and not medical advice in the footer", () => {
    expect(m.footer.disclaimer).toContain("Unofficial");
    expect(m.footer.disclaimer).toContain("not medical advice");
  });
});
