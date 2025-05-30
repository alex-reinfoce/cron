import { NextRequest, NextResponse } from 'next/server';
import database from '../../../lib/database';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    await database.initialize();
    const db = database.getDb();
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    let query = `
      SELECT l.*, t.name as task_name 
      FROM task_logs l 
      LEFT JOIN tasks t ON l.task_id = t.id
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM task_logs l';
    let params: any[] = [];

    if (taskId) {
      query += ' WHERE l.task_id = ?';
      countQuery += ' WHERE l.task_id = ?';
      params.push(parseInt(taskId));
    }

    query += ' ORDER BY l.executed_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return new Promise<NextResponse>((resolve) => {
      // 获取总数
      db.get(countQuery, taskId ? [parseInt(taskId)] : [], (err, countRow: any) => {
        if (err) {
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }

        // 获取日志数据
        db.all(query, params, (err, rows: any[]) => {
          if (err) {
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          } else {
            resolve(NextResponse.json({
              logs: rows,
              total: countRow.total,
              page,
              limit,
              totalPages: Math.ceil(countRow.total / limit)
            }));
          }
        });
      });
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 
