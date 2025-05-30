import * as fs from 'fs-extra';
import * as path from 'path';
import inquirer from 'inquirer';
import ora from 'ora';
import { execSync } from 'child_process';

interface CreateOptions {
  template?: string;
}

export async function createProject(projectName?: string, options: CreateOptions = {}) {
  const spinner = ora();
  
  try {
    // If no project name is provided, ask the user
    if (!projectName) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is your project name?',
          default: 'my-cron-project',
          validate: (input: string) => {
            if (!input.trim()) {
              return 'Project name is required';
            }
            if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
              return 'Project name can only contain letters, numbers, hyphens, and underscores';
            }
            return true;
          }
        }
      ]);
      projectName = answers.projectName;
    }

    // Ensure projectName is not undefined
    if (!projectName) {
      console.error('Project name is required');
      process.exit(1);
    }

    // Validate project name
    if (!/^[a-zA-Z0-9-_]+$/.test(projectName)) {
      console.error('Project name can only contain letters, numbers, hyphens, and underscores');
      process.exit(1);
    }

    const targetDir = path.resolve(process.cwd(), projectName);
    
    // Check if directory already exists
    if (await fs.pathExists(targetDir)) {
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `Directory ${projectName} already exists. Overwrite?`,
          default: false
        }
      ]);
      
      if (!answers.overwrite) {
        console.log('Operation cancelled.');
        return;
      }
      
      await fs.remove(targetDir);
    }

    spinner.start('Creating project...');
    
    // Create project directory
    await fs.ensureDir(targetDir);
    
    // Get the source directory (project root)
    const sourceDir = path.join(__dirname, '../..');
    
    // Files and directories to copy from project root
    const itemsToCopy = [
      'app',
      'components',
      'lib', 
      'types',
      'public',
      'config',
      'scripts',
      'next.config.ts',
      'tsconfig.json',
      'postcss.config.mjs',
      'postcss.config.js',
      'next-env.d.ts',
      'tailwind.config.ts',
      'components.json',
      '.gitignore',
      'LICENSE',
      'README.md'
    ];
    
    // Copy each item if it exists
    for (const item of itemsToCopy) {
      const sourcePath = path.join(sourceDir, item);
      const targetPath = path.join(targetDir, item);
      
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, targetPath);
      }
    }
    
    // Handle package.json specially - copy and modify
    const sourcePackageJsonPath = path.join(sourceDir, 'package.json');
    const targetPackageJsonPath = path.join(targetDir, 'package.json');
    
    if (await fs.pathExists(sourcePackageJsonPath)) {
      const packageJson = await fs.readJson(sourcePackageJsonPath);
      
      // Modify package.json for the new project
      packageJson.name = projectName;
      packageJson.private = true;
      packageJson.version = '1.0.0';
      
      // Remove CLI-specific fields
      delete packageJson.bin;
      delete packageJson.files;
      delete packageJson.publishConfig;
      delete packageJson.packageManager;
      
      // Ensure project has necessary scripts
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.dev = packageJson.scripts.dev || 'next dev --turbopack';
      packageJson.scripts.build = packageJson.scripts.build || 'next build';
      packageJson.scripts.start = packageJson.scripts.start || 'next start';
      packageJson.scripts.upgrade = 'node scripts/upgrade.js';
      
      await fs.writeJson(targetPackageJsonPath, packageJson, { spaces: 2 });
    }
    
    // Create .cron-version file to record version
    const sourcePackageJson = await fs.readJson(sourcePackageJsonPath);
    const versionFile = path.join(targetDir, '.cron-version');
    await fs.writeFile(versionFile, sourcePackageJson.version || '1.0.0');
    
    // Create upgrade script for the new project
    const upgradeScriptPath = path.join(targetDir, 'scripts', 'upgrade.js');
    await fs.ensureDir(path.dirname(upgradeScriptPath));
    
    const upgradeScriptContent = `#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔄 Upgrading Cron Task Platform...');
console.log('This will update your project to the latest version while preserving your data and configurations.');

try {
  execSync('npx @alex-programmer/cron upgrade', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
} catch (error) {
  console.error('❌ Upgrade failed:', error.message);
  process.exit(1);
}
`;

    await fs.writeFile(upgradeScriptPath, upgradeScriptContent);
    await fs.chmod(upgradeScriptPath, '755');
    
    spinner.succeed('Project created successfully!');
    
    console.log(`\nNext steps:`);
    console.log(`  cd ${projectName}`);
    console.log(`  npm install`);
    console.log(`  npm run dev`);
    console.log(`\nTo upgrade in the future:`);
    console.log(`  npm run upgrade`);
    
  } catch (error) {
    spinner.fail('Failed to create project');
    console.error('Error:', error);
    process.exit(1);
  }
} 
