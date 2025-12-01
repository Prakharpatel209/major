#!/usr/bin/env node

/**
 * Setup script for the backend
 * This script helps initialize the backend environment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('Setting up backend...\n');

// Create uploads directory
const uploadsDir = path.join(rootDir, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✓ Created uploads directory');
} else {
  console.log('✓ Uploads directory already exists');
}

// Check if .env file exists
const envPath = path.join(rootDir, '.env');
if (!fs.existsSync(envPath)) {
  console.log('\n⚠ .env file not found!');
  console.log('Please create a .env file with the following variables:');
  console.log('  PORT=5000');
  console.log('  NODE_ENV=development');
  console.log('  MONGODB_URI=mongodb://localhost:27017/rental-marketplace');
  console.log('  JWT_SECRET=your-super-secret-jwt-key-change-this-in-production');
  console.log('\nSee ENV_CONFIG.md for more details.\n');
} else {
  console.log('✓ .env file exists');
}

// Check if node_modules exists
const nodeModulesPath = path.join(rootDir, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('\n⚠ node_modules not found!');
  console.log('Run: npm install\n');
} else {
  console.log('✓ Dependencies installed');
}

console.log('\nSetup complete!');
console.log('Next steps:');
console.log('  1. Make sure MongoDB is running');
console.log('  2. Create a .env file if you haven\'t already');
console.log('  3. Run: npm install (if you haven\'t already)');
console.log('  4. Run: npm run dev (to start the development server)');

