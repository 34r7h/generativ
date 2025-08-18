// Start development script for Generativ Consulting Company CMS
// This script starts both the server and client, and seeds the database if needed

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if the database exists
const dbPath = path.join(__dirname, 'server', 'data');
const dbExists = fs.existsSync(dbPath) && fs.readdirSync(dbPath).length > 0;

// Determine if we need to seed the database
const shouldSeed = !dbExists || process.argv.includes('--seed');

console.log('Starting Generativ Consulting Company CMS development environment...');

// Start the server
const serverProcess = spawn('bun', ['run', 'dev', shouldSeed ? '--seed-cms' : ''], {
  cwd: path.join(__dirname, 'server'),
  env: {
    ...process.env,
    SEED_CMS: shouldSeed ? 'true' : 'false'
  },
  stdio: 'pipe'
});

serverProcess.stdout.on('data', (data) => {
  console.log(`[SERVER] ${data.toString().trim()}`);
});

serverProcess.stderr.on('data', (data) => {
  console.error(`[SERVER ERROR] ${data.toString().trim()}`);
});

// Wait a bit for the server to start
setTimeout(() => {
  console.log('Starting client...');
  
  // Start the client
  const clientProcess = spawn('bun', ['run', 'dev'], {
    cwd: path.join(__dirname, 'client'),
    stdio: 'pipe'
  });

  clientProcess.stdout.on('data', (data) => {
    console.log(`[CLIENT] ${data.toString().trim()}`);
  });

  clientProcess.stderr.on('data', (data) => {
    console.error(`[CLIENT ERROR] ${data.toString().trim()}`);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Shutting down...');
    clientProcess.kill();
    serverProcess.kill();
    process.exit(0);
  });
}, 2000);

console.log(`Database will ${shouldSeed ? '' : 'not '}be seeded.`);
console.log('Press Ctrl+C to stop all processes.');
