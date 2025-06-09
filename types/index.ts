export interface Task {
  id?: number;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  body?: string;
  cron_expression: string;
  status: 'active' | 'paused';
  created_at?: string;
  updated_at?: string;
}

export interface TaskLog {
  id?: number;
  task_id: number;
  status: 'success' | 'error';
  response_status?: number;
  response_body?: string;
  error_message?: string;
  execution_time: number;
  executed_at?: string;
}

export interface CronSchedule {
  label: string;
  value: string;
  expression: string;
}

export interface TaskFormData {
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Array<{ key: string; value: string }>;
  body?: string;
  schedule_type: string;
  custom_cron?: string;
}

export interface TaskExecutionResult {
  success: boolean;
  status?: number;
  data?: any;
  error?: string;
  executionTime: number;
}

// Authentication related types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthSession {
  isAuthenticated: boolean;
  username?: string;
  loginTime?: number;
  sessionId?: string; // Unique session identifier
}

export interface LoginResponse {
  success: boolean;
  message: string;
  session?: AuthSession;
}
