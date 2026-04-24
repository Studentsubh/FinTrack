# Deployment Steps

This file contains the step-by-step process to deploy:

1. frontend on Vercel
2. backend on Render
3. database on Supabase

This project currently uses:

- Vercel for the React frontend
- Render for the Express backend
- Supabase Postgres as the database

## Deployment Architecture

```text
Browser
  -> Vercel frontend
  -> Render backend API
  -> Supabase Postgres
```

The frontend does not connect directly to Postgres.
It talks to the backend API.

## Step 1: Prepare Supabase

Make sure your Supabase project is ready.

### 1.1 Get database connection strings

From Supabase:

1. open your project
2. click `Connect`
3. copy the following:
   - transaction pooler connection string
   - direct connection string

Use the transaction pooler for runtime:

```env
DATABASE_URL=postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
```

Use the direct URL for migration tools if needed:

```env
DIRECT_URL=postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
```

### 1.2 Create schema in Supabase

Open Supabase `SQL Editor`.

If your database is fresh:

1. open [schema.sql](C:/Users/subhadeep/Downloads/Finance-Dashboard/schema.sql)
2. copy everything
3. run it in Supabase SQL Editor

If you are migrating an older database:

1. open [migration-auth-relations.sql](C:/Users/subhadeep/Downloads/Finance-Dashboard/migration-auth-relations.sql)
2. copy everything
3. run it in Supabase SQL Editor

### 1.3 Verify tables

Run these in Supabase SQL Editor:

```sql
select * from users;
```

```sql
select * from categories order by type, name;
```

```sql
select * from budgets;
```

```sql
select * from transactions;
```

You should see the seeded categories in `categories`.

## Step 2: Deploy Backend to Render

The backend config file already exists:

- [render.yaml](C:/Users/subhadeep/Downloads/Finance-Dashboard/render.yaml)

### 2.1 Push project to GitHub

If not already done:

1. create a GitHub repository
2. push this project to GitHub

### 2.2 Create Render service

In Render:

1. click `New +`
2. choose `Web Service`
3. connect your GitHub repository
4. Render should detect [render.yaml](C:/Users/subhadeep/Downloads/Finance-Dashboard/render.yaml)

If you deploy manually instead of using `render.yaml`, use:

- Root directory: repo root
- Build command:

```bash
pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build
```

- Start command:

```bash
node artifacts/api-server/dist/index.cjs
```

### 2.3 Set backend environment variables

In Render dashboard, add:

```env
DATABASE_URL=your_supabase_pooled_connection_string
FRONTEND_ORIGIN=https://your-vercel-project.vercel.app
NODE_ENV=production
```

Important:

- set `FRONTEND_ORIGIN` later if you do not yet know your Vercel URL
- once frontend is deployed, come back and update it to the exact Vercel domain

### 2.4 Deploy and verify backend

After deployment, open:

```text
https://your-render-service.onrender.com/api/healthz
```

Expected response:

```json
{"status":"ok"}
```

If this fails:

1. check Render logs
2. verify `DATABASE_URL`
3. verify Supabase schema exists

## Step 3: Deploy Frontend to Vercel

The frontend Vercel config already exists:

- [vercel.json](C:/Users/subhadeep/Downloads/Finance-Dashboard/artifacts/budget-tracker/vercel.json)

### 3.1 Import project into Vercel

In Vercel:

1. click `Add New Project`
2. import your GitHub repository
3. set the **Root Directory** to:

```text
artifacts/budget-tracker
```

Vercel should recognize it as a Vite app.

### 3.2 Set frontend environment variables

In Vercel project settings, add:

```env
VITE_API_BASE_URL=https://your-render-service.onrender.com
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Important:

- `VITE_API_BASE_URL` must point to your Render backend
- do not leave it as `http://localhost:3001` in production

### 3.3 Deploy frontend

After deployment, open your Vercel URL.

Test:

1. sign up
2. login
3. open budget page
4. add a transaction
5. check transaction list

## Step 4: Connect Frontend and Backend Correctly

Because auth is cookie-based:

- frontend must send credentials
- backend must allow frontend origin

This is already implemented in code:

- frontend uses `credentials: "include"`
- backend uses `FRONTEND_ORIGIN`
- backend cookie settings switch for production

What you must do:

1. deploy backend
2. deploy frontend
3. update `FRONTEND_ORIGIN` in Render to the exact Vercel URL
4. redeploy Render if needed

Example:

```env
FRONTEND_ORIGIN=https://finance-dashboard-abc123.vercel.app
```

## Step 5: Final Live Test

After both are deployed, test this flow:

1. open Vercel frontend
2. create a new account
3. verify default budgets are visible
4. add one expense transaction
5. verify it appears in transaction history
6. check Supabase table rows if needed

Useful Supabase SQL checks:

```sql
select * from users order by id desc;
```

```sql
select * from budgets order by id desc;
```

```sql
select * from transactions order by id desc;
```

## Environment Variable Summary

### Local development

Usually in `.env`:

```env
DATABASE_URL=your_supabase_pooled_connection_string
DIRECT_URL=your_supabase_direct_connection_string
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
VITE_API_BASE_URL=http://localhost:3001
```

### Render backend

```env
DATABASE_URL=your_supabase_pooled_connection_string
FRONTEND_ORIGIN=https://your-vercel-project.vercel.app
NODE_ENV=production
```

### Vercel frontend

```env
VITE_API_BASE_URL=https://your-render-service.onrender.com
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

## Files Involved

- [schema.sql](C:/Users/subhadeep/Downloads/Finance-Dashboard/schema.sql)
- [migration-auth-relations.sql](C:/Users/subhadeep/Downloads/Finance-Dashboard/migration-auth-relations.sql)
- [render.yaml](C:/Users/subhadeep/Downloads/Finance-Dashboard/render.yaml)
- [vercel.json](C:/Users/subhadeep/Downloads/Finance-Dashboard/artifacts/budget-tracker/vercel.json)
- [.env.example](C:/Users/subhadeep/Downloads/Finance-Dashboard/.env.example)
- [README.md](C:/Users/subhadeep/Downloads/Finance-Dashboard/README.md)

## Troubleshooting

### Frontend gets 401 or login does not persist

Check:

1. `FRONTEND_ORIGIN` matches exact Vercel URL
2. backend has `NODE_ENV=production`
3. frontend `VITE_API_BASE_URL` points to Render backend

### Frontend loads but API calls fail

Check:

1. backend health endpoint works
2. Vercel env vars are set correctly
3. Render service is awake and reachable

### Transactions do not save

Check:

1. categories exist in Supabase
2. user is signed in
3. backend has correct `DATABASE_URL`

### Routes 404 on Vercel refresh

This should already be handled by:

- [vercel.json](C:/Users/subhadeep/Downloads/Finance-Dashboard/artifacts/budget-tracker/vercel.json)

## Recommended Order

Use this exact order:

1. prepare Supabase
2. run schema
3. deploy backend to Render
4. verify `/api/healthz`
5. deploy frontend to Vercel
6. set `VITE_API_BASE_URL`
7. set `FRONTEND_ORIGIN`
8. test signup and transactions
