# student-job-application-assistant


# Dutch Filtration Remote Monitoring

This Vite dashboard reads the supplied GPRS packets from Supabase when configured and falls back to the local simulation without credentials.

## Local development

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`. The anon key is safe for browser use when the table policy remains read-only.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Run `supabase/seed.sql` in the same editor to insert all 46 supplied packets.
4. Copy the project URL and anon key into `.env.local` for local work.

The database stores each original packet in `public.gprs_packets`, including packet type, device id, device timestamp, raw payload, and alarm label. The browser parser expands STB pipe-delimited samples into chart points.

## Vercel deployment

Import the repository into Vercel. The included `vercel.json` uses the Vite build command and `dist` output. Add these Production environment variables in Vercel before deploying:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Redeploy after adding the variables. No Supabase service-role key belongs in Vercel or the browser.
