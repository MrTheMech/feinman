import { spawn } from 'child_process';
import path from 'path';

const child = spawn('node', ['bin/feynstart.js', '--mcp', '.'], {
  cwd: path.resolve('.'),
  stdio: ['pipe', 'pipe', 'inherit'],
});

child.stdout.on('data', (data) => {
  console.log('MCP RESPONSE:\n', data.toString());
  process.exit(0);
});

const req = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
}) + '\n';

child.stdin.write(req);
