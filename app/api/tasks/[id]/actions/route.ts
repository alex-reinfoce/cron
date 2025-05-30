import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';
import cronManager from '@/lib/cronManager';
import { Task } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const taskId = parseInt(id);
    const { action } = await request.json();

    await database.initialize();
    const db = database.getDb();

    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    return new Promise<NextResponse>((resolve) => {
      // Get task information
      db.get('SELECT * FROM tasks WHERE id = ?', [taskId], async (err, task: any) => {
        if (err) {
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }

        if (!task) {
          resolve(NextResponse.json({ error: 'Task not found' }, { status: 404 }));
          return;
        }

        const taskObj: Task = {
          ...task,
          headers: JSON.parse(task.headers || '{}')
        };

        try {
          switch (action) {
            case 'pause':
              cronManager.stopTask(taskId);
              db.run(
                'UPDATE tasks SET status = ? WHERE id = ?',
                ['paused', taskId],
                (updateErr) => {
                  if (updateErr) {
                    resolve(NextResponse.json({ error: updateErr.message }, { status: 500 }));
                  } else {
                    resolve(NextResponse.json({ message: 'Task paused successfully' }));
                  }
                }
              );
              break;

            case 'resume':
              cronManager.startTask(taskObj);
              db.run(
                'UPDATE tasks SET status = ? WHERE id = ?',
                ['active', taskId],
                (updateErr) => {
                  if (updateErr) {
                    resolve(NextResponse.json({ error: updateErr.message }, { status: 500 }));
                  } else {
                    resolve(NextResponse.json({ message: 'Task resumed successfully' }));
                  }
                }
              );
              break;

            case 'test':
              try {
                const result = await cronManager.executeTask(taskObj);
                resolve(NextResponse.json(result));
              } catch (testError: any) {
                resolve(NextResponse.json({
                  success: false,
                  error: testError.message
                }));
              }
              break;

            default:
              resolve(NextResponse.json({ error: 'Invalid action' }, { status: 400 }));
          }
        } catch (actionError: any) {
          resolve(NextResponse.json({ error: actionError.message }, { status: 500 }));
        }
      });
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 
