import { spawn } from 'child_process';
import path from 'path';

const child = spawn('node', ['bin/feynstart.js', '--mcp', '.'], {
  cwd: path.resolve('.'),
  stdio: ['pipe', 'pipe', 'inherit'],
});

child.stdout.on('data', (data) => {
  const res = JSON.parse(data.toString());
  console.log('MCP TOOLS COUNT:', res.result?.tools?.length);
  console.log('TOOL NAMES:', res.result?.tools?.map(t => t.name).join(', '));
  process.exit(0);
});

const req = JSON.stringify({
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/list',
}) + '\n';

child.stdin.write(req);
