import { test } from './utils';

test.use({ viewport: { width: 1920, height: 1080 } });

test.describe('Task CRUD', () => {
  test('should create a task and run it successfully', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Task' }).click();
    await page.getByRole('textbox', { name: 'Task Name' }).click();
    await page.getByRole('textbox', { name: 'Task Name' }).fill('Mock Server');
    await page.getByRole('textbox', { name: 'Request URL' }).click();
    await page.getByRole('textbox', { name: 'Request URL' }).fill('http://localhost:5000');
    await page.getByRole('button', { name: 'Create Task' }).click();
    await page.getByRole('combobox', { name: 'Execution Frequency' }).click();
    await page.locator('.data-\\[state\\=open\\]\\:animate-in').first().click();
    await page.getByRole('combobox', { name: 'Execution Frequency' }).click();
    await page.getByRole('option', { name: 'Every Minute' }).click();
    await page.getByRole('combobox', { name: 'Execution Frequency' }).click();
    await page.getByRole('option', { name: 'Every Second' }).click();
    await page.getByRole('button', { name: 'Create Task' }).click();
    await page.getByRole('row', { name: 'Mock Server Business Active' }).getByRole('button').click();
    await page.getByRole('menuitem', { name: 'Test Execute' }).click();
    await page.getByText('Task executed successfully').click();
  });
});
