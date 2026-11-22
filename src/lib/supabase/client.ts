import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lbfmxgnxihujjcrzhjzn.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Helper to determine if we have real credentials or placeholder
export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseAnonKey.includes("placeholder") &&
    supabaseUrl.startsWith("https://")
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
