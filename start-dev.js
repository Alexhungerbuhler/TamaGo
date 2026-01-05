#!/usr/bin/env node

/**
 * Script pour lancer le backend et le frontend simultanément
 * Usage: node start-dev.js
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Fonction pour lancer un processus
function startProcess(name, command, args, cwd, color) {
  log(`\n🚀 Démarrage de ${name}...`, color);
  
  const process = spawn(command, args, {
    cwd: cwd,
    shell: true,
    stdio: 'inherit'
  });

  process.on('error', (error) => {
    log(`❌ Erreur lors du démarrage de ${name}: ${error.message}`, 'red');
  });

  process.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      log(`⚠️  ${name} s'est arrêté avec le code ${code}`, 'yellow');
    }
  });

  return process;
}

// Lancer le backend
const backend = startProcess(
  'Backend',
  'npm',
  ['run', 'dev'],
  join(__dirname, 'backend'),
  'cyan'
);

// Attendre un peu avant de lancer le frontend
setTimeout(() => {
  // Lancer le frontend
  const frontend = startProcess(
    'Frontend',
    'npm',
    ['run', 'dev'],
    join(__dirname, 'frontend'),
    'magenta'
  );

  // Gestion de l'arrêt propre
  process.on('SIGINT', () => {
    log('\n\n🛑 Arrêt des services...', 'yellow');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    log('\n\n🛑 Arrêt des services...', 'yellow');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });
}, 2000);

log('\n✅ Services démarrés !', 'green');
log('📝 Appuyez sur Ctrl+C pour arrêter les services\n', 'yellow');

