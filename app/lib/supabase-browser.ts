import { createBrowserClient } from "@supabase/ssr";

// Singleton — safe to call multiple times; @supabase/ssr memoises internally.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
