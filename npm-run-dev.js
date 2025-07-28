#!/usr/bin/env node
// Workaround script to provide missing 'npm run dev' functionality
console.log('🚀 Starting FMT News Digest in development mode...');
console.log('Running test digest generation...');

// Import and run the digest script in test mode
import('./digest-script.mjs')
  .then(() => {
    console.log('✅ Development mode completed successfully');
  })
  .catch((error) => {
    console.error('❌ Development mode failed:', error.message);
    process.exit(1);
  });