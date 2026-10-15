# Deploy to Vercel + Turso

## 1. Create a Turso database (browser)

1. Go to https://turso.tech → Sign up / Log in
2. **Create Database** → name `pzprintshop` → type **libsql**
3. Open the database → **View Credentials** / generate a client token
4. Copy the **Database URL** (`libsql://...`) and **Auth Token** (`eyJ...`)

No CLI or WSL needed.

## 2. Push the schema + seed production

From the project root:

```
$env:DATABASE_URL = "libsql://your-db.turso.io"
$env:DATABASE_AUTH_TOKEN = "eyJ..."
npx tsx prisma/push-remote.ts
```

This generates the SQL from `prisma/schema.prisma`, applies it to Turso, and seeds the owner user, services, and inventory.

## 3. Set Vercel environment variables

In Vercel Project Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `libsql://your-db.turso.io` |
| `DATABASE_AUTH_TOKEN` | Your Turso auth token |
| `SESSION_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `SEED_OWNER_EMAIL` | Your owner email |
| `SEED_OWNER_PASSWORD` | A strong password |
| `SEED_OWNER_NAME` | Your name |

## 4. Deploy

```
npx vercel
```

Or import the repo at https://vercel.com/new.

---

**Local development** is unchanged — still uses the SQLite file at `prisma/dev.db`. `src/lib/prisma.ts` auto-detects the URL format.