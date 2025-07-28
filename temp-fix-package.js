#!/usr/bin/env node
/**
 * Temporary fix to add missing npm scripts
 */
const fs = require('fs');
const path = require('path');

try {
  const packagePath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Add missing scripts
  packageJson.scripts.dev = 'node digest-script.mjs --test';
  packageJson.scripts.build = 'echo "No build step required for Node.js automation script"';
  
  // Write the updated package.json
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Added missing dev and build scripts to package.json');
  
} catch (error) {
  console.error('❌ Failed to update package.json:', error.message);
  process.exit(1);
}