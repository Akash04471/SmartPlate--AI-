import { execSync } from 'child_process';

const port = process.argv[2] || 3000;

console.log(`[PortGuard] Auditing port ${port}...`);

try {
  let command = '';
  if (process.platform === 'win32') {
    const findCmd = `netstat -ano | findstr :${port}`;
    const output = execSync(findCmd, { encoding: 'utf8' }).trim();
    
    const lines = output.split('\n');
    const pids = new Set();
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') pids.add(pid);
    });

    if (pids.size > 0) {
      console.log(`[PortGuard] Found ${pids.size} process(es) on port ${port}. Terminating...`);
      pids.forEach(pid => {
        try {
          execSync(`taskkill /F /PID ${pid}`);
          console.log(`[PortGuard] PID ${pid} terminated.`);
        } catch (e) {
          // ignore failures to kill individual PIDs
        }
      });
    } else {
      console.log(`[PortGuard] Port ${port} is clear.`);
    }
  } else {
    try {
      execSync(`lsof -t -i:${port} | xargs kill -9`);
      console.log(`[PortGuard] Port ${port} cleared (Unix).`);
    } catch (e) {
      console.log(`[PortGuard] Port ${port} was already clear.`);
    }
  }
} catch (err) {
  console.log(`[PortGuard] Port ${port} is available.`);
}
