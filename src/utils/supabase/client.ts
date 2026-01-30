/** biome-ignore-all lint/style/noNonNullAssertion: can be done */
import { createBrowserClient } from '@supabase/ssr';

export const getSupabaseBrowserClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
  );
