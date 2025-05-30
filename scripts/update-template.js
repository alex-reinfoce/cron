#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

async function updateTemplate() {
  console.log('🔄 Updating template files...');
  
  const templateDir = path.join(__dirname, '../templates/default');
  
  // Directories to update
  const dirsToUpdate = ['app', 'components', 'lib', 'types', 'public'];
  
  // Files to update
  const filesToUpdate = [
    'next.config.ts',
    'tsconfig.json', 
    'postcss.config.mjs',
    'next-env.d.ts',
    '.gitignore',
    'LICENSE'
  ];
  
  try {
    // Copy directories
    for (const dir of dirsToUpdate) {
      const sourcePath = path.join(__dirname, '..', dir);
      const targetPath = path.join(templateDir, dir);
      
      if (await fs.pathExists(sourcePath)) {
        await fs.remove(targetPath);
        await fs.copy(sourcePath, targetPath);
        console.log(`✅ Updated ${dir}/`);
      }
    }
    
    // Special handling for config directory: only create if it doesn't exist in template
    const configSourcePath = path.join(__dirname, '..', 'config');
    const configTargetPath = path.join(templateDir, 'config');
    
    if (await fs.pathExists(configSourcePath)) {
      if (!await fs.pathExists(configTargetPath)) {
        // Create config directory if it doesn't exist in template
        await fs.copy(configSourcePath, configTargetPath);
        console.log('✅ Created config/ (first time)');
      } else {
        console.log('⚠️  Skipped config/ (preserving existing configuration)');
      }
    }
    
    // Copy files
    for (const file of filesToUpdate) {
      const sourcePath = path.join(__dirname, '..', file);
      const targetPath = path.join(templateDir, file);
      
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, targetPath);
        console.log(`✅ Updated ${file}`);
      }
    }
    
    console.log('🎉 Template updated successfully!');
    console.log('💡 Note: config/ directory is preserved to protect user authentication settings');
    
  } catch (error) {
    console.error('❌ Failed to update template:', error);
    process.exit(1);
  }
}

updateTemplate(); 
