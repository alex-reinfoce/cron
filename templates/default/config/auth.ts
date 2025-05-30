/**
 * Authentication Configuration
 * 
 * To modify login credentials, update the values in this file and rebuild the application.
 * This configuration is read-only at runtime for security reasons.
 */

export interface AuthConfig {
  /** Login username */
  username: string;
  /** Login password */
  password: string;
  /** Enable single user mode (later logins will displace earlier ones) */
  singleUserMode: boolean;
}

/**
 * Default authentication configuration
 * 
 * ⚠️ Important Notice:
 * - Please modify the default account credentials in production environment!
 * - Changes require rebuilding the application to take effect
 * - Use strong passwords for security
 * - When single user mode is enabled, only one user can be online at a time
 */
export const authConfig: AuthConfig = {
  username: 'admin',
  password: '123456',
  singleUserMode: true, // Enable single user login mode
};

/**
 * Validate login credentials
 * @param username Username
 * @param password Password
 * @returns Whether validation is successful
 */
export function validateCredentials(username: string, password: string): boolean {
  return username === authConfig.username && password === authConfig.password;
}
 