# Finance Tracker - System Architecture

## Overview

This is a full-stack personal finance tracking application built with modern web technologies. The application allows users to track income and expenses, categorize transactions, set budgets, and visualize financial data through interactive charts and dashboards.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 15 with React 18 and TypeScript
- **Routing**: Next.js App Router for file-based routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Build Tool**: Next.js built-in bundler with Turbopack

### Backend Architecture
- **Runtime**: Next.js API Routes with TypeScript
- **API Design**: RESTful API with JSON responses
- **Request Handling**: Next.js middleware for API handling
- **Development**: Next.js development server with hot reload

### Data Layer
- **Storage**: In-memory storage for development (MemStorage)
- **Database**: MongoDB for production deployment
- **Schema Management**: Zod schemas for runtime type checking and API validation

## Key Components

### Database Schema
- **Categories**: Store expense/income categories with colors and icons
- **Transactions**: Record individual financial transactions with amounts, descriptions, and dates
- **Budgets**: Set monthly spending limits per category

### API Endpoints
- **Categories**: CRUD operations for transaction categories
- **Transactions**: Full transaction management with filtering and pagination
- **Budgets**: Budget creation and tracking
- **Analytics**: Financial insights including monthly trends and category breakdowns

### Frontend Pages
- **Dashboard**: Financial overview with summary cards, charts, and recent transactions
- **Transactions**: Transaction management with search, filtering, and CRUD operations
- **Categories**: Category management (placeholder)
- **Budget**: Budget tracking and management (placeholder)
- **Reports**: Financial reporting (placeholder)

## Data Flow

1. **User Interactions**: Users interact with React components that use React Hook Form for input validation
2. **API Calls**: TanStack Query manages API requests with automatic caching and invalidation
3. **Server Processing**: Express routes handle requests, validate data with Zod schemas
4. **Database Operations**: Drizzle ORM performs type-safe database queries
5. **Response Handling**: JSON responses are cached by React Query and trigger UI updates

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: Neon PostgreSQL database driver
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Type-safe ORM
- **react-hook-form**: Form management
- **zod**: Runtime type validation

### UI Components
- **@radix-ui/***: Unstyled, accessible UI primitives
- **shadcn/ui**: Pre-built component library
- **tailwindcss**: Utility-first CSS framework
- **recharts**: Chart library for data visualization

### Development Tools
- **vite**: Build tool and dev server
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite compiles React app to static assets in `dist/public`
2. **Backend Build**: esbuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations ensure schema consistency

### Environment Configuration
- **Development**: Uses Vite dev server with HMR and Express middleware
- **Production**: Serves static assets from Express with compiled server bundle
- **Database**: PostgreSQL connection via environment variable `DATABASE_URL`

### File Structure
- **`client/`**: Frontend React application
- **`server/`**: Backend Express server
- **`shared/`**: Shared TypeScript types and schemas
- **`migrations/`**: Database migration files

## Changelog
```
Changelog:
- July 06, 2025. Initial setup
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```