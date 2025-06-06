import { describe, it, expect, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';

const CLI_PATH = path.join(__dirname, '../dist/cli.js');
let testDir: string;

describe('Cron CLI', () => {
  beforeEach(async () => {
    try {
      await fs.mkdir(path.join(process.cwd(), 'tmp'));
    } catch {}
    testDir = path.join(process.cwd(), 'tmp');
    await fs.remove(testDir);
    await fs.mkdir(testDir);
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
        cwd: testDir,
      });

      expect(output).toContain('Next steps:');
      expect(output).toContain(`cd ${projectName}`);
      expect(output).toContain('npm install');
      expect(output).toContain('npm run dev');
      expect(output).toContain('npm run upgrade');
    });

    it('should create correct project structure from root directory and build successfully', () => {
      const projectName = 'test-structure';
      execSync(`node ${CLI_PATH} create ${projectName}`, {
        cwd: testDir,
        stdio: 'ignore',
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

      const installOutput = execSync('pnpm install', {
        cwd: projectPath,
      });
      expect(installOutput.toString('utf8')).toContain('done');

      expect(fs.existsSync(path.join(projectPath, '.next'))).toBe(false);
      const buildOutput = execSync(`pnpm run build`, {
        cwd: projectPath,
      });
      const output = buildOutput.toString('utf8');
      expect(output).toContain('prerendered as static content');
      expect(output).toContain('server-rendered on demand');
      expect(fs.existsSync(path.join(projectPath, '.next'))).toBe(true);
    });
  });
});
