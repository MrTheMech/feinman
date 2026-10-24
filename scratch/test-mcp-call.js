import { spawn } from 'child_process';
import path from 'path';

const child = spawn('node', ['bin/feynstart.js', '--mcp', '.'], {
  cwd: path.resolve('.'),
  stdio: ['pipe', 'pipe', 'inherit'],
});

child.stdout.on('data', (data) => {
  const res = JSON.parse(data.toString());
  console.log('TOOL CALL RESULT:');
  console.log(res.result?.content?.[0]?.text?.slice(0, 500));
  process.exit(0);
});

const req = JSON.stringify({
  jsonrpc: '2.0',
  id: 3,
  method: 'tools/call',
  params: {
    name: 'feinman_plan_change',
    arguments: { goal: 'Add WebSocket streaming for architecture graph updates' },
  },
}) + '\n';

child.stdin.write(req);
