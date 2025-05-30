import * as fs from 'fs-extra';
import * as path from 'path';
import inquirer from 'inquirer';
import ora from 'ora';

interface UpgradeOptions {
  force?: boolean;
}

export async function upgradeProject(options: UpgradeOptions = {}) {
  const spinner = ora();
  
  try {
    const currentDir = process.cwd();
    const versionFile = path.join(currentDir, '.cron-version');
    const packageJsonPath = path.join(currentDir, 'package.json');
    
    // Check if this is a cron project
    if (!await fs.pathExists(versionFile)) {
      console.error('Error: This is not a cron project. Run "npx cron create" to create a new project.');
      process.exit(1);
    }
    
    if (!await fs.pathExists(packageJsonPath)) {
      console.error('Error: package.json not found.');
      process.exit(1);
    }
    
    // Read current version
    const currentVersion = await fs.readFile(versionFile, 'utf-8');
    const latestVersion = '1.0.0'; // This should fetch the latest version from npm registry
    
    if (currentVersion.trim() === latestVersion) {
      console.log('✅ Your project is already up to date!');
      return;
    }
    
    // Ask for upgrade confirmation
    if (!options.force) {
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Upgrade from v${currentVersion.trim()} to v${latestVersion}?`,
          default: true
        }
      ]);
      
      if (!answers.confirm) {
        console.log('Upgrade cancelled.');
        return;
      }
    }
    
    spinner.start('Upgrading project...');
    
    // Backup user data
    const backupDir = path.join(currentDir, '.crons-backup');
    await fs.ensureDir(backupDir);
    
    // Backup SQLite database
    const dbFiles = ['cron_tasks.db', 'data/cron_tasks.db'];
    for (const dbFile of dbFiles) {
      const dbPath = path.join(currentDir, dbFile);
      if (await fs.pathExists(dbPath)) {
        // Use full path to avoid filename conflicts
        const backupName = dbFile.replace(/\//g, '_');
        await fs.copy(dbPath, path.join(backupDir, backupName));
      }
    }
    
    // Backup user configuration files (including config directory)
    const configFiles = ['.env', '.env.local', '.env.production'];
    for (const configFile of configFiles) {
      const configPath = path.join(currentDir, configFile);
      if (await fs.pathExists(configPath)) {
        await fs.copy(configPath, path.join(backupDir, configFile));
      }
    }
    
    // Backup user's custom config directory (very important!)
    const configDirPath = path.join(currentDir, 'config');
    if (await fs.pathExists(configDirPath)) {
      await fs.copy(configDirPath, path.join(backupDir, 'config'));
    }
    
    // Get template files
    const templateDir = path.join(__dirname, '../../templates/default');
    
    // Files and directories to update (note: config directory is removed)
    const filesToUpdate = [
      'app',
      'components', 
      'lib',
      'types',
      'scripts',
      'next.config.ts',
      'tsconfig.json',
      'postcss.config.mjs',
      'next-env.d.ts'
    ];
    
    // Update files
    for (const item of filesToUpdate) {
      const sourcePath = path.join(templateDir, item);
      const targetPath = path.join(currentDir, item);
      
      if (await fs.pathExists(sourcePath)) {
        await fs.remove(targetPath);
        await fs.copy(sourcePath, targetPath);
      }
    }
    
    // Handle config directory: only create default config if config directory doesn't exist
    const userConfigPath = path.join(currentDir, 'config');
    const templateConfigPath = path.join(templateDir, 'config');
    
    if (!await fs.pathExists(userConfigPath) && await fs.pathExists(templateConfigPath)) {
      // If user doesn't have config directory, create default config
      await fs.copy(templateConfigPath, userConfigPath);
      console.log('  ℹ️  Created default config directory (first time setup)');
    } else if (await fs.pathExists(userConfigPath)) {
      console.log('  ✅ Preserved existing config directory (user customizations protected)');
    }
    
    // Update package.json dependencies, but preserve user's project name and other custom configurations
    const templatePackageJson = await fs.readJson(path.join(templateDir, 'package.json'));
    const currentPackageJson = await fs.readJson(packageJsonPath);
    
    // Merge dependencies
    currentPackageJson.dependencies = {
      ...currentPackageJson.dependencies,
      ...templatePackageJson.dependencies
    };
    currentPackageJson.devDependencies = {
      ...currentPackageJson.devDependencies,
      ...templatePackageJson.devDependencies
    };
    
    // Update scripts
    currentPackageJson.scripts = {
      ...currentPackageJson.scripts,
      ...templatePackageJson.scripts
    };
    
    // Ensure project-specific configurations are maintained
    delete currentPackageJson.bin;
    delete currentPackageJson.files;
    currentPackageJson.private = true;
    
    await fs.writeJson(packageJsonPath, currentPackageJson, { spaces: 2 });
    
    // Restore user data
    for (const dbFile of dbFiles) {
      const backupName = dbFile.replace(/\//g, '_');
      const backupPath = path.join(backupDir, backupName);
      const targetPath = path.join(currentDir, dbFile);
      if (await fs.pathExists(backupPath)) {
        await fs.ensureDir(path.dirname(targetPath));
        await fs.copy(backupPath, targetPath);
      }
    }
    
    // Restore environment configuration files
    for (const configFile of configFiles) {
      const backupPath = path.join(backupDir, configFile);
      const targetPath = path.join(currentDir, configFile);
      if (await fs.pathExists(backupPath)) {
        await fs.copy(backupPath, targetPath);
      }
    }
    
    // Update version file
    await fs.writeFile(versionFile, latestVersion);
    
    // Clean up backup
    await fs.remove(backupDir);
    
    spinner.succeed('Project upgraded successfully!');
    
    console.log(`\nUpgraded from v${currentVersion.trim()} to v${latestVersion}`);
    console.log('\nNext steps:');
    console.log('  npm install');
    console.log('  npm run dev');
    
  } catch (error) {
    spinner.fail('Failed to upgrade project');
    console.error('Error:', error);
    process.exit(1);
  }
} 
