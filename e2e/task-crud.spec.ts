import { test } from './utils';

test.use({ viewport: { width: 1920, height: 1080 } });

test.describe('Task CRUD', () => {
  test('create a business task', async ({ page }) => {
    const newTask = {
      apiURL: 'http://localhost:5000',
      name: 'Mock Server',
    };

    await page.getByRole('button', { name: 'Create Task' }).click();
    await page.getByRole('textbox', { name: 'Task Name' }).click();
    await page.getByRole('textbox', { name: 'Task Name' }).fill(newTask.name);
    await page.getByRole('textbox', { name: 'Request URL' }).click();
    await page.getByRole('textbox', { name: 'Request URL' }).fill(newTask.apiURL);
    await page.getByRole('button', { name: 'Create Task' }).click();
    await page.getByRole('combobox', { name: 'Execution Frequency' }).click();
    await page.locator('.data-\\[state\\=open\\]\\:animate-in').first().click();
    await page.getByRole('combobox', { name: 'Execution Frequency' }).click();
    await page.getByRole('option', { name: 'Every Minute' }).click();
    await page.getByRole('combobox', { name: 'Execution Frequency' }).click();
    await page.getByRole('option', { name: 'Every Second' }).click();
    await page.getByRole('button', { name: 'Create Task' }).click();
    await page
      .getByRole('row', { name: `${newTask.name} Business Active` })
      .getByRole('button')
      .click();
    await page.getByRole('menuitem', { name: 'Test Execute' }).click();
    await page.getByText('Task executed successfully').isVisible();
    await page.locator('[data-slot="badge"]').first().getByText('Active').isVisible();
    await page.locator('[data-slot="badge"]').first().getByText('Business').isVisible();
    await page.getByText(newTask.apiURL).isVisible();
    await page.getByText('Every second').isVisible();
    await page.getByText(newTask.name).isVisible();
  });
});
