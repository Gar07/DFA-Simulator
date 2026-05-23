export type State = string;
export type Symbol = string;

export interface Transition {
  from: State;
  input: Symbol;
  to: State[]; // Array of states to support both DFA and NFA natively. For DFA, this will just be an array of length 1.
}

export interface Automaton {
  isNFA: boolean;
  states: State[];
  alphabet: Symbol[];
  transitions: Transition[];
  initialState: State;
  acceptStates: State[];
}

// Result of a single step
export interface StepTrace {
  stepIndex: number;
  currentStates: State[];
  inputSymbol: Symbol | null; // null if it's the end of string or an epsilon transition
  nextStates: State[];
  isAccepted: boolean;
}

export interface SimulationResult {
  accepted: boolean;
  trace: StepTrace[];
  executionSteps: number; // For ReDoS analysis
  error?: string;
}
