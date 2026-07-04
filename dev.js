import { spawn } from 'child_process';
import path from 'path';

console.log('Iniciando el entorno de desarrollo...');

// Ejecutar Express Server (puerto 3001) usando tsx
const serverProcess = spawn('npx', ['tsx', 'server.ts'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '3001' }
});

// Ejecutar Vite Dev Server (puerto 3000)
const viteProcess = spawn('npx', ['vite', '--port=3000', '--host=0.0.0.0'], {
  stdio: 'inherit',
  shell: true
});

// Manejo de salida
const cleanup = () => {
  console.log('\nCerrando servidores...');
  viteProcess.kill();
  serverProcess.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
