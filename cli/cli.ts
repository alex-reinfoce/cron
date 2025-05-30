#!/usr/bin/env node

import { Command } from 'commander';
import { createProject } from './commands/create';
import { upgradeProject } from './commands/upgrade';

const program = new Command();

program
  .name('cron')
  .description('A universal cron task management platform CLI tool')
  .version('1.0.0');

program
  .command('create')
  .description('Create a new cron task management project')
  .argument('[project-name]', 'Name of the project')
  .option('-t, --template <template>', 'Template to use', 'default')
  .action(createProject);

program
  .command('upgrade')
  .description('Upgrade existing project to latest version')
  .option('-f, --force', 'Force upgrade without confirmation')
  .action(upgradeProject);

program.parse(); 
