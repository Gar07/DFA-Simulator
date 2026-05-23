import { Automaton } from "./types";
// Need to import simulateAutomaton from engine
import { simulateAutomaton as sim } from "./engine";

export interface ReDoSAnalysisResult {
  isVulnerable: boolean;
  complexityRatio: number;
  message: string;
}

export const analyzeReDoS = (automaton: Automaton, testString: string): ReDoSAnalysisResult => {
  if (!automaton.isNFA) {
    return {
      isVulnerable: false,
      complexityRatio: 1,
      message: "DFA memiliki waktu eksekusi O(N) dan kebal terhadap Catastrophic Backtracking (ReDoS)."
    };
  }

  if (testString.length === 0) {
    return {
      isVulnerable: false,
      complexityRatio: 1,
      message: "Masukkan string uji untuk menganalisis kompleksitas."
    };
  }

  const result = sim(automaton, testString);
  const ratio = result.executionSteps / testString.length;

  // A ratio significantly higher than 1 indicates branching.
  // If the ratio grows exponentially with length, it's a severe vulnerability.
  // We flag it if the ratio is above a certain threshold (e.g., > 2.0 on average)
  
  let isVulnerable = false;
  let message = "Eksekusi NFA berada dalam batas linear yang wajar.";

  if (ratio > 5) {
    isVulnerable = true;
    message = "RISIKO KRITIS: Terdeteksi catastrophic backtracking yang parah. Langkah eksekusi melonjak tajam.";
  } else if (ratio > 2) {
    isVulnerable = true;
    message = "RISIKO TINGGI: Terdeteksi percabangan (branching) dan backtracking yang moderat.";
  }

  return {
    isVulnerable,
    complexityRatio: Number(ratio.toFixed(2)),
    message
  };
};
