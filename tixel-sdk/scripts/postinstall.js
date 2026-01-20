#!/usr/bin/env node
/**
 * Post-install script to patch ox library compatibility issues
 */
const fs = require('fs');
const path = require('path');

const oxErrorsPath = path.join(__dirname, '../node_modules/viem/node_modules/ox/core/Errors.ts');

if (fs.existsSync(oxErrorsPath)) {
  let content = fs.readFileSync(oxErrorsPath, 'utf8');
  
  // Fix override keyword
  content = content.replace(/override cause:/g, 'cause:');
  
  // Fix super() call
  content = content.replace(
    /super\(message, options\.cause \? \{ cause: options\.cause \} : undefined\)/g,
    'super(message); if (options.cause) (this as any).cause = options.cause'
  );
  
  fs.writeFileSync(oxErrorsPath, content);
  console.log('✅ Patched ox library for TypeScript compatibility');
} else {
  console.log('⚠️  ox library not found, skipping patch');
}
