import path from 'path';
// Clean, non-backtracking line-based regexes
const IMPORT_FROM_REGEX = /from\s+['"]([^'"]+)['"]/;
const DIRECT_IMPORT_REGEX = /import\s+['"]([^'"]+)['"]/;
const REQUIRE_REGEX = /require\(['"]([^'"]+)['"]\)/;
const PY_FROM_IMPORT_REGEX = /^from\s+([a-zA-Z0-9_.]+)\s+import/;
const PY_IMPORT_REGEX = /^import\s+([a-zA-Z0-9_.]+)/;
const TS_FUNC_EXPORT = /export\s+(?:default\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)/;
const TS_CLASS_EXPORT = /export\s+(?:default\s+)?class\s+([a-zA-Z0-9_$]+)/;
const TS_INTERFACE_EXPORT = /export\s+interface\s+([a-zA-Z0-9_$]+)/;
const TS_TYPE_EXPORT = /export\s+type\s+([a-zA-Z0-9_$]+)/;
const TS_CONST_EXPORT = /export\s+const\s+([a-zA-Z0-9_$]+)/;
const PY_DEF_REGEX = /def\s+([a-zA-Z0-9_]+)\s*\(/;
const PY_CLASS_REGEX = /class\s+([a-zA-Z0-9_]+)(?:\(.*\))?:/;
export function buildDependencyGraph(files) {
    const imports = new Map();
    const importedBy = new Map();
    const fileSymbols = new Map();
    const allSymbols = [];
    const fileSet = new Set(files.map(f => f.relativePath));
    for (const file of files) {
        imports.set(file.relativePath, new Set());
        importedBy.set(file.relativePath, new Set());
        fileSymbols.set(file.relativePath, []);
    }
    for (const file of files) {
        if (!file.content)
            continue;
        const fileRel = file.relativePath;
        const fileDir = path.dirname(fileRel);
        const lines = file.content.split('\n');
        // Process line by line
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*'))
                continue;
            // 1. JS / TS Imports
            if (file.language.includes('TypeScript') || file.language.includes('JavaScript')) {
                let importTarget = null;
                const fromMatch = line.match(IMPORT_FROM_REGEX);
                if (fromMatch && fromMatch[1]) {
                    importTarget = fromMatch[1];
                }
                else {
                    const directMatch = line.match(DIRECT_IMPORT_REGEX);
                    if (directMatch && directMatch[1]) {
                        importTarget = directMatch[1];
                    }
                    else {
                        const reqMatch = line.match(REQUIRE_REGEX);
                        if (reqMatch && reqMatch[1]) {
                            importTarget = reqMatch[1];
                        }
                    }
                }
                if (importTarget && importTarget.startsWith('.')) {
                    resolveAndLink(fileRel, fileDir, importTarget, fileSet, imports, importedBy);
                }
                // Symbols extraction
                extractTSSymbols(line, i + 1, fileRel, fileSymbols, allSymbols);
            }
            // 2. Python
            if (file.language === 'Python') {
                const pyFrom = line.match(PY_FROM_IMPORT_REGEX);
                const pyDirect = line.match(PY_IMPORT_REGEX);
                const target = (pyFrom && pyFrom[1]) || (pyDirect && pyDirect[1]);
                if (target && target.startsWith('.')) {
                    resolveAndLink(fileRel, fileDir, target, fileSet, imports, importedBy);
                }
                const defMatch = line.match(PY_DEF_REGEX);
                if (defMatch) {
                    const sym = {
                        name: defMatch[1],
                        kind: 'function',
                        file: fileRel,
                        line: i + 1,
                        snippet: trimmed,
                        isExported: !defMatch[1].startsWith('_'),
                    };
                    fileSymbols.get(fileRel)?.push(sym);
                    allSymbols.push(sym);
                }
                const classMatch = line.match(PY_CLASS_REGEX);
                if (classMatch) {
                    const sym = {
                        name: classMatch[1],
                        kind: 'class',
                        file: fileRel,
                        line: i + 1,
                        snippet: trimmed,
                        isExported: true,
                    };
                    fileSymbols.get(fileRel)?.push(sym);
                    allSymbols.push(sym);
                }
            }
        }
    }
    return {
        imports,
        importedBy,
        fileSymbols,
        allSymbols,
    };
}
function resolveAndLink(sourceFile, sourceDir, importPath, fileSet, imports, importedBy) {
    const possibleExtensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.js', '/index.tsx'];
    const rawTarget = path.join(sourceDir, importPath).replace(/\\/g, '/');
    for (const ext of possibleExtensions) {
        const candidate = `${rawTarget}${ext}`.replace(/\\/g, '/');
        if (fileSet.has(candidate) && candidate !== sourceFile) {
            imports.get(sourceFile)?.add(candidate);
            importedBy.get(candidate)?.add(sourceFile);
            return;
        }
    }
}
function extractTSSymbols(line, lineNumber, file, fileSymbols, allSymbols) {
    const patterns = [
        { regex: TS_FUNC_EXPORT, kind: 'function' },
        { regex: TS_CLASS_EXPORT, kind: 'class' },
        { regex: TS_INTERFACE_EXPORT, kind: 'interface' },
        { regex: TS_TYPE_EXPORT, kind: 'type' },
        { regex: TS_CONST_EXPORT, kind: 'variable' },
    ];
    for (const { regex, kind } of patterns) {
        const match = line.match(regex);
        if (match && match[1]) {
            const sym = {
                name: match[1],
                kind,
                file,
                line: lineNumber,
                snippet: line.trim(),
                isExported: true,
            };
            fileSymbols.get(file)?.push(sym);
            allSymbols.push(sym);
            break;
        }
    }
}
