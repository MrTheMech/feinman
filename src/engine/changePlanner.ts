import path from 'path';
import { ChangePlanResult, ChangeScenario } from './types.js';
import { ScannedFile } from './scanner.js';
import { DependencyGraph, ExtractedSymbol } from './astParser.js';

export function planCodeChange(
  query: string,
  files: ScannedFile[],
  depGraph: DependencyGraph
): ChangePlanResult {
  const queryLower = query.toLowerCase();
  const queryTokens = queryLower
    .replace(/[^a-z0-9_]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);

  // Score each file based on query token relevance
  interface ScoredFile {
    file: string;
    score: number;
    matchingSymbols: ExtractedSymbol[];
    reasons: string[];
    suggestedLines?: string;
  }

  const scoredFiles: ScoredFile[] = [];

  for (const file of files) {
    let score = 0;
    const reasons: string[] = [];
    const relLower = file.relativePath.toLowerCase();
    const baseName = path.basename(file.relativePath).toLowerCase();

    // 1. Check path matches
    for (const token of queryTokens) {
      if (baseName.includes(token)) {
        score += 15;
        reasons.push(`Filename matches "${token}"`);
      } else if (relLower.includes(token)) {
        score += 8;
        reasons.push(`Directory path matches "${token}"`);
      }
    }

    // 2. Check symbol matches
    const symbols = depGraph.fileSymbols.get(file.relativePath) || [];
    const matchingSymbols: ExtractedSymbol[] = [];
    for (const sym of symbols) {
      const symLower = sym.name.toLowerCase();
      for (const token of queryTokens) {
        if (symLower.includes(token)) {
          score += 10;
          matchingSymbols.push(sym);
          reasons.push(`Contains symbol "${sym.name}" (line ${sym.line})`);
          break;
        }
      }
    }

    // 3. Check content keyword matches
    if (file.content) {
      const contentLower = file.content.toLowerCase();
      for (const token of queryTokens) {
        if (contentLower.includes(token)) {
          score += 3;
        }
      }
    }

    // Penalize test files for primary changes (they should be updated in blast radius)
    if (relLower.includes('test') || relLower.includes('spec')) {
      score = score * 0.5;
    }

    if (score > 0) {
      let suggestedLines: string | undefined;
      if (matchingSymbols.length > 0) {
        suggestedLines = `Around line ${matchingSymbols[0].line} (${matchingSymbols[0].name})`;
      }

      scoredFiles.push({
        file: file.relativePath,
        score,
        matchingSymbols,
        reasons: Array.from(new Set(reasons)),
        suggestedLines,
      });
    }
  }

  // Sort files descending by score
  scoredFiles.sort((a, b) => b.score - a.score);

  // Pick top files to modify
  const topFiles = scoredFiles.slice(0, 4);

  // If no files matched specifically, recommend core entrypoints
  if (topFiles.length === 0 && files.length > 0) {
    const fallback = files.find(f => f.relativePath.includes('main') || f.relativePath.includes('index')) || files[0];
    topFiles.push({
      file: fallback.relativePath,
      score: 1,
      matchingSymbols: [],
      reasons: ['Starting location for application configuration and logic dispatch'],
      suggestedLines: 'Line 1',
    });
  }

  // Calculate blast radius using reverse dependency graph
  const blastRadius: ChangePlanResult['blastRadius'] = [];
  const visitedBlast = new Set<string>();

  for (const item of topFiles) {
    const importers = depGraph.importedBy.get(item.file) || new Set();
    for (const importer of importers) {
      if (!visitedBlast.has(importer) && !topFiles.some(t => t.file === importer)) {
        visitedBlast.add(importer);
        const isTest = importer.toLowerCase().includes('test') || importer.toLowerCase().includes('spec');
        blastRadius.push({
          file: importer,
          impact: isTest ? 'Test Suite Verification' : 'Direct Downstream Importer',
          explanation: isTest
            ? `Runs automated tests that exercise functions imported from ${item.file}`
            : `Directly imports and relies on exported symbols from ${item.file}`,
        });
      }
      if (blastRadius.length >= 6) break;
    }
    if (blastRadius.length >= 6) break;
  }

  // Generate Step-by-Step implementation guide
  const primaryFile = topFiles[0];
  const stepByStepGuide: string[] = [
    `1. Inspect **${primaryFile.file}** to understand current signatures and behavior.`,
    topFiles.length > 1
      ? `2. Update supporting logic across **${topFiles.slice(1).map(f => f.file).join(', ')}** to ensure parameter and type consistency.`
      : `2. Implement your modification directly in **${primaryFile.file}**, maintaining existing error handling patterns.`,
    `3. Check downstream dependents: verify that files importing this module (${blastRadius.slice(0, 2).map(b => b.file).join(', ') || 'call sites'}) receive expected return types.`,
    `4. Run the project tests to verify no regressions were introduced.`,
  ];

  const verificationSteps: string[] = [
    `Open and inspect ${primaryFile.file}${primaryFile.suggestedLines ? ` at ${primaryFile.suggestedLines}` : ''}.`,
    `Ensure exported interfaces match what callers expect.`,
    blastRadius.some(b => b.impact.includes('Test'))
      ? `Execute test suite targeting modified behavior.`
      : `Verify by running the local dev server and triggering the modified code path.`,
  ];

  return {
    query,
    summary: `To implement "${query}", start in **${primaryFile.file}** where the primary logic resides. ${
      blastRadius.length > 0 ? `Be aware of ${blastRadius.length} downstream components that may need adjustments.` : 'Impact is localized.'
    }`,
    filesToModify: topFiles.map(tf => ({
      file: tf.file,
      importance: tf.score >= topFiles[0].score * 0.7 ? 'primary' : 'secondary',
      reason: tf.reasons.length > 0 ? tf.reasons.join('; ') : 'Relevant module in the target feature area',
      lines: tf.suggestedLines,
    })),
    blastRadius,
    stepByStepGuide,
    verificationSteps,
    modelUsed: 'Feinman Deterministic Graph & Heuristic Engine',
  };
}

export function generateDefaultScenarios(files: ScannedFile[], depGraph: DependencyGraph): ChangeScenario[] {
  const commonQueries = [
    'Add an API route or endpoint',
    'Add a new configuration or environment variable',
    'Update database model or schema',
    'Modify UI component styling or layout',
    'Write a new unit test',
  ];

  return commonQueries.map(q => {
    const plan = planCodeChange(q, files, depGraph);
    return {
      title: q,
      query: q,
      summary: plan.summary,
      targetFiles: plan.filesToModify.map(f => ({
        file: f.file,
        reason: f.reason,
        confidence: f.importance === 'primary' ? 0.95 : 0.75,
        recommendedLines: f.lines,
      })),
      blastRadius: plan.blastRadius.map(b => ({
        file: b.file,
        impact: b.impact as any,
        explanation: b.explanation,
      })),
      checklist: plan.stepByStepGuide,
    };
  });
}
