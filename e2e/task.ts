import type { Page } from '@playwright/test';

export class Task {
  constructor(private readonly page: Page) {}

  async createTask(task: { apiURL: string; name: string }) {
    const page = this.page;
    await page.getByRole('button', { name: 'Create Task' }).click();
    await page.getByRole('textbox', { name: 'Task Name' }).click();
    await page.getByRole('textbox', { name: 'Task Name' }).fill(task.name);
    await page.getByRole('textbox', { name: 'Request URL' }).click();
    await page.getByRole('textbox', { name: 'Request URL' }).fill(task.apiURL);
    await page.getByRole('button', { name: 'Create Task' }).click();
    await page.getByRole('combobox', { name: 'Execution Frequency' }).click();
    await page.locator('.data-\\[state\\=open\\]\\:animate-in').first().click();
    await page.getByRole('combobox', { name: 'Execution Frequency' }).click();
    await page.getByRole('option', { name: 'Every Minute' }).click();
    await page.getByRole('combobox', { name: 'Execution Frequency' }).click();
    await page.getByRole('option', { name: 'Every Second' }).click();
    await page.getByRole('button', { name: 'Create Task' }).click();
  }

  async deleteTask(taskName: string) {
    const page = this.page;
    await page
      .getByRole('row', { name: `${taskName}` })
      .getByRole('button')
      .click();
    await page.getByRole('menuitem', { name: 'Delete Task' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByText('Task deleted successfully').isVisible();
  }
}
