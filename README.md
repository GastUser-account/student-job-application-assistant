# student-job-application-assistant


# Dutch Filtration Remote Monitoring

This Vite dashboard reads GPRS packets from Supabase. It does not generate or display simulated telemetry.

## Local development

```bash
pnpm install
pnpm dev
```

For local development, create `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The anon key is safe for browser use when the table policy remains read-only.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor. This creates the read-only public policy and enables realtime changes for the packet table.
3. Run `supabase/seed.sql` in the same editor to insert all 46 supplied packets.
4. Copy the project URL and anon key into `.env.local` for local work.

The database stores each original packet in `public.gprs_packets`, including packet type, device id, device timestamp, raw payload, and alarm label. The browser expands STB pipe-delimited samples into chart points, lists devices represented by Supabase records, and refreshes the dashboard when packets change.

When Supabase is unavailable, not configured, or has no packet records, the dashboard shows an explicit status instead of substituting sample data.

## Vercel deployment

Import the repository into Vercel. The included `vercel.json` uses the Vite build command and `dist` output. Add these environment variables in Vercel (at minimum for Production; add Preview/Development too if those deployments should connect) before deploying:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Redeploy after adding the variables because Vite embeds them into the frontend build. No Supabase service-role key belongs in Vercel or the browser.
