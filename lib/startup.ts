import database from './database';
import cronManager from './cronManager';

let initialized = false;

export async function initializeApp() {
  if (initialized) {
    return;
  }

  try {
    console.log('Initializing cron task platform...');
    await cronManager.initialize();
    initialized = true;
    console.log('Cron task platform initialized successfully');
  } catch (error) {
    console.error('Failed to initialize cron task platform:', error);
    throw error;
  }
}

// Auto-initialize on server side
if (typeof window === 'undefined') {
  initializeApp().catch(console.error);
}

export default initializeApp; 
