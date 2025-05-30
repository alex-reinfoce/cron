import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';
import cronManager from '@/lib/cronManager';
import { Task } from '@/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const taskId = parseInt(id);
    const body = await request.json();
    const { status } = body;

    if (!status || !['active', 'paused'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "active" or "paused"' },
        { status: 400 }
      );
    }

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

        // Stop current task first
        cronManager.stopTask(taskId);

        // Update status in database
        db.run(
          'UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [status, taskId],
          function(updateErr) {
            if (updateErr) {
              resolve(NextResponse.json({ error: updateErr.message }, { status: 500 }));
            } else {
              // Start task if status is active
              if (status === 'active') {
                const task: Task = {
                  ...currentTask,
                  headers: JSON.parse(currentTask.headers || '{}'),
                  status: 'active'
                };
                cronManager.startTask(task);
              }

              resolve(NextResponse.json({ 
                message: `Task ${status === 'active' ? 'activated' : 'paused'} successfully`,
                status 
              }));
            }
          }
        );
      });
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 
