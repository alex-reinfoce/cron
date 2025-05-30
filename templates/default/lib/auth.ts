import { validateCredentials, authConfig } from '../config/auth';
import { LoginCredentials, AuthSession, LoginResponse } from '../types';

/**
 * Authentication management utility class
 */
export class AuthManager {
  private static readonly SESSION_KEY = 'cron_auth_session';
  private static readonly LATEST_LOGIN_KEY = 'cron_latest_login';

  /**
   * Generate unique session ID
   */
  private static generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + 
           Date.now().toString(36);
  }

  /**
   * User login
   * @param credentials Login credentials
   * @returns Login result
   */
  static login(credentials: LoginCredentials): LoginResponse {
    const { username, password } = credentials;

    if (!username || !password) {
      return {
        success: false,
        message: 'Please enter username and password',
      };
    }

    if (validateCredentials(username, password)) {
      const now = Date.now();
      const sessionId = this.generateSessionId();
      
      const session: AuthSession = {
        isAuthenticated: true,
        username,
        loginTime: now,
        sessionId,
      };

      // Save session to local storage
      this.saveSession(session);

      // If single user mode is enabled, update latest login timestamp
      if (authConfig.singleUserMode) {
        this.updateLatestLogin(now, sessionId);
      }

      return {
        success: true,
        message: 'Login successful',
        session,
      };
    } else {
      return {
        success: false,
        message: 'Incorrect username or password',
      };
    }
  }

  /**
   * User logout
   */
  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SESSION_KEY);
    }
  }

  /**
   * Check if user is logged in
   * @returns Whether logged in
   */
  static isAuthenticated(): boolean {
    const session = this.getSession();
    if (!session || !session.isAuthenticated) {
      return false;
    }

    // If single user mode is enabled, check if displaced by other login
    if (authConfig.singleUserMode) {
      const latestLogin = this.getLatestLogin();
      if (!latestLogin || !session.sessionId || 
          latestLogin.sessionId !== session.sessionId) {
        // Current session has been displaced by new login, clear local session
        this.logout();
        return false;
      }
    }

    return true;
  }

  /**
   * Get current session
   * @returns Current session information
   */
  static getSession(): AuthSession | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (sessionData) {
        return JSON.parse(sessionData);
      }
    } catch (error) {
      console.error('Failed to parse session data:', error);
    }

    return null;
  }

  /**
   * Save session to local storage
   * @param session Session information
   */
  private static saveSession(session: AuthSession): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    }
  }

  /**
   * Update latest login timestamp and session ID
   * @param loginTime Login time
   * @param sessionId Session ID
   */
  private static updateLatestLogin(loginTime: number, sessionId: string): void {
    if (typeof window !== 'undefined') {
      const latestLogin = {
        loginTime,
        sessionId,
      };
      localStorage.setItem(this.LATEST_LOGIN_KEY, JSON.stringify(latestLogin));
    }
  }

  /**
   * Get latest login information
   * @returns Latest login information
   */
  private static getLatestLogin(): { loginTime: number; sessionId: string } | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const latestLoginData = localStorage.getItem(this.LATEST_LOGIN_KEY);
      if (latestLoginData) {
        return JSON.parse(latestLoginData);
      }
    } catch (error) {
      console.error('Failed to parse latest login data:', error);
    }

    return null;
  }

  /**
   * Check if displaced by another user (for display notification)
   * @returns Whether displaced by another user
   */
  static isDisplacedByAnotherUser(): boolean {
    const session = this.getSession();
    if (!session || !session.isAuthenticated || !authConfig.singleUserMode) {
      return false;
    }

    const latestLogin = this.getLatestLogin();
    return !!(latestLogin && session.sessionId && 
              latestLogin.sessionId !== session.sessionId);
  }

  /**
   * Get session duration (minutes)
   * @returns Session duration, 0 if not logged in
   */
  static getSessionDuration(): number {
    const session = this.getSession();
    if (!session || !session.loginTime) {
      return 0;
    }

    const duration = Date.now() - session.loginTime;
    return Math.floor(duration / (60 * 1000));
  }
} 
 