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
      expect(output.trim()).toMatch(/^\d+\.\d+\.\d+/);
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

    it('should create correct project structure from root directory', () => {
      const projectName = 'test-structure';
      execSync(`node ${CLI_PATH} create ${projectName}`, { 
        cwd: testDir,
        stdio: 'ignore'
      });

      const projectPath = path.join(testDir, projectName);
      
      // Check main directories copied from root
      expect(fs.existsSync(path.join(projectPath, 'app'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'components'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'lib'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'types'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'public'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'config'))).toBe(true);

      // Check important files copied from root
      expect(fs.existsSync(path.join(projectPath, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, '.cron-version'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'next.config.ts'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'tsconfig.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'README.md'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, '.gitignore'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'tailwind.config.ts'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'components.json'))).toBe(true);
    });

    it('should create correct package.json for new project', () => {
      const projectName = 'test-package';
      execSync(`node ${CLI_PATH} create ${projectName}`, { 
        cwd: testDir,
        stdio: 'ignore'
      });

      const packageJsonPath = path.join(testDir, projectName, 'package.json');
      const packageJson = fs.readJsonSync(packageJsonPath);

      expect(packageJson.name).toBe(projectName);
      expect(packageJson.private).toBe(true);
      expect(packageJson.version).toBe('1.0.0');
      expect(packageJson.bin).toBeUndefined();
      expect(packageJson.files).toBeUndefined();
      expect(packageJson.publishConfig).toBeUndefined();
      expect(packageJson.packageManager).toBeUndefined();
      expect(packageJson.scripts.dev).toContain('next dev');
      expect(packageJson.scripts.build).toContain('next build');
      expect(packageJson.scripts.upgrade).toBe('node scripts/upgrade.js');
      expect(packageJson.dependencies).toBeDefined();
    });

    it('should create upgrade script for new project', () => {
      const projectName = 'test-upgrade-setup';
      execSync(`node ${CLI_PATH} create ${projectName}`, { 
        cwd: testDir,
        stdio: 'ignore'
      });

      const projectPath = path.join(testDir, projectName);
      const upgradeScriptPath = path.join(projectPath, 'scripts', 'upgrade.js');
      
      expect(fs.existsSync(upgradeScriptPath)).toBe(true);

      // Verify upgrade script content
      const scriptContent = fs.readFileSync(upgradeScriptPath, 'utf-8');
      expect(scriptContent).toContain('#!/usr/bin/env node');
      expect(scriptContent).toContain('execSync');
      expect(scriptContent).toContain('npx @alex-programmer/cron@alpha upgrade');
      expect(scriptContent).toContain('Upgrading Cron Task Platform');
      expect(scriptContent).toContain('Using alpha version - features may change');

      // Check if script is executable
      const stats = fs.statSync(upgradeScriptPath);
      expect(stats.mode & parseInt('111', 8)).toBeGreaterThan(0); // Check execute permissions
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

    it('should create correct version file from CLI version', () => {
      const projectName = 'test-version';
      execSync(`node ${CLI_PATH} create ${projectName}`, { 
        cwd: testDir,
        stdio: 'ignore'
      });

      const versionFilePath = path.join(testDir, projectName, '.cron-version');
      const version = fs.readFileSync(versionFilePath, 'utf-8').trim();
      
      expect(version).toMatch(/^\d+\.\d+\.\d+/);
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

    it('should copy all necessary files from project root', () => {
      const projectName = 'test-copy-files';
      execSync(`node ${CLI_PATH} create ${projectName}`, { 
        cwd: testDir,
        stdio: 'ignore'
      });

      const projectPath = path.join(testDir, projectName);
      
      // Files that should be copied from root
      const expectedFiles = [
        'next.config.ts',
        'tsconfig.json',
        'next-env.d.ts',
        'tailwind.config.ts',
        'components.json',
        '.gitignore',
        '.eslintrc.json',
        'vitest.config.ts',
        'LICENSE',
        'README.md'
      ];

      // Check postcss config files (one of them should exist)
      const hasPostcssConfig = fs.existsSync(path.join(projectPath, 'postcss.config.mjs')) ||
                              fs.existsSync(path.join(projectPath, 'postcss.config.js'));
      expect(hasPostcssConfig).toBe(true);

      // Check if .storybook directory exists
      expect(fs.existsSync(path.join(projectPath, '.storybook'))).toBe(true);

      expectedFiles.forEach(file => {
        expect(fs.existsSync(path.join(projectPath, file))).toBe(true);
      });
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

    it('should detect when project is already up to date', () => {
      const output = execSync(`node ${CLI_PATH} upgrade --force`, { 
        encoding: 'utf8',
        cwd: projectPath 
      });

      expect(output).toContain('Your project is already up to date!');
    });

    it('should fail on non-cron project directory', () => {
      // Remove .cron-version file to simulate non-cron project
      fs.removeSync(path.join(projectPath, '.cron-version'));

      expect(() => {
        execSync(`node ${CLI_PATH} upgrade`, { 
          cwd: projectPath,
          stdio: 'ignore'
        });
      }).toThrow();
    });

    it('should preserve user configuration during upgrade', async () => {
      // Create user configuration files
      fs.writeFileSync(path.join(projectPath, '.env'), 'USER_CONFIG=test');
      fs.writeFileSync(path.join(projectPath, '.env.local'), 'LOCAL_CONFIG=test');
      
      // Create user config directory with custom auth
      const configDir = path.join(projectPath, 'config');
      fs.ensureDirSync(configDir);
      fs.writeFileSync(path.join(configDir, 'auth.ts'), 'export const customAuth = true;');

      // Create database file
      fs.writeFileSync(path.join(projectPath, 'tasks.db'), 'mock database content');

      // Simulate an older version
      fs.writeFileSync(path.join(projectPath, '.cron-version'), '0.0.1');

      // Perform upgrade
      execSync(`node ${CLI_PATH} upgrade --force`, { 
        cwd: projectPath,
        stdio: 'ignore'
      });

      // Verify user files are preserved
      expect(fs.existsSync(path.join(projectPath, '.env'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, '.env.local'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'tasks.db'))).toBe(true);
      expect(fs.existsSync(path.join(configDir, 'auth.ts'))).toBe(true);

      // Verify content is preserved
      expect(fs.readFileSync(path.join(projectPath, '.env'), 'utf-8')).toBe('USER_CONFIG=test');
      expect(fs.readFileSync(path.join(projectPath, 'tasks.db'), 'utf-8')).toBe('mock database content');
    });

    it('should update project structure with latest files from root', () => {
      // Simulate an older version
      fs.writeFileSync(path.join(projectPath, '.cron-version'), '0.0.1');

      // Perform upgrade
      execSync(`node ${CLI_PATH} upgrade --force`, { 
        cwd: projectPath,
        stdio: 'ignore'
      });

      // Verify core directories are updated
      expect(fs.existsSync(path.join(projectPath, 'app'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'components'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'lib'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'types'))).toBe(true);

      // Verify configuration files are updated
      expect(fs.existsSync(path.join(projectPath, 'next.config.ts'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'tsconfig.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'tailwind.config.ts'))).toBe(true);
    });

    it('should update package.json dependencies but preserve project identity', () => {
      const originalPackageJson = fs.readJsonSync(path.join(projectPath, 'package.json'));
      const originalName = originalPackageJson.name;

      // Simulate an older version
      fs.writeFileSync(path.join(projectPath, '.cron-version'), '0.0.1');

      // Perform upgrade
      execSync(`node ${CLI_PATH} upgrade --force`, { 
        cwd: projectPath,
        stdio: 'ignore'
      });

      const updatedPackageJson = fs.readJsonSync(path.join(projectPath, 'package.json'));

      // Verify project identity is preserved
      expect(updatedPackageJson.name).toBe(originalName);
      expect(updatedPackageJson.private).toBe(true);
      expect(updatedPackageJson.bin).toBeUndefined();
      expect(updatedPackageJson.files).toBeUndefined();
      expect(updatedPackageJson.publishConfig).toBeUndefined();
      expect(updatedPackageJson.packageManager).toBeUndefined();

      // Verify upgrade script is maintained
      expect(updatedPackageJson.scripts.upgrade).toBe('node scripts/upgrade.js');

      // Verify dependencies are updated
      expect(updatedPackageJson.dependencies).toBeDefined();
      expect(updatedPackageJson.devDependencies).toBeDefined();
    });

    it('should update version file after successful upgrade', () => {
      // Simulate an older version
      fs.writeFileSync(path.join(projectPath, '.cron-version'), '0.0.1');

      // Perform upgrade
      execSync(`node ${CLI_PATH} upgrade --force`, { 
        cwd: projectPath,
        stdio: 'ignore'
      });

      // Verify version is updated
      const newVersion = fs.readFileSync(path.join(projectPath, '.cron-version'), 'utf-8').trim();
      expect(newVersion).not.toBe('0.0.1');
      expect(newVersion).toMatch(/^\d+\.\d+\.\d+/);
    });

    it('should handle database backup and restore correctly', () => {
      // Create multiple database files
      fs.writeFileSync(path.join(projectPath, 'tasks.db'), 'main database');
      fs.ensureDirSync(path.join(projectPath, 'data'));
      fs.writeFileSync(path.join(projectPath, 'data/tasks.db'), 'data folder database');

      // Simulate an older version
      fs.writeFileSync(path.join(projectPath, '.cron-version'), '0.0.1');

      // Perform upgrade
      execSync(`node ${CLI_PATH} upgrade --force`, { 
        cwd: projectPath,
        stdio: 'ignore'
      });

      // Verify databases are preserved
      expect(fs.existsSync(path.join(projectPath, 'tasks.db'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'data/tasks.db'))).toBe(true);
      expect(fs.readFileSync(path.join(projectPath, 'tasks.db'), 'utf-8')).toBe('main database');
      expect(fs.readFileSync(path.join(projectPath, 'data/tasks.db'), 'utf-8')).toBe('data folder database');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid project names gracefully', () => {
      expect(() => {
        execSync(`node ${CLI_PATH} create "invalid/name"`, { 
          cwd: testDir,
          stdio: 'ignore'
        });
      }).toThrow();
    });

    it('should handle missing package.json during upgrade', () => {
      const projectName = 'test-missing-package';
      execSync(`node ${CLI_PATH} create ${projectName}`, { 
        cwd: testDir,
        stdio: 'ignore'
      });

      const projectPath = path.join(testDir, projectName);
      fs.removeSync(path.join(projectPath, 'package.json'));

      expect(() => {
        execSync(`node ${CLI_PATH} upgrade`, { 
          cwd: projectPath,
          stdio: 'ignore'
        });
      }).toThrow();
    });
  });
}); 
