// Start development script for Generativ Consulting Company CMS
// This script starts both the server and client concurrently, and seeds the database if needed

const concurrently = require('concurrently');
const path = require('path');
const fs = require('fs');

// Check if the database exists
const dbPath = path.join(__dirname, 'server', 'data');
const dbExists = fs.existsSync(dbPath) && fs.readdirSync(dbPath).length > 0;

// Determine if we need to seed the database
const shouldSeed = !dbExists || process.argv.includes('--seed');

console.log('Starting Generativ Consulting Company CMS development environment...');
console.log(`Database will ${shouldSeed ? '' : 'not '}be seeded.`);

// Define commands to run concurrently
const commands = [
  {
    command: `cd ${path.join(__dirname, 'server')} && SEED_CMS=${shouldSeed ? 'true' : 'false'} bun run dev ${shouldSeed ? '--seed-cms' : ''}`,
    name: 'server',
    prefixColor: 'blue',
  },
  {
    command: `cd ${path.join(__dirname, 'client')} && bun run dev`,
    name: 'client',
    prefixColor: 'green',
  }
];

// Run commands concurrently
const { result } = concurrently(commands, {
  prefix: 'name',
  timestampFormat: 'HH:mm:ss',
  inputStream: process.stdin,
  killOthers: ['failure', 'success'],
});

// Handle process completion
result
  .then(() => {
    console.log('All processes completed successfully');
  })
  .catch((err) => {
    console.error('One or more processes failed:', err);
  });

console.log('Press Ctrl+C to stop all processes.');
