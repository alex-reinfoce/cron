import sqlite3 from 'sqlite3';
import path from 'path';

// Determine database file location based on environment
const isDev = process.env.NODE_ENV === 'development';
const dbPath = isDev 
  // Production environment: use data folder under project root
  ? path.join(process.cwd(), 'tasks.db')
  // Development environment: use project root
  : path.join(process.cwd(), 'data', 'tasks.db');

class Database {
  private db: sqlite3.Database | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Ensure directory exists
      const fs = await import('fs');
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new sqlite3.Database(dbPath);
      
      await this.createTables();
      this.initialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      // Create tasks table
      this.db!.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          url TEXT NOT NULL,
          method TEXT DEFAULT 'GET',
          headers TEXT DEFAULT '{}',
          body TEXT DEFAULT '',
          cron_expression TEXT NOT NULL,
          task_type TEXT NOT NULL,
          status TEXT DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Create task execution logs table
        this.db!.run(`
        CREATE TABLE IF NOT EXISTS task_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id INTEGER NOT NULL,
            status TEXT NOT NULL,
          response_status INTEGER,
          response_body TEXT,
          error_message TEXT,
            execution_time INTEGER NOT NULL,
          executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
        )
        `, (logErr) => {
          if (logErr) {
            reject(logErr);
          } else {
            resolve();
          }
        });
      });
    });
  }

  getDb(): sqlite3.Database | null {
    return this.db;
  }

  async close(): Promise<void> {
      if (this.db) {
      return new Promise((resolve, reject) => {
        this.db!.close((err) => {
          if (err) {
            reject(err);
          } else {
            this.db = null;
            this.initialized = false;
            resolve();
          }
        });
      });
      }
  }
}

const database = new Database();
export default database; 
