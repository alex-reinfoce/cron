import { expect } from '@playwright/test';
import { test } from './utils';

test.describe('Task CRUD', () => {
  const apiURL = 'http://localhost:5000';

  test('create a task', async ({ page, task }) => {
    const newTask = {
      apiURL,
      name: 'new-test',
    };
    await task.createTask(newTask);
    await page
      .getByRole('row', { name: `${newTask.name}` })
      .getByRole('button')
      .click();
    await page.getByRole('menuitem', { name: 'Test Execute' }).click();
    await page.getByText('Task executed successfully').isVisible();

    const totalTasks = await page.getByTestId('total-tasks').textContent();
    expect(totalTasks).toBe('1');
    const activeTasks = await page.getByTestId('active-tasks').textContent();
    expect(activeTasks).toBe('1');
    const pausedTasks = await page.getByTestId('paused-tasks').textContent();
    expect(pausedTasks).toBe('0');

    await page.locator('[data-slot="badge"]').first().getByText('Active').isVisible();
    await page.getByText(newTask.apiURL).isVisible();
    await page.getByText('Every second').isVisible();
    await page.getByText(newTask.name).isVisible();
    await task.deleteTask(newTask.name);
  });
});
