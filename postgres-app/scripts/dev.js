const { spawn } = require('child_process');
const path = require('path');

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const rootDir = path.resolve(__dirname, '..');

const children = [
  spawn(npmCommand, ['run', 'dev:server'], {
    cwd: rootDir,
    stdio: 'inherit',
  }),
  spawn(npmCommand, ['run', 'dev:client'], {
    cwd: rootDir,
    stdio: 'inherit',
  }),
];

let shuttingDown = false;

function stopAll(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(exitCode);
}

for (const child of children) {
  child.on('exit', (code, signal) => {
    if (!shuttingDown && code !== 0) {
      const reason = signal ? `signal ${signal}` : `exit code ${code}`;
      console.error(`Dev process stopped with ${reason}.`);
      stopAll(code || 1);
    }
  });
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
