import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
  );
}

// Singleton — persists across API route invocations in dev mode (hot reload preserves globalThis)
declare global {
  var supabaseClient: ReturnType<typeof createClient<Database>> | undefined;
}

export const supabase =
  globalThis.supabaseClient ?? createClient<Database>(supabaseUrl, supabaseAnonKey);

if (process.env.NODE_ENV !== "production") {
  globalThis.supabaseClient = supabase;
}
