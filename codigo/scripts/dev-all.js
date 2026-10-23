// ── scripts/dev-all.js ───────────────────────────────────────────────────────
// Levanta el backend (Express en :5000) y el frontend (Vite en :5173) juntos.
// Uso: npm run dev:all
// Evita el error 502 "Bad Gateway" que aparece cuando Vite está corriendo
// pero el backend no está disponible.

const { spawn } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const children = [];
let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) {
      try {
        child.kill();
      } catch (err) {
        // Ignoramos errores al cerrar procesos ya finalizados
      }
    }
  }
  setTimeout(() => process.exit(code), 300);
}

function start(name, command, args, cwd, useShell = false) {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: useShell,
    env: process.env,
  });

  children.push(child);

  child.on('error', (err) => {
    console.error(`[${name}] No se pudo iniciar: ${err.message}`);
    shutdown(1);
  });

  child.on('exit', (code, signal) => {
    if (!shuttingDown) {
      console.log(`[${name}] terminó (${signal || code}). Cerrando el otro proceso...`);
      shutdown(code || 0);
    }
  });
}

console.log('▶ Iniciando backend (http://localhost:5000) y frontend (http://localhost:5173)...\n');

start('API', process.execPath, ['index.js'], path.join(root, 'server'), false);
start('WEB', 'npm', ['run', 'dev'], root, process.platform === 'win32');

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
