# Nexus Platform Cursor Rules

This directory contains **Cursor AI rules** specifically designed for the Braintrust Nexus platform development. These rules ensure consistent, production-quality code generation that follows our monorepo architecture and tech stack requirements.

## 🎯 **Project Overview**

**Nexus Platform**: Admin application with two main apps (`apps/admin` and `apps/client`) sharing a single Supabase database, built as a monorepo for a take-home engineering test.

## 📁 **Rules Structure**

### **Core Rules (Always Applied)**
- **`000-core.mdc`** - Foundation principles, project overview, and essential patterns
- **`005-monorepo.mdc`** - Monorepo architecture with `apps/admin` and `apps/client`

### **Technology-Specific Rules**
- **`001-nextjs.mdc`** - Next.js 15+ App Router patterns for monorepo
- **`002-supabase.mdc`** - Supabase SSR integration with shared database
- **`003-typescript.mdc`** - TypeScript + Zod validation patterns
- **`004-testing.mdc`** - Jest, Testing Library, Playwright guidelines
- **`006-packages.mdc`** - Shared packages development (`packages/ui`, `packages/database`, etc.)

## 🏗 **Tech Stack Covered**

```typescript
// Modern full-stack monorepo
- Next.js 15+ App Router
- TypeScript (strict, no `any`)
- Tailwind CSS + shadcn/ui
- Supabase (shared database)
- tRPC (type-safe APIs)
- React Query + TanStack Table
- Zod validation
- Jest + Testing Library + Playwright
- Turborepo + pnpm workspaces
```

## 🚀 **Quick Setup**

### **1. Verify Rules Are Active**
1. Open Cursor IDE
2. Go to **Cursor Settings** → **Rules**
3. Check that all `.mdc` files are listed under **Project Rules**
4. Ensure `000-core.mdc` shows **"Always Apply: Yes"**

### **2. Test the Rules**
Try asking Cursor:
```
"Create an admin dashboard component for managing clients"
"Set up a Supabase query for client workflows with RLS"
"Add TypeScript types for the exception management system"
"Create a shared UI component for workflow cards"
```

### **3. Verify Generated Code**
Check that generated code:
- ✅ Uses proper monorepo imports (`@nexus/ui`, `@nexus/database`)
- ✅ Follows role-based access patterns (admin vs client)
- ✅ Includes Zod validation and TypeScript types
- ✅ Implements proper error handling and loading states

## 🎯 **Rule Priorities & Dependencies**

```
000-core.mdc (Priority: 100) ← Foundation for all others
├── 005-monorepo.mdc (95) ← Monorepo architecture
├── 001-nextjs.mdc (90) ← Next.js patterns
├── 002-supabase.mdc (85) ← Database integration
├── 003-typescript.mdc (80) ← Type safety
├── 004-testing.mdc (75) ← Testing patterns
└── 006-packages.mdc (85) ← Package development
```

## 🏢 **Architecture Overview**

### **Monorepo Structure**
```
braintrust-nexus/
├── apps/
│   ├── admin/              # Braintrust employees (Admin + SE)
│   │   ├── Full client management
│   │   ├── User administration
│   │   ├── Global workflow monitoring
│   │   ├── Exception handling
│   │   └── Billing & subscription management
│   └── client/             # Customer portal (Client users)
│       ├── Own data only (RLS enforced)
│       ├── Workflow ROI view
│       ├── Usage reporting
│       ├── Exception monitoring
│       └── Billing portal
├── packages/
│   ├── ui/                 # Shared shadcn components (role-aware)
│   ├── database/           # Supabase client & types
│   ├── auth/               # Authentication & permissions
│   ├── shared/             # Business logic & utilities
│   └── config/             # ESLint, TypeScript configs
└── supabase/               # Single shared database
    ├── migrations/         # Schema & RLS policies
    └── config.toml
```

### **Data Access Patterns**
- **Admin App**: Can use service role for broader access + RLS for user operations
- **Client App**: Strict RLS enforcement only - never bypasses security
- **Shared Database**: Single Supabase instance with Row Level Security policies
- **Role-Based Access**: Database automatically filters data by user role

## 🔧 **Key Features**

### **Production-Ready Patterns**
- **No `any` types** - strict TypeScript enforcement
- **Zod-first validation** - schema-driven development
- **Comprehensive testing** - unit, integration, and E2E
- **Performance optimized** - React Query, proper caching
- **Security first** - RLS, input validation, proper auth

### **Monorepo Best Practices**
- **Code sharing** through packages without duplication
- **Role-aware components** that adapt based on user permissions
- **Consistent tooling** across all apps and packages
- **Type safety** maintained across package boundaries

### **Take-Home Test Optimized**
Rules are specifically designed for the three judging criteria:
1. **Functionality** - Complete feature implementation
2. **Code Quality** - Clean, maintainable, well-structured code
3. **Design Quality** - Production-ready UI that matches requirements

## 🐛 **Troubleshooting**

### **Rules Not Working?**
1. **Check file names**: Must be exactly `000-core.mdc`, `001-nextjs.mdc`, etc.
2. **Verify location**: Files must be in `.cursor/rules/` directory
3. **Restart Cursor**: Sometimes needed after adding new rules
4. **Check syntax**: MDC format requires proper YAML frontmatter

### **Generated Code Issues?**
1. **Import errors**: Check that package dependencies are correct in root `package.json`
2. **Type errors**: Ensure `@nexus/*` path mappings in `tsconfig.json`
3. **Access control**: Verify user role checks and RLS policies
4. **Database errors**: Check Supabase client configuration

### **Rule Conflicts?**
1. **Priority order**: Higher numbers take precedence
2. **Dependencies**: Check that prerequisite rules are present
3. **File patterns**: Ensure `globs` patterns don't conflict
4. **Context**: Some rules only apply to specific file types

## 📚 **Additional Resources**

### **Official Documentation**
- [Cursor Rules Documentation](https://docs.cursor.com/en/context/rules)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Turborepo Documentation](https://turbo.build/repo/docs)

### **Community Resources**
- [awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) - 879+ community rules
- [Official Supabase AI Prompts](https://supabase.com/docs/guides/getting-started/ai-prompts)
- [shadcn/ui Examples](https://ui.shadcn.com/examples)

## 🔄 **Updates & Maintenance**

### **Rule Updates**
- Rules are version-controlled with your project
- Update rules as requirements change
- Test rule changes with sample prompts
- Keep rules focused and specific

### **New Features**
When adding new features to Nexus:
1. Update relevant `.mdc` files
2. Add new patterns and examples
3. Test with Cursor AI generation
4. Update this README if needed

---

**Last Updated**: August 2025
**Version**: 1.0
**Compatible with**: Cursor AI, Next.js 15+, Supabase SSR