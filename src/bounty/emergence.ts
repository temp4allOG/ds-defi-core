export interface EmergenceSignal {
  type: string;
  weight: number;
  evidence: string;
}

export interface EmergenceAssessment {
  score: number;
  signals: EmergenceSignal[];
  shouldEscalate: boolean;
}

const SIGNALS = [
  { type: 'STRATEGIC_DEVIATION', weight: 18, terms: ['changed strategy', 'alternative plan', 'deviated'] },
  { type: 'CREATIVE_SYNTHESIS', weight: 16, terms: ['combined', 'synthesized', 'novel combination'] },
  { type: 'META_AWARENESS', weight: 14, terms: ['self-reflection', 'meta', 'own reasoning'] },
  { type: 'NOVEL_SOLUTION', weight: 20, terms: ['new approach', 'novel', 'invented'] },
  { type: 'CROSS_DOMAIN', weight: 12, terms: ['cross-domain', 'borrowed from', 'analogy'] },
];

export function assessEmergence(text: string): EmergenceAssessment {
  const lower = text.toLowerCase();
  const signals = SIGNALS.flatMap(rule => {
    const hit = rule.terms.find(term => lower.includes(term));
    return hit ? [{ type: rule.type, weight: rule.weight, evidence: hit }] : [];
  });
  const score = Math.min(100, signals.reduce((sum, s) => sum + s.weight, 0));
  return { score, signals, shouldEscalate: score >= 30 || signals.length >= 3 };
}
