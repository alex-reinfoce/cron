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
      console.error('Error: This is not a cron project. Run "npx @alex-programmer/cron create" to create a new project.');
      process.exit(1);
    }
    
    if (!await fs.pathExists(packageJsonPath)) {
      console.error('Error: package.json not found.');
      process.exit(1);
    }
    
    // Read current version and get latest version
    const currentVersion = await fs.readFile(versionFile, 'utf-8');
    
    // Get latest version from CLI package
    const cliSourceDir = path.join(__dirname, '../..');
    const cliPackageJsonPath = path.join(cliSourceDir, 'package.json');
    const cliPackageJson = await fs.readJson(cliPackageJsonPath);
    const latestVersion = cliPackageJson.version;
    
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
    const backupDir = path.join(currentDir, '.cron-backup');
    await fs.ensureDir(backupDir);
    
    // Backup SQLite database files
    const dbFiles = ['tasks.db', 'data/tasks.db', 'cron_tasks.db', 'data/cron_tasks.db'];
    for (const dbFile of dbFiles) {
      const dbPath = path.join(currentDir, dbFile);
      if (await fs.pathExists(dbPath)) {
        const backupName = dbFile.replace(/\//g, '_');
        await fs.copy(dbPath, path.join(backupDir, backupName));
      }
    }
    
    // Backup user configuration files
    const configFiles = ['.env', '.env.local', '.env.production', '.env.development'];
    for (const configFile of configFiles) {
      const configPath = path.join(currentDir, configFile);
      if (await fs.pathExists(configPath)) {
        await fs.copy(configPath, path.join(backupDir, configFile));
      }
    }
    
    // Backup user's custom config directory
    const configDirPath = path.join(currentDir, 'config');
    if (await fs.pathExists(configDirPath)) {
      await fs.copy(configDirPath, path.join(backupDir, 'config'));
    }
    
    // Get source files from CLI package
    const sourceDir = cliSourceDir;
    
    // Files and directories to update
    const itemsToUpdate = [
      'app',
      'components', 
      'lib',
      'types',
      'public',
      'next.config.ts',
      'tsconfig.json',
      'postcss.config.mjs',
      'postcss.config.js',
      'next-env.d.ts',
      'tailwind.config.ts',
      'components.json',
      '.gitignore'
    ];
    
    // Update files and directories
    for (const item of itemsToUpdate) {
      const sourcePath = path.join(sourceDir, item);
      const targetPath = path.join(currentDir, item);
      
      if (await fs.pathExists(sourcePath)) {
        await fs.remove(targetPath);
        await fs.copy(sourcePath, targetPath);
      }
    }
    
    // Handle config directory: only create default config if config directory doesn't exist
    const userConfigPath = path.join(currentDir, 'config');
    const sourceConfigPath = path.join(sourceDir, 'config');
    
    if (!await fs.pathExists(userConfigPath) && await fs.pathExists(sourceConfigPath)) {
      // If user doesn't have config directory, create default config
      await fs.copy(sourceConfigPath, userConfigPath);
      console.log('  ℹ️  Created default config directory (first time setup)');
    } else if (await fs.pathExists(userConfigPath)) {
      console.log('  ✅ Preserved existing config directory (user customizations protected)');
    }
    
    // Update package.json dependencies, but preserve user's project name and other custom configurations
    const sourcePackageJsonPath = path.join(sourceDir, 'package.json');
    const sourcePackageJson = await fs.readJson(sourcePackageJsonPath);
    const currentPackageJson = await fs.readJson(packageJsonPath);
    
    // Merge dependencies
    currentPackageJson.dependencies = {
      ...currentPackageJson.dependencies,
      ...sourcePackageJson.dependencies
    };
    currentPackageJson.devDependencies = {
      ...currentPackageJson.devDependencies,
      ...sourcePackageJson.devDependencies
    };
    
    // Update scripts
    currentPackageJson.scripts = {
      ...currentPackageJson.scripts,
      ...sourcePackageJson.scripts
    };
    
    // Ensure project-specific configurations are maintained
    delete currentPackageJson.bin;
    delete currentPackageJson.files;
    delete currentPackageJson.publishConfig;
    delete currentPackageJson.packageManager;
    currentPackageJson.private = true;
    currentPackageJson.scripts.upgrade = 'node scripts/upgrade.js';
    
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
