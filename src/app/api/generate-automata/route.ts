import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

// Create Anthropic SDK instance configured for MiniMax API
const anthropic = new Anthropic({
  apiKey: process.env.MINIMAX_API_KEY || 'dummy_key',
  baseURL: 'https://api.minimax.io/anthropic',
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const systemPrompt = `
      You are an Automata Theory expert. The user will describe a language or pattern, possibly in Indonesian (Bahasa Indonesia).
      You must design a finite automaton (DFA or NFA) that accepts this language.
      
      Respond STRICTLY with a valid JSON object matching this exact TypeScript interface:
      {
        "isNFA": boolean,
        "states": string[],
        "alphabet": string[],
        "transitions": { "from": string, "input": string, "to": string[] }[],
        "initialState": string,
        "acceptStates": string[]
      }
      
      Rules:
      1. DO NOT wrap the output in markdown code blocks like \`\`\`json. Output raw JSON only.
      2. If the user request implies an NFA, set isNFA to true. Otherwise false.
      3. Use clear state names like "q0", "q1", etc.
      4. Ensure all transitions reference valid states.
    `;

    const response = await anthropic.messages.create({
      model: 'MiniMax-M2.7',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    console.log('Raw AI Response:', JSON.stringify(response, null, 2));

    let text = '';
    if (response.content && Array.isArray(response.content)) {
      // Find the first block of type 'text'
      const textBlock = response.content.find((block: any) => block.type === 'text');
      if (textBlock && 'text' in textBlock) {
        text = textBlock.text;
      }
    }

    if (!text) {
      throw new Error(`Empty response from AI. Raw response: ${JSON.stringify(response)}`);
    }

    // MiniMax/Anthropic might sometimes wrap JSON even if told not to, so we strip it if present
    const cleanedText = text.replace(/^```(json)?/, '').replace(/```$/, '').trim();

    const automaton = JSON.parse(cleanedText);

    // Normalize transitions in case the AI returned 'to' as a string instead of string[]
    if (automaton.transitions && Array.isArray(automaton.transitions)) {
      automaton.transitions = automaton.transitions.map((t: any) => ({
        ...t,
        to: Array.isArray(t.to) ? t.to : [t.to]
      }));
    }

    return NextResponse.json(automaton);

  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate automaton', details: error.message }, 
      { status: 500 }
    );
  }
}
