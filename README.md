# Family BP Monitor v3

Cloud-synced multi-family-member blood pressure tracker for GitHub Pages + Supabase.

## Features
- Email/password sign-in
- Same family data on phone, tablet and computer
- Multiple family-member profiles
- Multiple readings per day
- 7/30/90-day trend chart
- 7-day and 30-day averages
- CSV export
- Doctor report with Print / Save as PDF
- JSON backup/restore
- Supabase Postgres storage with Row Level Security

## Setup
1. Create a Supabase project.
2. Open Supabase SQL Editor and run `schema.sql`.
3. Copy the Supabase Project URL and browser-safe publishable/anon key.
4. Put them in `config.js`.
5. Replace the files in your GitHub `family-bp-monitor` repo with this version.
6. Keep GitHub Pages publishing from `main` / root.
7. Open the site and create an account.

The Supabase publishable/anon key is intended for frontend use when RLS is configured correctly. Never put a service_role/secret key in `config.js`.

Health-data note: this is a tracking tool, not a medical device or diagnosis.
