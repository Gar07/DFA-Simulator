import { Automaton, SimulationResult, State, StepTrace } from "./types";

export const validateAutomaton = (automaton: Automaton): string | null => {
  if (!automaton.states.includes(automaton.initialState)) {
    return "Initial state is not in the set of states.";
  }
  for (const acc of automaton.acceptStates) {
    if (!automaton.states.includes(acc)) {
      return `Accept state ${acc} is not in the set of states.`;
    }
  }

  if (!automaton.isNFA) {
    const transitionMap = new Set<string>();
    for (const t of automaton.transitions) {
      if (t.to.length !== 1) {
        return `DFA transition from ${t.from} on '${t.input}' must have exactly one destination.`;
      }
      const key = `${t.from}-${t.input}`;
      if (transitionMap.has(key)) {
        return `DFA cannot have multiple transitions for the same state (${t.from}) and input ('${t.input}').`;
      }
      transitionMap.add(key);
    }
  }

  return null; // Valid
};

export const simulateAutomaton = (automaton: Automaton, input: string): SimulationResult => {
  const error = validateAutomaton(automaton);
  if (error) {
    return { accepted: false, trace: [], executionSteps: 0, error };
  }

  let currentStates: State[] = [automaton.initialState];
  const trace: StepTrace[] = [];
  let executionSteps = 0; // Complexity tracker for ReDoS

  for (let i = 0; i < input.length; i++) {
    const symbol = input[i];
    const nextStatesSet = new Set<State>();

    for (const currentState of currentStates) {
      executionSteps++;
      
      const relevantTransitions = automaton.transitions.filter(
        t => t.from === currentState && t.input === symbol
      );

      for (const t of relevantTransitions) {
        for (const dest of t.to) {
          nextStatesSet.add(dest);
        }
      }
    }

    const nextStates = Array.from(nextStatesSet);
    
    trace.push({
      stepIndex: i,
      currentStates: [...currentStates],
      inputSymbol: symbol,
      nextStates: [...nextStates],
      isAccepted: nextStates.some(s => automaton.acceptStates.includes(s))
    });

    currentStates = nextStates;
    
    if (currentStates.length === 0) {
      break; // Dead state reached
    }
  }

  const accepted = currentStates.some(s => automaton.acceptStates.includes(s)) && trace.length === input.length;

  // Add a final state evaluation to the execution steps
  executionSteps += currentStates.length;

  return {
    accepted,
    trace,
    executionSteps,
  };
};
