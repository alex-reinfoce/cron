# Cron Task Management Platform

A modern, web-based cron task management platform built with Next.js and Ant Design.

## Features

- ✅ Create and manage cron tasks with intuitive UI
- ⏰ Support for various scheduling options (every second/minute/hour/day/month)
- 🔄 Pause, resume, and test tasks
- 📊 Real-time execution logs and statistics
- 🎯 Task categorization (Business tasks / Keep Alive monitoring)
- 🔧 Custom HTTP headers and request body support
- 💾 SQLite database for data persistence
- 📱 Responsive design for mobile and desktop
- 🔐 Security authentication system

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

```bash
npm install
# or
pnpm install
```

### Development

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Production

```bash
npm run build
npm start
```

## Database

The application uses SQLite for data storage:
- **Development**: `cron_tasks.db` in project root
- **Production**: `data/cron_tasks.db` 

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NODE_ENV=development
# Add other environment variables as needed
```

## Upgrading

To upgrade to the latest version of the cron platform, you have two options:

**Option 1: Using npm script (recommended)**
```bash
npm run upgrade
```

**Option 2: Using npx directly**
```bash
npx @alex-programmer/cron upgrade
```

Both commands will update the core platform files while preserving your data and custom configurations.

**What gets updated:**
- Core application files (`app`, `components`, `lib`, `types`, `scripts`)
- Configuration files (`next.config.ts`, `tsconfig.json`, etc.)
- Dependencies in `package.json`

**What gets preserved:**
- Your database files (`cron_tasks.db`)
- Environment files (`.env`, `.env.local`, `.env.production`)
- **Your custom authentication config** (`config/auth.ts`)
- ⚠️ **Your login credentials are safe!**
- Your project name and custom package.json settings

## Project Structure

```
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                 # Utility libraries
├── types/              # TypeScript type definitions
├── public/             # Static assets
└── cron_tasks.db       # SQLite database (development)
```

## License

MIT 

## Authentication Configuration

This project includes a simple authentication system to protect the management interface.

### Default Login Information
- **Username**: `admin`
- **Password**: `123456`
- **Session Mode**: Single user only (later logins will displace earlier ones)
- **Session Duration**: Permanent (until browser cache is cleared)

### Modifying Login Credentials

⚠️ **Important**: Please modify the default account credentials in a production environment!

1. Edit the `config/auth.ts` file:
```typescript
export const authConfig: AuthConfig = {
  username: 'your-username',      // Replace with your username
  password: 'your-password',      // Replace with your password
  singleUserMode: true,           // Enable single user mode
};
```

2. Rebuild the application:
```bash
npm run build
npm start
```

### System Features
- **Single User Mode**: Only one user can be logged in at a time. New logins will automatically log out previous users.
- **Permanent Sessions**: Login sessions persist until manually logged out or browser cache is cleared.
- **Real-time Detection**: The system checks for displaced sessions every 5 seconds and notifies users.

### Security Recommendations
- Use a strong password (including uppercase and lowercase letters, numbers, and special characters)
- Regularly change your password
- Consider using a more secure authentication scheme in a production environment
- Be aware that only one user can access the system at a time
