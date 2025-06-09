import { NextRequest, NextResponse } from 'next/server';
import database from '../../../lib/database';
import cronManager from '../../../lib/cronManager';
import { Task } from '../../../types';

// Get all tasks
export async function GET(): Promise<NextResponse> {
  try {
    await database.initialize();
    const db = database.getDb();

    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    return new Promise<NextResponse>((resolve) => {
      db.all('SELECT * FROM tasks ORDER BY created_at DESC', (err, rows: any[]) => {
        if (err) {
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        } else {
          // Parse headers field
          const tasks = rows.map((task) => ({
            ...task,
            headers: JSON.parse(task.headers || '{}'),
          }));
          resolve(NextResponse.json(tasks));
        }
      });
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create new task
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { name, url, method, headers, body: requestBody, cron_expression } = body;

    // Validate required fields
    if (!name || !url || !cron_expression) {
      return NextResponse.json({ error: 'Missing required fields: name, url, cron_expression' }, { status: 400 });
    }

    await database.initialize();
    const db = database.getDb();

    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    return new Promise<NextResponse>((resolve) => {
      db.run(
        `INSERT INTO tasks (name, url, method, headers, body, cron_expression, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, url, method || 'GET', JSON.stringify(headers || {}), requestBody || '', cron_expression, 'active'],
        function (err) {
          if (err) {
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          } else {
            const taskId = this.lastID;

            // Create task object and start
            const newTask: Task = {
              id: taskId,
              name,
              url,
              method: method || 'GET',
              headers: headers || {},
              body: requestBody || '',
              cron_expression,
              status: 'active',
            };

            // Start scheduled task
            cronManager.startTask(newTask);

            resolve(
              NextResponse.json(
                {
                  id: taskId,
                  message: 'Task created and started successfully',
                },
                { status: 201 }
              )
            );
          }
        }
      );
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
