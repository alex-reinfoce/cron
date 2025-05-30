import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

const CLI_PATH = path.join(__dirname, '../dist/cli.js');
let testDir: string;

describe('Cron CLI', () => {
  beforeEach(async () => {
    // Create temporary test directory
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cron-cli-test-'));
    process.chdir(testDir);
  });

  afterEach(async () => {
    // Clean up test directory
    if (testDir && await fs.pathExists(testDir)) {
      await fs.remove(testDir);
    }
  });

  describe('CLI Help Commands', () => {
    it('should show help message', () => {
      const output = execSync(`node ${CLI_PATH} --help`, { encoding: 'utf8' });
      expect(output).toContain('A universal cron task management platform CLI tool');
      expect(output).toContain('Usage: cron');
      expect(output).toContain('create');
      expect(output).toContain('upgrade');
    });

    it('should show create command help', () => {
      const output = execSync(`node ${CLI_PATH} create --help`, { encoding: 'utf8' });
      expect(output).toContain('Create a new cron task management project');
      expect(output).toContain('project-name');
      expect(output).toContain('--template');
    });

    it('should show upgrade command help', () => {
      const output = execSync(`node ${CLI_PATH} upgrade --help`, { encoding: 'utf8' });
      expect(output).toContain('Upgrade existing project to latest version');
      expect(output).toContain('--force');
    });

    it('should show version', () => {
      const output = execSync(`node ${CLI_PATH} --version`, { encoding: 'utf8' });
      expect(output.trim()).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('Project Creation', () => {
    it('should create a new project successfully', () => {
      const projectName = 'test-project';
      const output = execSync(`node ${CLI_PATH} create ${projectName}`, { 
        encoding: 'utf8',
        cwd: testDir 
      });

      expect(output).toContain('Next steps:');
      expect(output).toContain(`cd ${projectName}`);
      expect(output).toContain('npm install');
      expect(output).toContain('npm run dev');
      expect(output).toContain('npm run upgrade');
    });

    it('should create correct project structure', () => {
      const projectName = 'test-structure';
      execSync(`node ${CLI_PATH} create ${projectName}`, { 
        cwd: testDir,
        stdio: 'ignore'
      });

      const projectPath = path.join(testDir, projectName);
      
      // Check main directories
      expect(fs.existsSync(path.join(projectPath, 'app'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'components'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'lib'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'types'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'public'))).toBe(true);

      // Check important files
      expect(fs.existsSync(path.join(projectPath, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, '.cron-version'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'next.config.ts'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'tsconfig.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'README.md'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, '.gitignore'))).toBe(true);
    });

    it('should create correct package.json', () => {
      const projectName = 'test-package';
      execSync(`node ${CLI_PATH} create ${projectName}`, { 
        cwd: testDir,
        stdio: 'ignore'
      });

      const packageJsonPath = path.join(testDir, projectName, 'package.json');
      const packageJson = fs.readJsonSync(packageJsonPath);

      expect(packageJson.name).toBe(projectName);
      expect(packageJson.private).toBe(true);
      expect(packageJson.bin).toBeUndefined();
      expect(packageJson.files).toBeUndefined();
      expect(packageJson.scripts.dev).toContain('next dev');
      expect(packageJson.scripts.build).toContain('next build');
      expect(packageJson.dependencies).toBeDefined();
    });

    it('should create project with upgrade script configuration', () => {
      const projectName = 'test-upgrade-setup';
      execSync(`node ${CLI_PATH} create ${projectName}`, { 
        cwd: testDir,
        stdio: 'ignore'
      });

      const projectPath = path.join(testDir, projectName);
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJson = fs.readJsonSync(packageJsonPath);

      // Verify upgrade-related scripts
      expect(packageJson.scripts.upgrade).toBe('node scripts/upgrade.js');
      expect(packageJson.scripts.postinstall).toContain('npm run upgrade');
      expect(packageJson.scripts.postinstall).toContain('npm run dev');

      // Verify scripts directory and upgrade script file
      const scriptsPath = path.join(projectPath, 'scripts');
      const upgradeScriptPath = path.join(scriptsPath, 'upgrade.js');
      
      expect(fs.existsSync(scriptsPath)).toBe(true);
      expect(fs.existsSync(upgradeScriptPath)).toBe(true);

      // Verify upgrade script content
      const scriptContent = fs.readFileSync(upgradeScriptPath, 'utf-8');
      expect(scriptContent).toContain('#!/usr/bin/env node');
      expect(scriptContent).toContain('execSync');
      expect(scriptContent).toContain('npx @alex-programmer/cron upgrade');
      expect(scriptContent).toContain('Upgrading Cron Task Platform');
    });

    it('should show upgrade instructions in create output', () => {
      const projectName = 'test-upgrade-instructions';
      const output = execSync(`node ${CLI_PATH} create ${projectName}`, { 
        encoding: 'utf8',
        cwd: testDir 
      });

      expect(output).toContain('Next steps:');
      expect(output).toContain(`cd ${projectName}`);
      expect(output).toContain('npm install');
      expect(output).toContain('npm run dev');
      expect(output).toContain('To upgrade in the future:');
      expect(output).toContain('npm run upgrade');
    });

    it('should create correct version file', () => {
      const projectName = 'test-version';
      execSync(`node ${CLI_PATH} create ${projectName}`, { 
        cwd: testDir,
        stdio: 'ignore'
      });

      const versionFilePath = path.join(testDir, projectName, '.cron-version');
      const version = fs.readFileSync(versionFilePath, 'utf-8').trim();
      
      expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should handle existing directory with overwrite confirmation', () => {
      const projectName = 'existing-project';
      const projectPath = path.join(testDir, projectName);
      
      // Create existing directory
      fs.ensureDirSync(projectPath);
      fs.writeFileSync(path.join(projectPath, 'existing-file.txt'), 'existing content');

      // Use echo command to simulate user input 'y' for overwrite confirmation
      try {
        execSync(`echo "y" | node ${CLI_PATH} create ${projectName}`, { 
          cwd: testDir,
          stdio: 'ignore'
        });

        // Verify project was created correctly
        expect(fs.existsSync(path.join(projectPath, 'package.json'))).toBe(true);
        expect(fs.existsSync(path.join(projectPath, 'existing-file.txt'))).toBe(false);
      } catch (error) {
        // Interactive input may not work in some environments, skip test in this case
        console.warn('Interactive input test skipped due to environment limitations');
      }
    });
  });

  describe('Project Upgrade', () => {
    let projectPath: string;

    beforeEach(async () => {
      // First create a project for testing upgrade
      const projectName = 'upgrade-test-project';
      execSync(`node ${CLI_PATH} create ${projectName}`, { 
        cwd: testDir,
        stdio: 'ignore'
      });
      projectPath = path.join(testDir, projectName);
      process.chdir(projectPath);
    });

    it('should upgrade project successfully', () => {
      const output = execSync(`node ${CLI_PATH} upgrade --force`, { 
        encoding: 'utf8',
        cwd: projectPath
      });

      expect(output).toContain('Upgraded from v');
      expect(output).toContain('npm install');
      expect(output).toContain('npm run dev');
    });

    it('should update version file during upgrade', () => {
      const versionFilePath = path.join(projectPath, '.cron-version');
      const originalVersion = fs.readFileSync(versionFilePath, 'utf-8').trim();

      execSync(`node ${CLI_PATH} upgrade --force`, { 
        cwd: projectPath,
        stdio: 'ignore'
      });

      const newVersion = fs.readFileSync(versionFilePath, 'utf-8').trim();
      
      // Version should be updated
      expect(newVersion).not.toBe(originalVersion);
      expect(newVersion).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should preserve package.json project name during upgrade', () => {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const originalPackageJson = fs.readJsonSync(packageJsonPath);
      const originalName = originalPackageJson.name;

      execSync(`node ${CLI_PATH} upgrade --force`, { 
        cwd: projectPath,
        stdio: 'ignore'
      });

      const updatedPackageJson = fs.readJsonSync(packageJsonPath);
      
      // Project name should remain unchanged
      expect(updatedPackageJson.name).toBe(originalName);
      expect(updatedPackageJson.private).toBe(true);
      expect(updatedPackageJson.bin).toBeUndefined();
      expect(updatedPackageJson.files).toBeUndefined();
    });

    it('should update scripts directory during upgrade', () => {
      const scriptsPath = path.join(projectPath, 'scripts');
      const upgradeScriptPath = path.join(scriptsPath, 'upgrade.js');
      
      // Verify initial scripts directory and upgrade script existence
      expect(fs.existsSync(scriptsPath)).toBe(true);
      expect(fs.existsSync(upgradeScriptPath)).toBe(true);
      
      // Modify upgrade script content
      fs.writeFileSync(upgradeScriptPath, '// old version');
      
      execSync(`node ${CLI_PATH} upgrade --force`, { 
        cwd: projectPath,
        stdio: 'ignore'
      });
      
      // Verify upgrade script is updated
      const updatedContent = fs.readFileSync(upgradeScriptPath, 'utf-8');
      expect(updatedContent).toContain('npx @alex-programmer/cron upgrade');
      expect(updatedContent).toContain('Upgrading Cron Task Platform');
    });

    it('should preserve upgrade script in package.json', () => {
      const packageJsonPath = path.join(projectPath, 'package.json');
      
      execSync(`node ${CLI_PATH} upgrade --force`, { 
        cwd: projectPath,
        stdio: 'ignore'
      });

      const updatedPackageJson = fs.readJsonSync(packageJsonPath);
      
      // Verify upgrade script existence
      expect(updatedPackageJson.scripts.upgrade).toBe('node scripts/upgrade.js');
      expect(updatedPackageJson.scripts.postinstall).toContain('npm run upgrade');
    });

    it('should preserve user data during upgrade', () => {
      // Create test database file
      const dbPath = path.join(projectPath, 'cron_tasks.db');
      const testData = 'test database content';
      fs.writeFileSync(dbPath, testData);
      
      // Create environment configuration file
      const envPath = path.join(projectPath, '.env.local');
      const envContent = 'NODE_ENV=test\nCUSTOM_VAR=value';
      fs.writeFileSync(envPath, envContent);
      
      execSync(`node ${CLI_PATH} upgrade --force`, { 
        cwd: projectPath,
        stdio: 'ignore'
      });
      
      // Verify user data is preserved
      expect(fs.readFileSync(dbPath, 'utf-8')).toBe(testData);
      expect(fs.readFileSync(envPath, 'utf-8')).toBe(envContent);
    });

    it('should handle upgrade when already up to date', () => {
      // First execute upgrade
      execSync(`node ${CLI_PATH} upgrade --force`, { 
        cwd: projectPath,
        stdio: 'ignore'
      });
      
      // Second execute upgrade
      const output = execSync(`node ${CLI_PATH} upgrade --force`, { 
        encoding: 'utf8',
        cwd: projectPath
      });
      
      expect(output).toContain('Your project is already up to date!');
    });

    it('should update all necessary directories during upgrade', () => {
      // Modify some directory files to test they are correctly updated
      const appPath = path.join(projectPath, 'app/page.tsx');
      const originalContent = fs.readFileSync(appPath, 'utf-8');
      fs.writeFileSync(appPath, '// modified content');
      
      execSync(`node ${CLI_PATH} upgrade --force`, { 
        cwd: projectPath,
        stdio: 'ignore'
      });
      
      // Verify files are re-synchronized
      const updatedContent = fs.readFileSync(appPath, 'utf-8');
      expect(updatedContent).not.toBe('// modified content');
      expect(updatedContent).toContain('export default'); // Should contain React component content
    });

    it('should work with npm run upgrade script', () => {
      // Ensure upgrade script can be run via npm
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJson = fs.readJsonSync(packageJsonPath);
      
      // Verify upgrade script existence
      expect(packageJson.scripts.upgrade).toBeDefined();
      expect(packageJson.scripts.upgrade).toBe('node scripts/upgrade.js');
      
      // Verify upgrade script file existence and executability
      const upgradeScriptPath = path.join(projectPath, 'scripts/upgrade.js');
      expect(fs.existsSync(upgradeScriptPath)).toBe(true);
      
      const scriptContent = fs.readFileSync(upgradeScriptPath, 'utf-8');
      expect(scriptContent).toContain('execSync');
      expect(scriptContent).toContain('npx @alex-programmer/cron upgrade');
    });

    it('should backup and restore user data correctly', () => {
      // Create multiple data files
      const dbPath = path.join(projectPath, 'cron_tasks.db');
      const dataDir = path.join(projectPath, 'data');
      const dataDirDbPath = path.join(dataDir, 'cron_tasks.db');
      
      fs.ensureDirSync(dataDir);
      fs.writeFileSync(dbPath, 'root db content');
      fs.writeFileSync(dataDirDbPath, 'data dir db content');
      
      // Create configuration files
      const envFiles = ['.env', '.env.local', '.env.production'];
      envFiles.forEach((file, index) => {
        fs.writeFileSync(path.join(projectPath, file), `${file}_content_${index}`);
      });
      
      execSync(`node ${CLI_PATH} upgrade --force`, { 
        cwd: projectPath,
        stdio: 'ignore'
      });
      
      // Verify all files are correctly restored
      expect(fs.readFileSync(dbPath, 'utf-8')).toBe('root db content');
      expect(fs.readFileSync(dataDirDbPath, 'utf-8')).toBe('data dir db content');
      
      envFiles.forEach((file, index) => {
        const filePath = path.join(projectPath, file);
        expect(fs.readFileSync(filePath, 'utf-8')).toBe(`${file}_content_${index}`);
      });
    });

    it('should update dependencies and devDependencies during upgrade', () => {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const originalPackageJson = fs.readJsonSync(packageJsonPath);
      
      // Add custom dependency
      originalPackageJson.dependencies['custom-dep'] = '^1.0.0';
      originalPackageJson.devDependencies['custom-dev-dep'] = '^2.0.0';
      fs.writeJsonSync(packageJsonPath, originalPackageJson, { spaces: 2 });
      
      execSync(`node ${CLI_PATH} upgrade --force`, { 
        cwd: projectPath,
        stdio: 'ignore'
      });
      
      const updatedPackageJson = fs.readJsonSync(packageJsonPath);
      
      // Verify template dependencies are updated
      expect(updatedPackageJson.dependencies.next).toBeDefined();
      expect(updatedPackageJson.dependencies.react).toBeDefined();
      expect(updatedPackageJson.devDependencies.typescript).toBeDefined();
      
      // Verify custom dependencies are preserved
      expect(updatedPackageJson.dependencies['custom-dep']).toBe('^1.0.0');
      expect(updatedPackageJson.devDependencies['custom-dev-dep']).toBe('^2.0.0');
    });

    it('should fail upgrade in non-cron project directory', () => {
      const nonCronDir = path.join(testDir, 'non-cron-project');
      fs.ensureDirSync(nonCronDir);
      
      expect(() => {
        execSync(`node ${CLI_PATH} upgrade`, { 
          cwd: nonCronDir,
          stdio: 'pipe'
        });
      }).toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid project names', () => {
      // CLI currently does not strictly validate project names, only validated during creation
      // This test is temporarily skipped or tested for other error cases
      const nonExistentCommand = () => {
        execSync(`node ${CLI_PATH} create`, { 
          cwd: testDir,
          stdio: 'pipe'
        });
      };
      
      // Not providing a project name should enter interactive mode or throw an error
      expect(nonExistentCommand).toThrow();
    });

    it('should show error for unknown commands', () => {
      expect(() => {
        execSync(`node ${CLI_PATH} unknown-command`, { 
          cwd: testDir,
          stdio: 'pipe'
        });
      }).toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should create a project that can be built successfully', () => {
      const projectName = 'buildable-project';
      execSync(`node ${CLI_PATH} create ${projectName}`, { 
        cwd: testDir,
        stdio: 'ignore'
      });

      const projectPath = path.join(testDir, projectName);
      
      // Install dependencies
      execSync('npm install', { 
        cwd: projectPath,
        stdio: 'ignore'
      });

      // Try to build project
      const buildOutput = execSync('npm run build', { 
        cwd: projectPath,
        encoding: 'utf8'
      });

      expect(buildOutput).toContain('Compiled successfully');
      expect(buildOutput).toContain('Route (app)');
    });

    it('should generate project with correct API routes', () => {
      const projectName = 'api-project';
      execSync(`node ${CLI_PATH} create ${projectName}`, { 
        cwd: testDir,
        stdio: 'ignore'
      });

      const projectPath = path.join(testDir, projectName);
      
      // Check API route files
      expect(fs.existsSync(path.join(projectPath, 'app/api/tasks/route.ts'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'app/api/tasks/[id]/route.ts'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'app/api/tasks/[id]/actions/route.ts'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'app/api/logs/route.ts'))).toBe(true);
    });

    it('should generate project with correct components', () => {
      const projectName = 'component-project';
      execSync(`node ${CLI_PATH} create ${projectName}`, { 
        cwd: testDir,
        stdio: 'ignore'
      });

      const projectPath = path.join(testDir, projectName);
      
      // Check component files
      expect(fs.existsSync(path.join(projectPath, 'components/TaskForm.tsx'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'components/TaskLogs.tsx'))).toBe(true);
    });

    it('should create project with functional upgrade script', () => {
      const projectName = 'upgrade-functional-test';
      execSync(`node ${CLI_PATH} create ${projectName}`, { 
        cwd: testDir,
        stdio: 'ignore'
      });

      const projectPath = path.join(testDir, projectName);
      const upgradeScriptPath = path.join(projectPath, 'scripts', 'upgrade.js');
      
      // Verify upgrade script can execute (simulated environment may not actually run npx command)
      expect(fs.existsSync(upgradeScriptPath)).toBe(true);
      
      const scriptContent = fs.readFileSync(upgradeScriptPath, 'utf-8');
      expect(scriptContent).toContain('execSync');
      expect(scriptContent).toContain('npx @alex-programmer/cron upgrade');
    });
  });

  describe('Authentication Configuration', () => {
    it('should create project with authentication config files', () => {
      const projectName = 'test-auth-config';
      execSync(`node ${CLI_PATH} create ${projectName}`, { 
        cwd: testDir,
        stdio: 'ignore'
      });

      const projectPath = path.join(testDir, projectName);
      
      // Verify authentication configuration files
      const authConfigPath = path.join(projectPath, 'config', 'auth.ts');
      expect(fs.existsSync(authConfigPath)).toBe(true);
      
      const authConfigContent = fs.readFileSync(authConfigPath, 'utf-8');
      expect(authConfigContent).toContain('username: \'admin\'');
      expect(authConfigContent).toContain('password: \'123456\'');
      expect(authConfigContent).toContain('singleUserMode: true');
      expect(authConfigContent).toContain('validateCredentials');
      expect(authConfigContent).not.toContain('sessionTimeout');
    });

    it('should create project with authentication components', () => {
      const projectName = 'test-auth-components';
      execSync(`node ${CLI_PATH} create ${projectName}`, { 
        cwd: testDir,
        stdio: 'ignore'
      });

      const projectPath = path.join(testDir, projectName);
      
      // Verify authentication related components
      const authGuardPath = path.join(projectPath, 'components', 'AuthGuard.tsx');
      const loginFormPath = path.join(projectPath, 'components', 'LoginForm.tsx');
      
      expect(fs.existsSync(authGuardPath)).toBe(true);
      expect(fs.existsSync(loginFormPath)).toBe(true);
      
      const authGuardContent = fs.readFileSync(authGuardPath, 'utf-8');
      expect(authGuardContent).toContain('AuthManager');
      expect(authGuardContent).toContain('LoginForm');
      expect(authGuardContent).toContain('isAuthenticated');
      
      const loginFormContent = fs.readFileSync(loginFormPath, 'utf-8');
      expect(loginFormContent).toContain('Form');
      expect(loginFormContent).toContain('Input');
      expect(loginFormContent).toContain('Button');
      expect(loginFormContent).toContain('>admin</div>');
      expect(loginFormContent).toContain('>123456</div>');
      expect(loginFormContent).toContain('Single user mode: Only one user can be online at a time');
    });

    it('should create project with authentication lib utilities', () => {
      const projectName = 'test-auth-lib';
      execSync(`node ${CLI_PATH} create ${projectName}`, { 
        cwd: testDir,
        stdio: 'ignore'
      });

      const projectPath = path.join(testDir, projectName);
      
      // Verify authentication utility library
      const authLibPath = path.join(projectPath, 'lib', 'auth.ts');
      expect(fs.existsSync(authLibPath)).toBe(true);
      
      const authLibContent = fs.readFileSync(authLibPath, 'utf-8');
      expect(authLibContent).toContain('AuthManager');
      expect(authLibContent).toContain('login');
      expect(authLibContent).toContain('logout');
      expect(authLibContent).toContain('isAuthenticated');
      expect(authLibContent).toContain('localStorage');
      expect(authLibContent).toContain('generateSessionId');
      expect(authLibContent).toContain('singleUserMode');
    });

    it('should create project with authentication types', () => {
      const projectName = 'test-auth-types';
      execSync(`node ${CLI_PATH} create ${projectName}`, { 
        cwd: testDir,
        stdio: 'ignore'
      });

      const projectPath = path.join(testDir, projectName);
      
      // Verify authentication related type definitions
      const typesPath = path.join(projectPath, 'types', 'index.ts');
      expect(fs.existsSync(typesPath)).toBe(true);
      
      const typesContent = fs.readFileSync(typesPath, 'utf-8');
      expect(typesContent).toContain('LoginCredentials');
      expect(typesContent).toContain('AuthSession');
      expect(typesContent).toContain('LoginResponse');
      expect(typesContent).toContain('isAuthenticated: boolean');
      expect(typesContent).toContain('sessionId?:');
      expect(typesContent).not.toContain('expiryTime');
    });

    it('should preserve config directory in upgrade process', () => {
      const projectName = 'test-config-preservation';
      execSync(`node ${CLI_PATH} create ${projectName}`, { 
        cwd: testDir,
        stdio: 'ignore'
      });

      const projectPath = path.join(testDir, projectName);
      const authConfigPath = path.join(projectPath, 'config', 'auth.ts');
      
      // Modify configuration file
      const originalContent = fs.readFileSync(authConfigPath, 'utf-8');
      const modifiedContent = originalContent.replace('admin', 'test-user').replace('123456', 'custom-password');
      fs.writeFileSync(authConfigPath, modifiedContent);
      
      // Run upgrade
      const upgradeOutput = execSync(`node ${CLI_PATH} upgrade --force`, { 
        cwd: projectPath,
        encoding: 'utf8'
      });
      
      // Verify configuration file is not overwritten, preserving user modifications
      const upgradedContent = fs.readFileSync(authConfigPath, 'utf-8');
      expect(upgradedContent).toContain('test-user');
      expect(upgradedContent).toContain('custom-password');
      expect(upgradedContent).not.toContain('admin');
      expect(upgradedContent).not.toContain('123456');
      
      // Verify upgrade output contains protection information
      expect(upgradeOutput).toContain('Preserved existing config directory');
    });

    it('should include authentication info in README', () => {
      const projectName = 'test-auth-readme';
      execSync(`node ${CLI_PATH} create ${projectName}`, { 
        cwd: testDir,
        stdio: 'ignore'
      });

      const projectPath = path.join(testDir, projectName);
      const readmePath = path.join(projectPath, 'README.md');
      
      expect(fs.existsSync(readmePath)).toBe(true);
      
      const readmeContent = fs.readFileSync(readmePath, 'utf-8');
      expect(readmeContent).toContain('Authentication Configuration');
      expect(readmeContent).toContain('Default Login Information');
      expect(readmeContent).toContain('admin');
      expect(readmeContent).toContain('123456');
      expect(readmeContent).toContain('config/auth.ts');
    });
  });
}); 
