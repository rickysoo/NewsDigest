#!/usr/bin/env node

/**
 * CommonJS wrapper for the ES module digest script
 * This allows the package.json to remain as CommonJS while running the ES module version
 */

import('./digest-script.mjs')
  .then(() => {
    console.log('✅ Digest script execution completed');
  })
  .catch((error) => {
    console.error('❌ Digest script failed:', error.message);
    process.exit(1);
  });