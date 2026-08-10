/**
 * Standalone entrypoint for applying the prime directive to the CMS database.
 *
 * Unlike `index.ts --sync-content`, this does not bind a port, so it can be run
 * against a live deployment where the API server already holds 3003.
 *
 *   cd server && bun run sync-content
 *
 * Must be run from the `server` directory — the LMDB path is `process.cwd() + '/data'`.
 * Running it elsewhere silently creates an empty database instead of updating the real one.
 */

import { initDB } from '../actions/db.js';
import { initCMSDB, closeCMSDB } from './db.js';
import { syncPrimeDirective } from './prime-directive.js';

const dataPath = process.cwd() + '/data';
console.log(`Using LMDB at ${dataPath}`);

await initDB();
await initCMSDB();
await syncPrimeDirective();
await closeCMSDB();

process.exit(0);
