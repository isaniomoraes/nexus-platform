# Nexus Platform

A comprehensive workflow automation platform built with Next.js 15, Supabase, and shadcn/ui in a Turborepo monorepo structure.

## Architecture

This project implements a monorepo with two main applications:

- **Admin App** (`apps/admin`): Full platform management for Braintrust employees (Admin + SE roles)
- **Client App** (`apps/client`): Customer portal for client users (restricted to own data)
- **Shared Packages**: Common UI components, database layer, authentication, and business logic

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth with role-based access
- **Monorepo**: Turborepo with pnpm
- **UI Components**: shadcn/ui with custom sidebar implementation
- **State Management**: React Query + Zustand
- **Form Handling**: React Hook Form + Zod validation

## Quick Start

### Prerequisites

- Node.js 18.17.0 or higher
- pnpm 8.15.6 or higher
- Supabase CLI (optional, for local development)

### Installation

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd nexus-platform
   pnpm install
   ```

2. **Set up environment variables:**

   Create `.env.local` files in both apps:

   **apps/admin/.env.local:**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_APP_NAME=Nexus Admin
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   **apps/client/.env.local:**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_NAME=Nexus Client Portal
   NEXT_PUBLIC_APP_URL=http://localhost:3001
   ```

3. **Set up Supabase database:**

   ```bash
   # If using Supabase CLI locally
   supabase start
   supabase db reset

   # Or apply migrations to your remote Supabase project
   supabase db push
   ```

4. **Start development servers:**

   ```bash
   # Start both apps
   pnpm dev

   # Or start individually
   pnpm --filter @nexus/admin dev  # Admin app on :3000
   pnpm --filter @nexus/client dev # Client app on :3001
   ```

## Project Structure

```
nexus-platform/
├── apps/
│   ├── admin/                  # Admin Next.js app
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   └── components/    # App-specific components
│   │   └── package.json
│   └── client/                 # Client Next.js app
│       ├── src/
│       │   ├── app/           # App Router pages
│       │   └── components/    # App-specific components
│       └── package.json
├── packages/
│   ├── ui/                     # Shared shadcn components
│   ├── database/               # Supabase client & types
│   ├── auth/                   # Authentication logic
│   ├── shared/                 # Business logic & utilities
│   ├── eslint-config/          # Shared ESLint config
│   └── tsconfig/               # Shared TypeScript config
├── supabase/
│   ├── migrations/             # Database schema
│   └── config.toml             # Supabase configuration
├── turbo.json                  # Turborepo configuration
└── pnpm-workspace.yaml         # pnpm workspace config
```

## Features

### Admin Dashboard Features

- **Dashboard**: System overview with metrics and activity
- **Users**: Manage admin, SE, and client users
- **Clients**: Client organization management
- **Billing**: Invoice and payment management
- **Subscriptions**: Subscription plan management
- **Messaging**: Client-SE communication hub
- **Reporting**: Analytics and custom reports
- **Exceptions**: System-wide exception monitoring

### Sidebar Implementation

- **Inset Variant**: Modern inset sidebar design matching the provided mockup
- **Responsive**: Mobile-friendly with sheet overlay
- **Collapsible**: Icon-only mode for more screen space
- **Keyboard Shortcuts**: Ctrl/Cmd + B to toggle
- **Tooltip Support**: Helpful tooltips in collapsed mode

### Database Schema

- **Row Level Security (RLS)**: Automatic data filtering by user role
- **Role-based Access**: Admin, SE, and Client roles with appropriate permissions
- **Audit Trails**: Automatic timestamps and change tracking
- **Relational Design**: Proper foreign keys and constraints

## Development

### Available Scripts

```bash
# Development
pnpm dev              # Start all apps in development
pnpm build            # Build all apps for production
pnpm lint             # Lint all packages
pnpm type-check       # TypeScript type checking

# Package-specific
pnpm --filter @nexus/admin dev
pnpm --filter @nexus/client build
pnpm --filter @nexus/ui lint
```

### Installing dependencies in the monorepo

This repository uses pnpm workspaces. You can install packages in:

- The whole workspace:
  ```bash
  pnpm install
  ```

- A specific app (admin or client):
  ```bash
  pnpm --filter @nexus/admin add <pkg>@<version>
  pnpm --filter @nexus/client add <pkg>@<version>
  ```

- A shared package (e.g., UI or Shared):
  ```bash
  pnpm --filter @nexus/ui add <pkg>@<version>
  pnpm --filter @nexus/shared add <pkg>@<version>
  ```

Notes:
- Use the `--filter` flag to scope installation to a package.
- When adding peer deps to shared packages, you usually don’t need to add them to apps unless they are runtime deps for the app.
- For Radix-based shadcn components added to `@nexus/ui`, install the Radix package in that workspace, e.g.:
  ```bash
  pnpm --filter @nexus/ui add @radix-ui/react-alert-dialog
  ```

### Adding New Features

1. **Shared Components**: Add to `packages/ui/src/components/`
2. **Database Changes**: Create new migration in `supabase/migrations/`
3. **Types**: Update `packages/shared/src/validations.ts`
4. **Business Logic**: Add to `packages/shared/src/`

### Code Quality

- **TypeScript**: Strict mode with no `any` types
- **ESLint**: Shared configuration across packages
- **Prettier**: Consistent code formatting
- **Zod**: Schema-first validation and type inference

## Deployment

### Environment Setup

- **Admin App**: Requires service role key for elevated permissions
- **Client App**: Uses only anon key with RLS enforcement
- **Database**: Single Supabase instance with proper RLS policies

### Production Considerations

- Enable RLS on all tables
- Use environment-specific Supabase projects
- Configure proper CORS and redirect URLs
- Set up monitoring and error tracking

## Authentication & Authorization

### User Roles

- **Admin**: Full system access, can bypass RLS when needed
- **SE (Solutions Engineer)**: Access to assigned clients only
- **Client**: Access to own organization data only

### Security Features

- Row Level Security (RLS) policies
- JWT-based authentication
- Role-based route protection
- Secure API endpoints

## Contributing

1. Follow TypeScript best practices
2. Use Zod schemas for all data validation
3. Implement proper error boundaries
4. Write meaningful tests
5. Document complex business logic

## License

Private - Braintrust Internal Use Only
