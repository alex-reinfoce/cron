import { CronSchedule } from '../types';

export const cronSchedules: CronSchedule[] = [
  { label: 'Every Second', value: 'every_second', expression: '* * * * * *' },
  { label: 'Every Minute', value: 'every_minute', expression: '0 * * * * *' },
  { label: 'Every Hour', value: 'every_hour', expression: '0 0 * * * *' },
  { label: 'Every Day', value: 'every_day', expression: '0 0 0 * * *' },
  { label: 'Every Month', value: 'every_month', expression: '0 0 0 1 * *' },
  { label: 'Every 5 Minutes', value: 'every_5_minutes', expression: '0 */5 * * * *' },
  { label: 'Every 10 Minutes', value: 'every_10_minutes', expression: '0 */10 * * * *' },
  { label: 'Every 30 Minutes', value: 'every_30_minutes', expression: '0 */30 * * * *' },
  { label: 'Every 2 Hours', value: 'every_2_hours', expression: '0 0 */2 * * *' },
  { label: 'Every 6 Hours', value: 'every_6_hours', expression: '0 0 */6 * * *' },
  { label: 'Every 12 Hours', value: 'every_12_hours', expression: '0 0 */12 * * *' },
  { label: 'Weekdays at 9 AM', value: 'weekdays_9am', expression: '0 0 9 * * 1-5' },
  { label: 'Weekends at 10 AM', value: 'weekends_10am', expression: '0 0 10 * * 0,6' },
  { label: 'Custom', value: 'custom', expression: '' }
];

export function getCronExpression(scheduleType: string, customCron?: string): string {
  if (scheduleType === 'custom') {
    return customCron || '';
  }
  
  const schedule = cronSchedules.find(s => s.value === scheduleType);
  return schedule?.expression || '';
}

export function validateCronExpression(expression: string): boolean {
  if (!expression) return false;
  
  // Basic cron expression validation (supports 6-field format: second minute hour day month weekday)
  const parts = expression.split(' ');
  
  // Support 5-field (minute hour day month weekday) or 6-field (second minute hour day month weekday) format
  if (parts.length !== 5 && parts.length !== 6) {
    return false;
  }
  
  // Simple character validation
  const validChars = /^[0-9\*\-\,\/\?LW#]+$/;
  return parts.every(part => validChars.test(part));
}

export function getCronDescription(expression: string): string {
  if (!expression) return 'Invalid expression';
  
  // Simple description generation
  const parts = expression.split(' ');
  
  if (parts.length === 6) {
    // 6-field format
    if (expression === '* * * * * *') {
      return 'Every second';
    }
    if (expression === '0 * * * * *') {
      return 'Every minute';
    }
    if (expression === '0 0 * * * *') {
      return 'Every hour';
    }
    if (expression === '0 0 0 * * *') {
      return 'Every day';
    }
  } else if (parts.length === 5) {
    // 5-field format
    if (expression === '* * * * *') {
      return 'Every minute';
    }
    if (expression === '0 * * * *') {
      return 'Every hour';
    }
    if (expression === '0 0 * * *') {
      return 'Every day';
    }
  }
  
  // Find matching predefined schedule
  const schedule = cronSchedules.find(s => s.expression === expression);
  if (schedule) {
    return schedule.label;
  }
  
  return 'Custom schedule';
} 
