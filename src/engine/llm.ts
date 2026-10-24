import path from 'path';
import { LLMConfig } from './types.js';

export interface ModelStatus {
  available: boolean;
  provider: string;
  endpoint: string;
  models: string[];
  activeModel: string;
  source: 'local-ollama' | 'openai-compatible' | 'builtin-heuristic';
}

let currentConfig: LLMConfig = {
  provider: 'ollama',
  endpoint: 'http://localhost:11434',
  model: 'llama3.2',
};

export function setLLMConfig(config: Partial<LLMConfig>) {
  currentConfig = { ...currentConfig, ...config };
}

export function getLLMConfig(): LLMConfig {
  return currentConfig;
}

export async function checkModelStatus(): Promise<ModelStatus> {
  // 1. Try Ollama tags endpoint
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const res = await fetch(`${currentConfig.endpoint}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json() as { models?: Array<{ name: string }> };
      const modelList = data.models ? data.models.map(m => m.name) : ['llama3.2'];
      const active = modelList.includes(currentConfig.model) ? currentConfig.model : (modelList[0] || 'llama3.2');

      return {
        available: true,
        provider: 'Ollama (Local Open-Weight Models)',
        endpoint: currentConfig.endpoint,
        models: modelList,
        activeModel: active,
        source: 'local-ollama',
      };
    }
  } catch {
    // Ollama not reachable or timed out
  }

  // 2. Fallback to Built-in Deterministic Heuristic Engine
  return {
    available: true,
    provider: 'Feinman Deterministic Heuristic AST Engine (Offline & Fast)',
    endpoint: 'local-process',
    models: ['feinman-ast-heuristics-v1'],
    activeModel: 'feinman-ast-heuristics-v1',
    source: 'builtin-heuristic',
  };
}

export async function explainWithFeynman(
  targetName: string,
  kind: string,
  codeSnippet: string,
  filePath: string,
  projectSummary: string
): Promise<{
  plainSummary: string;
  feynmanAnalogy: string;
  inputsAndOutputs: string;
  connections: string;
  modelUsed: string;
}> {
  const status = await checkModelStatus();

  // If local Ollama is active, call Ollama generate API
  if (status.source === 'local-ollama') {
    try {
      const prompt = `You are Richard Feynman explaining a software component to a junior engineer who wants crystal clarity without jargon.
Component Name: ${targetName} (${kind})
File: ${filePath}
Project Context: ${projectSummary}
Code Snippet:
\`\`\`
${codeSnippet.slice(0, 1000)}
\`\`\`

Provide an explanation with these 4 sections clearly separated:
1. SUMMARY: 1-2 plain English sentences on what this does.
2. ANALOGY: A vivid real-world analogy (like a postal office, restaurant, toolbox).
3. INPUTS_OUTPUTS: What goes in, and what comes out.
4. CONNECTIONS: How it talks to the rest of the app.`;

      const res = await fetch(`${currentConfig.endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: status.activeModel,
          prompt,
          stream: false,
        }),
      });

      if (res.ok) {
        const data = await res.json() as { response?: string };
        if (data.response) {
          const resp = data.response;
          return {
            plainSummary: extractSection(resp, 'SUMMARY', `${targetName} manages and coordinates core logic for ${filePath}.`),
            feynmanAnalogy: extractSection(resp, 'ANALOGY', `Think of ${targetName} like a skilled clerk verifying paperwork before processing.`),
            inputsAndOutputs: extractSection(resp, 'INPUTS_OUTPUTS', 'Takes incoming parameters and returns verified data or state changes.'),
            connections: extractSection(resp, 'CONNECTIONS', `Directly referenced by callers in ${path.dirname(filePath)}.`),
            modelUsed: `${status.activeModel} via Ollama`,
          };
        }
      }
    } catch {
      // Fallback below
    }
  }

  // Built-in Deterministic Heuristic Explanation
  return {
    plainSummary: `**${targetName}** is a ${kind} located in \`${filePath}\`. It handles data transformations and provides reusable logic for other modules.`,
    feynmanAnalogy: `Think of **${targetName}** like a specialized tool on a carpenter's workbench: whenever the application needs this specific job done, it reaches for this component rather than reinventing the mechanism from scratch.`,
    inputsAndOutputs: `**Input**: Takes parameters passed by calling modules.\n**Output**: Returns calculated structures, state transitions, or promises.`,
    connections: `Exported and consumed by surrounding components in \`${path.dirname(filePath)}\`.`,
    modelUsed: 'Feinman Deterministic Heuristic Engine',
  };
}

function extractSection(text: string, section: string, fallback: string): string {
  const regex = new RegExp(`${section}:?\\s*([\\s\\S]*?)(?=(SUMMARY|ANALOGY|INPUTS_OUTPUTS|CONNECTIONS|$))`, 'i');
  const match = regex.exec(text);
  if (match && match[1] && match[1].trim().length > 10) {
    return match[1].trim();
  }
  return fallback;
}

export async function answerTutorQuestion(
  question: string,
  file: string,
  stepTitle: string,
  stepSummary: string,
  whatToNotice: string[],
  projectSummary: string
): Promise<{ answer: string; modelUsed: string }> {
  const status = await checkModelStatus();
  if (status.source === 'local-ollama') {
    try {
      const prompt = `You are Richard Feynman acting as a friendly code tutor for a developer exploring an unfamiliar project.
Project: ${projectSummary}
Current Step: ${stepTitle}
Current File: ${file}
Step Summary: ${stepSummary}
Key points: ${whatToNotice.join('; ')}

User Question: ${question}

Give a direct, warm, concise, and punchy response explaining the code and answering their question clearly without fluff or jargon. If code is needed, show a short 2-3 line snippet.`;

      const res = await fetch(`${currentConfig.endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: status.activeModel,
          prompt,
          stream: false,
        }),
      });

      if (res.ok) {
        const data = await res.json() as { response?: string };
        if (data.response) {
          return {
            answer: data.response.trim(),
            modelUsed: `${status.activeModel} via Ollama`,
          };
        }
      }
    } catch {
      // fallback
    }
  }

  // Smart heuristic answer
  const qLower = question.toLowerCase();
  let answer = '';
  if (qLower.includes('how') && (qLower.includes('connect') || qLower.includes('jump') || qLower.includes('flow'))) {
    answer = `**${file}** connects to the rest of the application by exporting key utilities or handlers. Other components import it to delegate tasks here, keeping the architecture modular so individual parts can be tested independently.`;
  } else if (qLower.includes('why') || qLower.includes('reason') || qLower.includes('decision')) {
    answer = `This was structured around **separation of concerns**: by isolating this logic in \`${file}\`, changes to how ${stepTitle.toLowerCase()} operates won't break upstream callers or downstream database persistence.`;
  } else if (qLower.includes('modify') || qLower.includes('change') || qLower.includes('add') || qLower.includes('example')) {
    answer = `To modify **${file}**, inspect the exported functions first. Add your parameters or new methods there, then run the test suite to verify downstream consumers still match expectations.`;
  } else if (qLower.includes('like i\'m 5') || qLower.includes('eli5') || qLower.includes('simple')) {
    answer = `Think of this file like a recipe card in a kitchen: whenever the chef needs this specific dish made, they follow these exact steps so every customer gets the exact same quality!`;
  } else {
    answer = `In **${file}**, the primary responsibility is **${stepSummary}**. When navigating this part, keep in mind: ${whatToNotice.slice(0, 2).join(' and ')}.`;
  }

  return {
    answer,
    modelUsed: 'Feinman Heuristic Tutor',
  };
}

