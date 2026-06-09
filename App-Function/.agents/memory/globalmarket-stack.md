---
name: GlobalMarket stack
description: Key decisions and gotchas for the GlobalMarket project setup
---

# GlobalMarket Stack

## Core architecture
- pnpm monorepo; marketplace frontend at `artifacts/marketplace` (preview `/`), API at `artifacts/api-server` (port 8080, all routes under `/api`)
- PostgreSQL + Drizzle ORM via `@workspace/db`; schema in `lib/db/src/schema/` (auth.ts, orders.ts, products.ts)
- Orval codegen: run `pnpm --filter @workspace/api-spec run codegen` after editing `lib/api-spec/openapi.yaml`
- React hooks from `@workspace/api-client-react`; auth hooks from `@workspace/replit-auth-web`

## Auth
- Replit OIDC/PKCE via `openid-client`; session stored in PostgreSQL `sessions` table
- `useAuth()` from `@workspace/replit-auth-web` — provides user, isLoading, isAuthenticated, login(), logout()
- `useGetMe()` from `@workspace/api-client-react` — returns UserProfile with approved + role fields
- Admin determined by `ADMIN_EMAIL` env var or `role === "admin"` in DB
- New users default `approved = false`; approval gate enforced in frontend ProtectedRoute

## Key fix: replit-auth-web lib
- `lib/replit-auth-web/src/use-auth.ts` must NOT use `import.meta.env` (not available in lib tsconfig context) — use `window.location.pathname` instead
- lib tsconfig must NOT include `"types": ["vite/client"]` — vite/client not installed in lib

## Escrow order states
pending → paid → shipped → delivered | disputed | cancelled

**Why:** payment held in escrow; released only when buyer calls /orders/:id/confirm (sets status=delivered)
