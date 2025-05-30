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
    
    await database.initialize();
    const db = database.getDb();
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get task details
    return new Promise<NextResponse>((resolve) => {
      db.get('SELECT * FROM tasks WHERE id = ?', [taskId], async (err, row: any) => {
        if (err) {
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }
        
        if (!row) {
          resolve(NextResponse.json({ error: 'Task not found' }, { status: 404 }));
          return;
        }

        try {
          // Create task object
          const task: Task = {
            ...row,
            headers: JSON.parse(row.headers || '{}')
          };

          // Execute task immediately
          const result = await cronManager.executeTask(task);

          resolve(NextResponse.json({
            success: result.success,
            status: result.status,
            executionTime: result.executionTime,
            data: result.data,
            error: result.error
          }));
        } catch (error: any) {
          resolve(NextResponse.json({ 
            success: false, 
            error: error.message 
          }, { status: 500 }));
        }
      });
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 
