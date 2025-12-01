#!/usr/bin/env node

/**
 * Kill process on port 5000
 * Usage: node scripts/kill-port.js [port]
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const port = process.argv[2] || 5000;

async function killPort(port) {
  try {
    // Windows command to find and kill process on port
    const command = `for /f "tokens=5" %a in ('netstat -aon ^| findstr :${port}') do taskkill /F /PID %a`;
    
    console.log(`Attempting to free port ${port}...`);
    
    // Try to kill the process
    try {
      await execAsync(command, { shell: true });
      console.log(`✓ Port ${port} is now free`);
    } catch (error) {
      // If no process found, that's okay
      if (error.message.includes('not found') || error.message.includes('No tasks')) {
        console.log(`✓ Port ${port} is already free`);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error(`Error freeing port ${port}:`, error.message);
    process.exit(1);
  }
}

killPort(port);

