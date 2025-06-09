import { NextRequest, NextResponse } from 'next/server';
import database from '../../../../lib/database';
import cronManager from '../../../../lib/cronManager';
import { Task } from '../../../../types';

// Update task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const taskId = parseInt(id);
    const body = await request.json();
    const { name, url, method, headers, body: requestBody, cron_expression, status } = body;

    await database.initialize();
    const db = database.getDb();

    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    return new Promise<NextResponse>((resolve) => {
      // First get the current task
      db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, currentTask: any) => {
        if (err) {
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }

        if (!currentTask) {
          resolve(NextResponse.json({ error: 'Task not found' }, { status: 404 }));
          return;
        }

        // Stop current task
        cronManager.stopTask(taskId);

        // Update task in database
        db.run(
          `UPDATE tasks SET name = ?, url = ?, method = ?, headers = ?, body = ?, 
         cron_expression = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
          [
            name || currentTask.name,
            url || currentTask.url,
            method || currentTask.method,
            JSON.stringify(headers || JSON.parse(currentTask.headers || '{}')),
            requestBody !== undefined ? requestBody : currentTask.body,
            cron_expression || currentTask.cron_expression,
            status || currentTask.status,
            taskId,
          ],
          function (updateErr) {
            if (updateErr) {
              resolve(NextResponse.json({ error: updateErr.message }, { status: 500 }));
            } else {
              // Restart task (if active status)
              if ((status || currentTask.status) === 'active') {
                const updatedTask: Task = {
                  id: taskId,
                  name: name || currentTask.name,
                  url: url || currentTask.url,
                  method: method || currentTask.method,
                  headers: headers || JSON.parse(currentTask.headers || '{}'),
                  body: requestBody !== undefined ? requestBody : currentTask.body,
                  cron_expression: cron_expression || currentTask.cron_expression,
                  status: 'active' as const,
                };
                cronManager.startTask(updatedTask);
              }

              resolve(
                NextResponse.json({
                  message: 'Task updated successfully',
                  id: taskId,
                })
              );
            }
          }
        );
      });
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const taskId = parseInt(id);

    await database.initialize();
    const db = database.getDb();

    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    return new Promise<NextResponse>((resolve) => {
      // Stop task first
      cronManager.stopTask(taskId);

      // Delete from database
      db.run('DELETE FROM tasks WHERE id = ?', [taskId], function (err) {
        if (err) {
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        } else if (this.changes === 0) {
          resolve(NextResponse.json({ error: 'Task not found' }, { status: 404 }));
        } else {
          resolve(NextResponse.json({ message: 'Task deleted successfully' }));
        }
      });
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
