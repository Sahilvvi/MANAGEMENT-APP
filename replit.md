# Enterprise Operations Hub — Mobile App

## Overview

Luxury-grade enterprise mobile application (iOS-first, Apple-level UI/UX) using Expo/React Native inside a pnpm workspace monorepo. Multi-vertical business ecosystem with role-based access.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Mobile framework**: Expo ~54, expo-router ~6.0.23, React Native 0.81.5
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Mobile App (`artifacts/mobile`)

### Design System
- **Primary**: Deep navy `#0A1628` · **Gold accent**: `#C9A84C`
- **Fonts**: Inter (400/500/600/700) via `@expo-google-fonts/inter`
- **Theme**: Full dark/light palette in `constants/colors.ts`
- **Components**: GlassCard, CircularScore (animated ring), MetricCard (accent bar), VerticalCard (colored left border), ScoreBadge, SparklineChart

### Architecture
- `constants/colors.ts` — both light and dark palette definitions
- `context/ThemeContext.tsx` — dark mode source of truth (persists to AsyncStorage)
- `context/AuthContext.tsx` — demo user auth (7 roles)
- `context/DataContext.tsx` — all app data (employees, tasks, assets, finance, verticals, incidents)
- `context/ToastContext.tsx` — global animated toast notification system
- `hooks/useColors.ts` — delegates to `useTheme().colors`
- `app/(tabs)/_layout.tsx` — tab layout using `useTheme().mode` for isDark (NOT `useColorScheme`)

### 9 Business Verticals
Healthcare, Petroleum, Agriculture, Mining, Hospitality, NGO, Corporate, Real Estate, Technology

### 7 User Roles & Demo Users
| Role | Name | Notes |
|------|------|-------|
| Owner | Rajesh Mehta | Full access, all verticals |
| General Manager | Sunita Rao | Operations oversight |
| Manager | Aditya Kumar | Team management |
| Employee | Deepak Joshi (id=e9, score=97) | Check-in screen |
| Accountant | Meena Krishnan | Finance & payroll |
| Premium Customer | Vikram Anand | Loyalty card, services |
| Walking Customer | Guest User | QR pass, quick services |

### Screen Inventory
| Screen | Features |
|--------|----------|
| `login.tsx` | 7-role selector, staggered animations, tagline pills |
| `index.tsx` | All 7 role dashboards, revenue sparkline (Owner), employee rank badge, incident report modal |
| `checkin.tsx` | 3-step AI verification (face/uniform/geo), **live ticking clock with seconds**, break timer, clock-out flow |
| `finance.tsx` | P&L header, **PDF export button**, 3 tabs (Overview/Transactions/Payroll), wellness fund |
| `team.tsx` | Podium leaderboard 🥇🥈🥉, employee detail modal with CircularScore |
| `tasks.tsx` | Search, filter chips, create task modal |
| `assets.tsx` | Filter chips, asset detail modal, maintenance banner |
| `ai.tsx` | Chat, typing dots, quick questions, **EOH-AI v2.1 model badge** |
| `settings.tsx` | Dark mode toggle, payslip modal, all actions with toasts |
| `notifications.tsx` | Type filter, mark read, dismiss |
| `vertical/[id].tsx` | Per-vertical deep dive with financial overview |

### Key Components
- **`CircularScore.tsx`** — Animated ring chart, dark-mode aware (`/100` uses `colors.mutedForeground`)
- **`SparklineChart.tsx`** — Mini 7-day bar trend chart, opacity-graded bars
- **`GlassCard.tsx`** — Frosted glass card with border
- **`MetricCard.tsx`** — Metric tile with accent color bar
- **`VerticalCard.tsx`** — Vertical business card with colored left border + progress bar

### Fixed Bugs
- `_layout.tsx` uses `useTheme().mode` (NOT `useColorScheme`) for BlurView tint
- `CircularScore.tsx` `/100` text uses `colors.mutedForeground` (was hardcoded invisible in dark)
- `checkin.tsx` clock ticks every second via `useEffect` (was static `new Date()`)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
