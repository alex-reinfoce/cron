import cron from 'node-cron';
import axios from 'axios';
import { Task, TaskLog, TaskExecutionResult } from '../types';
import database from './database';

class CronManager {
  private tasks: Map<number, cron.ScheduledTask> = new Map();

  async initialize(): Promise<void> {
    await database.initialize();
    await this.loadAndStartTasks();
  }

  // Load all active tasks from database and start them
  private async loadAndStartTasks(): Promise<void> {
    const db = database.getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM tasks WHERE status = ?',
        ['active'],
        (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            rows.forEach((row) => {
              const task: Task = {
                ...row,
                headers: JSON.parse(row.headers || '{}')
              };
            this.startTask(task);
          });
            console.log(`Started ${rows.length} active tasks`);
          resolve();
          }
        }
      );
    });
  }

  // Start a single task
  startTask(task: Task): void {
    try {
      // If task is already running, stop it first
      if (this.tasks.has(task.id!)) {
        this.stopTask(task.id!);
    }

      const scheduledTask = cron.schedule(
        task.cron_expression,
        async () => {
        await this.executeTask(task);
        },
        {
          scheduled: true,
          timezone: 'Asia/Shanghai'
        }
      );

      this.tasks.set(task.id!, scheduledTask);
      console.log(`Task started: ${task.name} (${task.cron_expression})`);
    } catch (error) {
      console.error(`Failed to start task ${task.name}:`, error);
    }
  }

  // Stop a single task
  stopTask(taskId: number): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.stop();
      this.tasks.delete(taskId);
      console.log(`Task stopped: ${taskId}`);
    }
  }

  // Execute task
  async executeTask(task: Task): Promise<TaskExecutionResult> {
    const startTime = Date.now();
    let result: TaskExecutionResult;

    try {
      console.log(`Executing task: ${task.name}`);
      
      const response = await axios({
        method: task.method,
        url: task.url,
        headers: task.headers,
        data: task.body || undefined,
        timeout: 30000,
        validateStatus: () => true // Don't throw on any status code
      });

      const executionTime = Date.now() - startTime;
      
      result = {
        success: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.data,
        executionTime
      };

      // Log execution result
      await this.logExecution(task.id!, 'success', {
        response_status: response.status,
        response_body: JSON.stringify(response.data),
        execution_time: executionTime
      });

      console.log(`Task executed successfully: ${task.name}, status: ${response.status}, time: ${executionTime}ms`);
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      result = {
        success: false,
        error: error.message,
        executionTime
      };

      // Log execution error
      await this.logExecution(task.id!, 'error', {
        error_message: error.message,
        execution_time: executionTime
      });

      console.error(`Task execution failed: ${task.name}, error: ${error.message}, time: ${executionTime}ms`);
    }

    return result;
  }

  // Log task execution
  private async logExecution(
    taskId: number,
    status: 'success' | 'error',
    details: {
      response_status?: number;
      response_body?: string;
      error_message?: string;
      execution_time: number;
    }
  ): Promise<void> {
    const db = database.getDb();
    if (!db) {
      return;
    }

    return new Promise((resolve) => {
      db.run(
        `INSERT INTO task_logs (task_id, status, response_status, response_body, error_message, execution_time)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          taskId,
          status,
          details.response_status || null,
          details.response_body || null,
          details.error_message || null,
          details.execution_time
        ],
        (err) => {
          if (err) {
            console.error('Failed to log task execution:', err);
          }
            resolve();
        }
      );
    });
  }

  // Get all running tasks
  getRunningTasks(): number[] {
    return Array.from(this.tasks.keys());
  }

  // Stop all tasks
  stopAllTasks(): void {
    this.tasks.forEach((task, taskId) => {
      task.stop();
      console.log(`Task stopped: ${taskId}`);
    });
    this.tasks.clear();
  }
}

const cronManager = new CronManager();
export default cronManager; 
