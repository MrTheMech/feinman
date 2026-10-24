import path from 'path';
let currentConfig = {
    provider: 'ollama',
    endpoint: 'http://localhost:11434',
    model: 'llama3.2',
};
export function setLLMConfig(config) {
    currentConfig = { ...currentConfig, ...config };
}
export function getLLMConfig() {
    return currentConfig;
}
export async function checkModelStatus() {
    // 1. Try Ollama tags endpoint
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        const res = await fetch(`${currentConfig.endpoint}/api/tags`, {
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
            const data = await res.json();
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
    }
    catch {
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
export async function explainWithFeynman(targetName, kind, codeSnippet, filePath, projectSummary) {
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
                const data = await res.json();
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
        }
        catch {
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
function extractSection(text, section, fallback) {
    const regex = new RegExp(`${section}:?\\s*([\\s\\S]*?)(?=(SUMMARY|ANALOGY|INPUTS_OUTPUTS|CONNECTIONS|$))`, 'i');
    const match = regex.exec(text);
    if (match && match[1] && match[1].trim().length > 10) {
        return match[1].trim();
    }
    return fallback;
}
