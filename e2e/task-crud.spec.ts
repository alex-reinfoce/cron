import { expect } from '@playwright/test';
import { test } from './utils';

test.describe('Task CRUD', () => {
  const apiURL = 'http://localhost:5000';

  test('create a business task', async ({ page, task }) => {
    const newTask = {
      apiURL,
      name: 'new-test',
    };
    await task.createTask(newTask);
    await page
      .getByRole('row', { name: `${newTask.name} Business Active` })
      .getByRole('button')
      .click();
    await page.getByRole('menuitem', { name: 'Test Execute' }).click();
    await page.getByText('Task executed successfully').isVisible();
    await page
      .getByTestId('total-tasks')
      .textContent()
      .then((text) => {
        expect(text).toBe('1');
      });
    await page
      .getByTestId('active-tasks')
      .textContent()
      .then((text) => {
        expect(text).toBe('1');
      });
    await page
      .getByTestId('paused-tasks')
      .textContent()
      .then((text) => {
        expect(text).toBe('0');
      });
    await page
      .getByTestId('business-tasks')
      .textContent()
      .then((text) => {
        expect(text).toBe('1');
      });
    await page.locator('[data-slot="badge"]').first().getByText('Active').isVisible();
    await page.locator('[data-slot="badge"]').first().getByText('Business').isVisible();
    await page.getByText(newTask.apiURL).isVisible();
    await page.getByText('Every second').isVisible();
    await page.getByText(newTask.name).isVisible();
    await task.deleteTask(newTask.name);
  });
});
