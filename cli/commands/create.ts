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
    
    // Copy template files
    const templateDir = path.join(__dirname, '../../templates/default');
    await fs.copy(templateDir, targetDir);
    
    // Update project name in package.json
    const packageJsonPath = path.join(targetDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = projectName;
    packageJson.private = true;
    delete packageJson.bin;
    delete packageJson.files;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    
    // Create .cron-version file to record version
    const versionFile = path.join(targetDir, '.cron-version');
    await fs.writeFile(versionFile, packageJson.version);
    
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
