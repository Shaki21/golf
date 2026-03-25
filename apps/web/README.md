# AK Golf Academy - Web Frontend

Golf coaching and training management application built with React.

## Status

| Metric | Value |
|--------|-------|
| **Framework** | React 18 |
| **Styling** | Tailwind CSS |
| **Testing** | Jest + Playwright |
| **Build** | Vite |

## Prerequisites

- Node.js 20+
- pnpm 8+ (or npm 10+)

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm test` | Run unit tests |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint with auto-fix |
| `pnpm test:e2e` | Run Playwright E2E tests |
| `pnpm test:e2e:headed` | Run E2E tests with browser UI |
| `pnpm test:e2e:ui` | Open Playwright UI mode |

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── branding/      # Logo and brand components
│   ├── layout/        # Layout components (PageHeader, AppShell)
│   └── ui/            # UI primitives (LoadingState, ErrorState)
├── ui/                # Design system components
│   ├── primitives/    # Base components (Button, Input, Card)
│   ├── composites/    # Complex components (Modal, Tabs)
│   └── templates/     # Page templates (AppShellTemplate, StatsGridTemplate)
├── contexts/          # React contexts (Auth, etc.)
├── features/          # Feature modules (65+ features)
│   ├── dashboard/     # Main dashboard
│   ├── calendar/      # Calendar and scheduling
│   ├── annual-plan/   # Annual planning (Årsplan)
│   ├── sessions/      # Training sessions
│   ├── tests/         # Test protocols and results
│   ├── goals/         # Goal tracking
│   ├── profile/       # User profile
│   └── coach/         # Coach-specific features
├── hooks/             # Custom React hooks
├── services/          # API clients and services
├── config/            # Configuration
└── design-tokens.js   # Design system tokens
```

## Design System

The app uses **Nordic Minimalism v3.1** design system.

### Key Files

| File | Description |
|------|-------------|
| `src/design-tokens.js` | JavaScript design tokens |
| `src/index.css` | CSS variables and global styles |
| `src/ui/primitives/` | Base UI components |
| `src/ui/composites/` | Complex UI components |

### Usage

```jsx
import { tokens } from './design-tokens';

const style = {
  color: tokens.colors.primary,
  padding: tokens.spacing[4],
};
```

### Brand Colors

| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#10456A` | Main brand color |
| Ink | `#02060D` | Text |
| Snow | `#EDF0F2` | Background |
| Gold | `#C9A227` | Accents |

## Testing

### Unit Tests

```bash
pnpm test
```

Tests are located in `__tests__` folders next to their components.

### E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run with browser visible
pnpm test:e2e:headed

# Open Playwright UI
pnpm test:e2e:ui
```

E2E tests are in the `tests/` folder using Playwright.

## Pre-commit Hooks

The project uses Husky + lint-staged for pre-commit checks:

- ESLint runs on staged `.js`, `.jsx`, `.ts`, `.tsx` files
- Commits are blocked if there are linting errors

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Player | player@demo.com | player123 |
| Coach | coach@demo.com | coach123 |
| Admin | admin@demo.com | admin123 |

## Environment Variables

Create a `.env.local` file:

```env
VITE_API_URL=http://localhost:3000
```

## Contributing

1. Create a feature branch
2. Make changes
3. Ensure tests pass: `pnpm test`
4. Ensure no lint errors: `pnpm lint`
5. Submit a pull request

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 18 |
| **Routing** | React Router 7 |
| **HTTP** | Axios |
| **Icons** | Lucide React |
| **Styling** | Tailwind CSS |
| **Build** | Vite |
| **Unit Tests** | Jest |
| **E2E Tests** | Playwright |
| **Mobile** | Capacitor |
