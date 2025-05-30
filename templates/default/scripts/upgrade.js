#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

async function upgrade() {
  try {
    console.log('🚀 Upgrading Cron Task Platform...\n');
    
    // Execute upgrade command
    execSync('npx @alex-programmer/cron upgrade', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
  } catch (error) {
    console.error('❌ Upgrade failed:', error.message);
    process.exit(1);
  }
}

upgrade(); 
