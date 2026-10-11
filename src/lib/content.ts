import raw from "../../content.json";

export type Study = { citation: string; title: string; finding: string | null; searchUrl: string };
export type EvidenceLevel = "strong" | "moderate" | "early";
export type Tool = "pacer" | "eyes";

export type Protocol = {
  number: number;
  slug: string;
  tabLabel: string;
  name: string;
  summary: string;
  todayLine: string;
  steps: string[];
  minimum: string;
  tool: Tool | null;
  why: string;
  evidenceLevel: EvidenceLevel;
  evidenceSummary: string;
  studies: Study[];
  caution: string | null;
  note: string | null;
  episodeTimestamps: string;
};

export type Supplement = {
  name: string;
  doseStated: string;
  statedUse: string;
  evidenceSummary: string;
  caution: string;
  studies: Study[];
};

export type Content = {
  meta: {
    name: string;
    source: string;
    note: string;
    todayOrder: number[];
    streakThreshold: number;
    evidenceScale: Record<EvidenceLevel, string>;
  };
  protocols: Protocol[];
  supplements: Supplement[];
  supplementsAlsoNamed: string[];
  excludedOnPurpose: string[];
};

export const content = raw as Content;
export const { meta, protocols, supplements } = content;

export const KEEP = meta.streakThreshold;

export const PIPS: Record<EvidenceLevel, 1 | 2 | 3> = { strong: 3, moderate: 2, early: 1 };

export function byNumber(n: number): Protocol {
  const p = protocols.find((x) => x.number === n);
  if (!p) throw new Error("No protocol " + n);
  return p;
}

export function bySlug(slug: string): Protocol | undefined {
  return protocols.find((x) => x.slug === slug);
}

export const todayProtocols: Protocol[] = meta.todayOrder.map(byNumber);
