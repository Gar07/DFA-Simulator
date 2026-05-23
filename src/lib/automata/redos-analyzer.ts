import { Automaton, simulateAutomaton } from "./types";
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
      message: "DFAs are strictly O(N) and are immune to Catastrophic Backtracking (ReDoS)."
    };
  }

  if (testString.length === 0) {
    return {
      isVulnerable: false,
      complexityRatio: 1,
      message: "Provide a test string to analyze runtime complexity."
    };
  }

  const result = sim(automaton, testString);
  const ratio = result.executionSteps / testString.length;

  // A ratio significantly higher than 1 indicates branching.
  // If the ratio grows exponentially with length, it's a severe vulnerability.
  // We flag it if the ratio is above a certain threshold (e.g., > 2.0 on average)
  
  let isVulnerable = false;
  let message = "NFA execution is within expected linear bounds.";

  if (ratio > 5) {
    isVulnerable = true;
    message = "CRITICAL RISK: Severe catastrophic backtracking detected. Execution steps are exploding.";
  } else if (ratio > 2) {
    isVulnerable = true;
    message = "HIGH RISK: Moderate branching and backtracking detected.";
  }

  return {
    isVulnerable,
    complexityRatio: Number(ratio.toFixed(2)),
    message
  };
};
