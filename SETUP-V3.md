# V3 Setup

## Supabase
1. Create a Supabase project.
2. Open **SQL Editor**.
3. Paste and run all of `schema.sql`.
4. Open the project API/Connect settings.
5. Copy the **Project URL** and **Publishable key** (older projects may call it `anon`).
6. Paste them into `config.js`.
7. If email confirmation is enabled, confirm the email after account creation.

## GitHub
Replace the v2 files in `family-bp-monitor` with the v3 files. Commit/push them. Your URL remains:
`https://kurtmckenzie.github.io/family-bp-monitor/`

## Test
Create an account and a test reading on the computer. Sign in with the same account on a phone. The reading should appear there.

## Important
GitHub hosts the application code. Supabase stores the readings. RLS limits each signed-in account to its own rows. Never publish a service_role/secret key.
