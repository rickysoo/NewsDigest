#!/usr/bin/env node
// Script to add missing npm scripts to package.json
const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, 'package.json');

try {
  // Read the current package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add missing scripts
  packageJson.scripts = packageJson.scripts || {};
  
  // Add dev script if missing
  if (!packageJson.scripts.dev) {
    packageJson.scripts.dev = "node digest-script.js --test";
  }
  
  // Add build script if missing
  if (!packageJson.scripts.build) {
    packageJson.scripts.build = "echo 'No build step required for Node.js automation script'";
  }
  
  // Write back to package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Successfully added missing scripts to package.json');
  console.log('Added scripts:', {
    dev: packageJson.scripts.dev,
    build: packageJson.scripts.build
  });
  
} catch (error) {
  console.error('Error updating package.json:', error.message);
  process.exit(1);
}