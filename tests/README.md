# CLI Test Suite

This test suite uses Vitest to automatically test all core functionalities of the `@alex-programmer/cron` CLI tool.

## Test Coverage

### 1. CLI Help Commands
- ✅ Main help information display
- ✅ create command help information
- ✅ upgrade command help information  
- ✅ Version number display

### 2. Project Creation
- ✅ Successfully create new project
- ✅ Correct project file structure
- ✅ Correct package.json configuration
- ✅ Version file creation and content
- ✅ Handle overwrite confirmation for existing directories

### 3. Project Upgrade
- ✅ Successfully upgrade project
- ✅ Version file update
- ✅ Preserve project name and configuration
- ✅ Upgrade failure in non-cron project directory

### 4. Error Handling
- ✅ Handle invalid project names
- ✅ Unknown command errors

### 5. Integration Tests
- ✅ Created project can build successfully
- ✅ Correctly generate API route files
- ✅ Correctly generate component files

## Running Tests

### Quick CLI test run
```bash
npm run test:cli
```

### Run all tests in watch mode
```bash
npm run test:watch
```

### Generate test coverage report
```bash
npm run test:coverage
```

### Run all tests (one-time)
```bash
npm test
```

## Test Features

### Automated Environment Management
- Each test runs in an independent temporary directory
- Automatically clean up temporary files after test completion
- Does not affect the main project or other tests

### Real Environment Testing
- Uses real CLI executable files
- Performs actual file operations
- Validates complete npm install and build processes

### Timeout Settings
- Test timeout set to 60 seconds
- Accommodates time-consuming operations like npm install

## Test File Structure

```
tests/
├── cli.test.ts     # Main CLI test suite
└── README.md       # Test documentation (this file)
```

## Adding New Tests

When adding new CLI features, please add corresponding tests in `tests/cli.test.ts`:

```typescript
describe('New Feature', () => {
  it('should work correctly', () => {
    // Test code
  });
});
```

## Testing Best Practices

1. **Use temporary directories**: All tests should be conducted in temporary directories
2. **Clean up resources**: Clean up created files and directories after test completion
3. **Simulate real scenarios**: Tests should reflect real user usage scenarios
4. **Verify key outputs**: Check key information in CLI output
5. **Error handling**: Test error conditions and edge cases

## Troubleshooting

### Test Timeout
If tests fail due to timeout, it might be because npm install is slow due to network issues. You can:
- Check network connection
- Increase timeout in vitest.config.ts
- Use a faster package manager (like pnpm)

### Permission Issues
You might encounter file permission issues on some systems:
```bash
# Ensure write permissions
chmod +w /tmp
```

### Concurrency Issues
If you encounter concurrent test issues, you can adjust concurrency settings in vitest.config.ts:
```typescript
test: {
  pool: 'forks', // Use processes instead of threads
  poolOptions: {
    forks: {
      maxForks: 1 // Reduce concurrency
    }
  }
}
``` 
