import { execSync } from 'child_process';

const port = process.argv[2] || 5051;

console.log(`[PortGuard] Auditing port ${port}...`);

try {
  let command = '';
  if (process.platform === 'win32') {
    // Windows: Find process on port and kill it
    command = `stop-process -id (get-netstat -p tcp -a | select-string :${port} | foreach { $_.ToString().Split(' ')[-1] }) -force`;
    // Actually a more reliable PS command:
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
        if (pid === process.pid.toString() || pid === process.ppid.toString()) {
           console.log(`[PortGuard] Skipping self/parent PID ${pid}`);
           return;
        }
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`[PortGuard] PID ${pid} terminated.`);
        } catch (e) {
          console.warn(`[PortGuard] Could not terminate PID ${pid}: ${e.message}`);
        }
      });
    } else {

      console.log(`[PortGuard] Port ${port} is clear.`);
    }
  } else {
    // Unix: lsof/fuser
    try {
      execSync(`lsof -t -i:${port} | xargs kill -9`);
      console.log(`[PortGuard] Port ${port} cleared (Unix).`);
    } catch (e) {
      console.log(`[PortGuard] Port ${port} was already clear.`);
    }
  }
} catch (err) {
  // If findstr fails, it means no process was found
  console.log(`[PortGuard] Port ${port} is available.`);
}
