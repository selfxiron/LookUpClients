# Deploy LookUpClients to Vercel + Neon

## 1. Create a Neon database

1. Go to [https://neon.tech](https://neon.tech) and sign up (free).
2. Create a project named **LookUpClients**.
3. Copy the **connection string** from the dashboard.
   - Use the **Pooled** connection (recommended for Vercel/serverless).
   - Prisma tip: Neon also shows a **Prisma**-formatted URL — use that if available.

Example formats:

```
# Pooled — use for DATABASE_URL (app runtime on Vercel)
postgresql://user:password@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# Direct — optional DIRECT_URL (migrations); auto-derived from pooled URL if omitted
postgresql://user:password@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

## 2. Run migrations locally (once)

Add your Neon URL to `.env`:

```bash
DATABASE_URL="your-neon-connection-string"
GEOAPIFY_API_KEY="your-geoapify-key"
```

Then apply the schema:

```bash
npm run db:migrate:deploy
```

Optional: open Prisma Studio against Neon:

```bash
npm run db:studio
```

## 3. Deploy on Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New → Project**.
3. Import **selfxiron/LookUpClients**.
4. Framework should auto-detect **Next.js** (no changes needed).
5. Add **Environment Variables**:

| Name | Value |
|---|---|
| `DATABASE_URL` | Your Neon **pooled** connection string (`-pooler` in hostname) |
| `DIRECT_URL` | Neon **direct** connection (optional — derived from pooled URL during build) |
| `GEOAPIFY_API_KEY` | Your Geoapify Places API key |
| `APP_ACCESS_PASSWORD` | Shared team password for login |
| `NOMINATIM_USER_AGENT` | `LookUpClients/1.0 (your-email@example.com)` (optional) |

6. Click **Deploy**.

The build runs:

```bash
prisma generate && PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1 prisma migrate deploy && next build
```

Migrations apply automatically on each deploy. Advisory locking is disabled during deploy because Neon's Postgres does not reliably support Prisma's session locks (P1002); this is safe for single-instance Vercel builds.

## 4. After deploy

- Visit your Vercel URL (e.g. `https://look-up-clients.vercel.app`).
- You should see a **login page** — enter `APP_ACCESS_PASSWORD`.
- Share the URL and password with Anamika only.
- Test **Find Clients**, **Add Lead**, and **Leads** — data lives in Neon Postgres.

## Local development (after switching to Neon)

Your local `.env` should use the **same** `DATABASE_URL` as production (or a separate Neon **branch** for dev).

```bash
cp .env.example .env
# paste Neon DATABASE_URL + GEOAPIFY_API_KEY
npm install
npm run db:migrate:deploy
npm run dev
```

## Troubleshooting

**Build fails on `prisma migrate deploy` with P1002 (timeout)**
- Use Neon’s **pooled** URL for `DATABASE_URL` (must include `-pooler` in hostname).
- Migrations auto-use a direct connection (or set `DIRECT_URL` explicitly).
- The Vercel build sets `PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1` because Neon does not reliably support Prisma’s advisory locks.
- Ensure the Neon project is awake (free tier sleeps — open the Neon dashboard before redeploying).

**`DATABASE_URL is not set` at runtime**
- Redeploy after adding env vars in Vercel → Settings → Environment Variables.

**Database connection errors on Vercel**
- Use Neon’s **pooled** connection string, not the direct one.
- Append `?sslmode=require` if missing.

## Custom domain (optional)

Vercel → Project → Settings → Domains → add your domain.
