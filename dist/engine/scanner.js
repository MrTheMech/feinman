import fs from 'fs';
import path from 'path';
import ignore from 'ignore';
const DEFAULT_IGNORES = [
    '.git',
    '.svn',
    '.hg',
    'node_modules',
    'dist',
    'build',
    'out',
    '.next',
    '.nuxt',
    'target',
    'vendor',
    '.venv',
    'venv',
    '__pycache__',
    '.pytest_cache',
    'coverage',
    '.turbo',
    '.cache',
    '.idea',
    '.vscode',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'bun.lockb',
    '*.pyc',
    '*.exe',
    '*.dll',
    '*.so',
    '*.dylib',
    '*.png',
    '*.jpg',
    '*.jpeg',
    '*.gif',
    '*.webp',
    '*.ico',
    '*.svg',
    '*.woff',
    '*.woff2',
    '*.ttf',
    '*.eot',
    '*.mp4',
    '*.mp3',
    '*.zip',
    '*.tar',
    '*.gz',
    '*.rar',
    '*.pdf',
    '*.map',
    '.DS_Store',
    'Thumbs.db',
];
const EXTENSION_LANGUAGE_MAP = {
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript (React)',
    '.js': 'JavaScript',
    '.jsx': 'JavaScript (React)',
    '.mjs': 'JavaScript',
    '.cjs': 'JavaScript',
    '.py': 'Python',
    '.go': 'Go',
    '.rs': 'Rust',
    '.java': 'Java',
    '.rb': 'Ruby',
    '.php': 'PHP',
    '.c': 'C',
    '.cpp': 'C++',
    '.h': 'C/C++ Header',
    '.cs': 'C#',
    '.html': 'HTML',
    '.css': 'CSS',
    '.scss': 'SCSS',
    '.json': 'JSON',
    '.yaml': 'YAML',
    '.yml': 'YAML',
    '.md': 'Markdown',
    '.sql': 'SQL',
    '.sh': 'Shell',
    '.bash': 'Bash',
    '.zsh': 'Zsh',
    '.ps1': 'PowerShell',
    '.dockerfile': 'Dockerfile',
};
export function scanRepository(rootPath, maxFiles = 2000) {
    const absoluteRoot = path.resolve(rootPath);
    const createIgnore = (typeof ignore === 'function' ? ignore : ignore.default || ignore);
    const ig = createIgnore().add(DEFAULT_IGNORES);
    const gitignorePath = path.join(absoluteRoot, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
        try {
            const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
            ig.add(gitignoreContent);
        }
        catch {
            // Ignore reading error
        }
    }
    const scannedFiles = [];
    const languageStats = {};
    function traverse(dir, relDir = '') {
        if (!fs.existsSync(dir))
            return [];
        let entries = [];
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        }
        catch {
            return [];
        }
        const nodes = [];
        for (const entry of entries) {
            if (scannedFiles.length >= maxFiles)
                break;
            const relPath = relDir ? `${relDir}/${entry.name}` : entry.name;
            const normalizedPath = relPath.replace(/\\/g, '/');
            // Check ignore
            if (ig.ignores(normalizedPath) || ig.ignores(entry.name)) {
                continue;
            }
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                const children = traverse(fullPath, relPath);
                if (children.length > 0) {
                    nodes.push({
                        path: normalizedPath,
                        name: entry.name,
                        isDirectory: true,
                        children,
                    });
                }
            }
            else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                const language = EXTENSION_LANGUAGE_MAP[ext] || 'Text';
                let lineCount = 0;
                let sizeBytes = 0;
                let content;
                try {
                    const stats = fs.statSync(fullPath);
                    sizeBytes = stats.size;
                    // Read content only for text/code files under 500KB
                    if (sizeBytes < 500 * 1024) {
                        content = fs.readFileSync(fullPath, 'utf-8');
                        lineCount = content.split('\n').length;
                    }
                }
                catch {
                    // Skip if unreadable
                    continue;
                }
                const fileRecord = {
                    relativePath: normalizedPath,
                    absolutePath: fullPath,
                    language,
                    lineCount,
                    sizeBytes,
                    content,
                };
                scannedFiles.push(fileRecord);
                languageStats[language] = (languageStats[language] || 0) + lineCount;
                nodes.push({
                    path: normalizedPath,
                    name: entry.name,
                    isDirectory: false,
                    size: sizeBytes,
                    lineCount,
                    language,
                });
            }
        }
        return nodes.sort((a, b) => {
            if (a.isDirectory && !b.isDirectory)
                return -1;
            if (!a.isDirectory && b.isDirectory)
                return 1;
            return a.name.localeCompare(b.name);
        });
    }
    const fileTree = traverse(absoluteRoot);
    let totalLines = 0;
    let totalBytes = 0;
    for (const f of scannedFiles) {
        totalLines += f.lineCount;
        totalBytes += f.sizeBytes;
    }
    let primaryLanguage = 'TypeScript';
    let maxLangLines = -1;
    for (const [lang, lines] of Object.entries(languageStats)) {
        if (lang !== 'Text' && lang !== 'Markdown' && lang !== 'JSON' && lines > maxLangLines) {
            maxLangLines = lines;
            primaryLanguage = lang;
        }
    }
    return {
        rootPath: absoluteRoot,
        files: scannedFiles,
        fileTree,
        totalLines,
        totalBytes,
        languageStats,
        primaryLanguage,
    };
}
