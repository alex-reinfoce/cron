import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Set test environment
    environment: 'node',
    // Test file patterns
    include: ['tests/**/*.test.ts'],
    // Exclude node_modules and other directories
    exclude: ['node_modules', 'dist', '.next'],
    // Test timeout settings
    testTimeout: 600000,
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['cli/**/*.ts'],
      exclude: ['tests/**', 'dist/**', 'node_modules/**']
    }
  }
}); 
