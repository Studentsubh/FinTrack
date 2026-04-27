# Finance Dashboard

A full-stack personal finance dashboard built as a `pnpm` monorepo with:

- React + Vite frontend
- Express API backend
- PostgreSQL database
- Drizzle ORM for schema and queries
- Cookie-based authentication
- Relational data model for users, categories, budgets, and transactions

This project supports:

- user signup and login
- developer-managed categories
- user-specific transactions
- user-specific budgets
- default zero-value budgets created automatically for new users
- charts, reports, budget progress, and transaction history

## Features

- Dashboard with balance, income, expenses, and charts
- Add income and expense transactions
- Filter and browse transaction history
- Budget overview by category
- Reports and trends
- Login and signup flow backed by PostgreSQL
- Dark mode and local UI preferences
- CSV export from the frontend

## Tech Stack

### Frontend

- React
- Vite
- TypeScript
- Wouter
- Recharts
- Tailwind CSS
- Framer Motion

### Backend

- Express 5
- TypeScript
- Zod
- Drizzle ORM
- PostgreSQL
- Cookie-based auth

### Workspace

- pnpm workspaces
- shared libraries under `lib/`
- generated API client and Zod schemas

## Monorepo Structure

```text
Finance-Dashboard/
├── artifacts/
│   ├── api-server/             # Express backend
│   ├── budget-tracker/         # React frontend
│   └── mockup-sandbox/         # UI sandbox
├── lib/
│   ├── api-client-react/       # Generated frontend API client
│   ├── api-spec/               # OpenAPI spec
│   ├── api-zod/                # Generated Zod validators
│   └── db/                     # Drizzle schema and DB connection
├── scripts/                    # Utility scripts
├── schema.sql                  # Fresh database schema
├── migration-auth-relations.sql # Migration for existing databases
├── requirements.txt            # Quick setup reference
├── package.json                # Root scripts
└── replit.md                   # Legacy workspace notes
```

## Applications

### Frontend

Path: [artifacts/budget-tracker](C:/Users/subhadeep/Downloads/Finance-Dashboard/artifacts/budget-tracker)

Runs on:

- `http://localhost:3000`

Responsibilities:

- login and signup UI
- dashboard and reports
- budget editing
- transaction creation and listing
- fetches backend data through `/api` proxy

### API Server

Path: [artifacts/api-server](C:/Users/subhadeep/Downloads/Finance-Dashboard/artifacts/api-server)

Runs on:

- `http://localhost:3001`

Responsibilities:

- auth endpoints
- transaction CRUD
- budget listing and update
- financial summary
- cookie session handling

### Database Layer

Path: [lib/db](C:/Users/subhadeep/Downloads/Finance-Dashboard/lib/db)

Responsibilities:

- schema definitions
- PostgreSQL connection
- Drizzle table exports

## Database Design

The current relational design uses four important tables:

### `users`

- stores app users
- contains login credentials via `password_hash`

Columns:

- `id`
- `name`
- `email`
- `password_hash`
- `created_at`

### `categories`

Developer-managed global categories.

Users do not create categories dynamically anymore.

Columns:

- `id`
- `name`
- `type`
- `created_at`

Example categories:

- Expense: `Food`, `Transport`, `Shopping`, `Bills`, `Entertainment`, `Health`, `Other`
- Income: `Salary`, `Freelance`, `Investment`, `Gift`, `Other`

### `transactions`

User-specific transaction records.

Columns:

- `id`
- `user_id`
- `category_id`
- `type`
- `amount`
- `category`
- `description`
- `date`
- `payment_method`
- `notes`
- `created_at`

Relations:

- `transactions.user_id -> users.id`
- `transactions.category_id -> categories.id`

### `budgets`

User-specific category budgets by month.

Columns:

- `id`
- `user_id`
- `category_id`
- `category`
- `budget_limit`
- `month`

Relations:

- `budgets.user_id -> users.id`
- `budgets.category_id -> categories.id`

Unique constraint:

- one budget row per `user_id + category_id + month`

## Budget Initialization Logic

When a new user signs up:

1. the user is created in `users`
2. the backend reads all expense categories from `categories`
3. the backend inserts budget rows for the current month
4. each budget row gets `budget_limit = 0`

This means every user starts with all expense categories available in the budget screen.

## Authentication Model

Authentication is cookie-based.

Implemented routes:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Cookie behavior:

- a login cookie is set after signup or login
- authenticated routes use that cookie to resolve the current user

## API Routes

### Health

- `GET /api/healthz`

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Transactions

- `GET /api/transactions`
- `POST /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`

### Budgets

- `GET /api/budgets`
- `POST /api/budgets`

### Summary

- `GET /api/summary`

## Setup

## Prerequisites

- Node.js 22 or newer
- pnpm 10 or newer
- PostgreSQL
- pgAdmin recommended for database work

## Environment Variables

Create a `.env` file at the repo root:

```env
DATABASE_URL=postgres://postgres:postgres1234@localhost:5432/DBMS_mini
VITE_API_BASE_URL=http://localhost:3001
```

Reference example:

- [.env.example](C:/Users/subhadeep/Downloads/Finance-Dashboard/.env.example)

Important:

- keep `.env.example` limited to placeholder values only
- do not commit real database passwords or live service keys

## Install Dependencies

From the project root:

```powershell
pnpm install
```

## Database Setup

You have two options depending on whether this is a fresh database or an existing one.

### Option 1: Fresh Database

Run [schema.sql](C:/Users/subhadeep/Downloads/Finance-Dashboard/schema.sql) in pgAdmin Query Tool.

This will:

- create all relational tables
- seed developer-managed categories

### Option 2: Existing Database With Old Tables

Run [migration-auth-relations.sql](C:/Users/subhadeep/Downloads/Finance-Dashboard/migration-auth-relations.sql) in pgAdmin Query Tool.

This will:

- add auth-related tables
- add relational foreign keys
- backfill existing rows
- create a legacy fallback user:

```text
email: legacy@fintrack.local
password: legacy1234
```

## Running the App

### Start both frontend and backend

```powershell
$env:DATABASE_URL="postgres://postgres:postgres1234@localhost:5432/DBMS_mini"
pnpm dev
```

### Start only backend

```powershell
$env:DATABASE_URL="postgres://postgres:postgres1234@localhost:5432/DBMS_mini"
pnpm --filter @workspace/api-server run dev
```

### Start only frontend

```powershell
pnpm --filter @workspace/budget-tracker run dev
```

## URLs

- Frontend: `http://localhost:3000`
- API health: `http://localhost:3001/api/healthz`

## Deployment

This project is deployed as two separate services:

- Vercel hosts the frontend in [artifacts/budget-tracker](C:/Users/subhadeep/Downloads/Finance-Dashboard/artifacts/budget-tracker)
- Render hosts the backend in [artifacts/api-server](C:/Users/subhadeep/Downloads/Finance-Dashboard/artifacts/api-server)

Architecture:

```text
Browser
  -> Vercel frontend
  -> Render backend API
  -> Supabase Postgres
```

The Render URL is not the website UI. It serves API routes such as `/api/healthz`.

### Vercel frontend

Use these settings in Vercel:

- Root Directory: `artifacts/budget-tracker`
- Framework Preset: `Vite`

Frontend production env vars:

```env
VITE_API_BASE_URL=https://your-render-service.onrender.com
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Notes:

- `VITE_API_BASE_URL` should be the Render base URL without a trailing slash
- redeploy Vercel after changing frontend env vars

### Render backend

Use these settings in Render:

- Build command: `pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build`
- Start command: `node artifacts/api-server/dist/index.cjs`

Backend production env vars:

```env
DATABASE_URL=your_supabase_pooled_connection_string
FRONTEND_ORIGIN=https://your-stable-vercel-domain.vercel.app
NODE_ENV=production
```

Notes:

- `FRONTEND_ORIGIN` must exactly match the Vercel origin
- do not include a trailing slash in `FRONTEND_ORIGIN`
- if `FRONTEND_ORIGIN` changes, redeploy Render

### Auth and CORS gotcha

Authentication is cookie-based and cross-origin in production:

- frontend runs on `vercel.app`
- backend runs on `onrender.com`
- requests use `credentials: "include"`

That means the browser will block requests if `FRONTEND_ORIGIN` does not exactly match the active Vercel origin.

Bad:

```text
https://your-site.vercel.app/
https://preview-url.vercel.app
```

Good:

```text
https://your-site.vercel.app
```

Use one stable Vercel production domain and keep Render pointed at that exact value.

## Important Port Note

Do not run both:

- `pnpm --filter @workspace/budget-tracker run dev`
- `pnpm dev`

at the same time.

If you do, the frontend will already occupy port `3000`, and the combined root command will fail.

Use either:

1. `pnpm dev` by itself
2. or frontend and backend in separate terminals

## Developer-Managed Categories

This project now treats `categories` as controlled application data.

That means:

- users cannot create categories from the UI
- users cannot create categories by posting transactions
- transactions only work if the selected category exists in `categories`

To add or change categories, update the seeded category rows in:

- [schema.sql](C:/Users/subhadeep/Downloads/Finance-Dashboard/schema.sql)
- [migration-auth-relations.sql](C:/Users/subhadeep/Downloads/Finance-Dashboard/migration-auth-relations.sql)

and, if needed, the frontend dropdown lists in:

- [add-transaction.tsx](C:/Users/subhadeep/Downloads/Finance-Dashboard/artifacts/budget-tracker/src/pages/add-transaction.tsx)

## Common Developer Workflows

### Check server health

Open:

```text
http://localhost:3001/api/healthz
```

Expected:

```json
{"status":"ok"}
```

### Confirm categories are seeded

Run in pgAdmin:

```sql
SELECT * FROM categories ORDER BY type, name;
```

### Confirm budgets were auto-created for a new user

```sql
SELECT * FROM budgets ORDER BY user_id, category_id, month;
```

### Confirm transactions are being inserted

```sql
SELECT * FROM transactions ORDER BY id DESC;
```

## Type Checking

### Frontend

```powershell
pnpm --filter @workspace/budget-tracker run typecheck
```

### Backend

```powershell
pnpm --filter @workspace/api-server run typecheck
```

### Whole workspace

```powershell
pnpm run typecheck
```

## Known Notes

- frontend preferences such as currency and dark mode are still stored locally in the browser
- budget and transaction data are stored in PostgreSQL
- category editing is intentionally not exposed to end users
- the generated OpenAPI/client packages are present, but some runtime flows currently use direct `fetch` for simplicity
- if transaction creation fails, it usually means:
  - the user is not authenticated
  - the category table was not seeded
  - the database schema was not migrated to the latest relational version

## Troubleshooting

### Port 3000 already in use

Find the process:

```powershell
netstat -ano | findstr :3000
```

Kill it:

```powershell
taskkill /PID <PID> /F
```

### Frontend starts but transactions do not save

Check:

1. you are logged in
2. `categories` table is seeded
3. `transactions` has `user_id` and `category_id`
4. latest migration was run

### Login or signup fails with `Failed to fetch`

Check:

1. `VITE_API_BASE_URL` points to the Render backend
2. `https://your-render-service.onrender.com/api/healthz` returns `{"status":"ok"}`
3. `FRONTEND_ORIGIN` exactly matches the Vercel domain
4. `FRONTEND_ORIGIN` does not have a trailing slash
5. both services were redeployed after env var changes

If the browser shows an `OPTIONS` request but never sends the real `POST`, it is usually a CORS origin mismatch.

### Sign in returns a validation error about `name`

If you see a Zod error like:

```json
[
  {
    "path": ["name"],
    "message": "String must contain at least 1 character(s)"
  }
]
```

make sure the frontend is updated to the latest version. Sign-in should send only `email` and `password`, while sign-up sends `name`, `email`, and `password`.

### Backend fails because `DATABASE_URL` is missing

Run:

```powershell
$env:DATABASE_URL="postgres://postgres:postgres1234@localhost:5432/DBMS_mini"
pnpm --filter @workspace/api-server run dev
```

### Existing database was created before auth/relations

Run:

- [migration-auth-relations.sql](C:/Users/subhadeep/Downloads/Finance-Dashboard/migration-auth-relations.sql)

## Quick Reference

Also see:

- [requirements.txt](C:/Users/subhadeep/Downloads/Finance-Dashboard/requirements.txt)

That file is a shorter setup cheat sheet.
