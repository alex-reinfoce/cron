import { test as base } from '@playwright/test';
import { Task } from './task';

interface TestExtend {
  forEachTest: void;
  task: Task;
}

export const test = base.extend<TestExtend>({
  forEachTest: [
    async ({ page }, use) => {
      await page.goto('/');
      await page.getByRole('textbox', { name: 'Enter your username' }).click();
      await page.getByRole('textbox', { name: 'Enter your username' }).fill('admin');
      await page.getByRole('textbox', { name: 'Enter your username' }).press('Tab');
      await page.getByRole('textbox', { name: 'Enter your password' }).fill('123456');
      await page.getByRole('button', { name: 'Sign In' }).click();
      await page.getByText('Session never expires').click();
      await use();
    },
    { auto: true },
  ],
  task: async ({ page }, use) => {
    await use(new Task(page));
  },
});
