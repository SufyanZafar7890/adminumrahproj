import { createClient, SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : "https://lbfmxgnxihujjcrzhjzn.supabase.co";

const DEFAULT_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder")
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZm14Z254aWh1ampjcnpoanpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUzNDYwMTUsImV4cCI6MjExMDkyMjAxNX0.Qa66Yo7nKaQTMAdLvyEK9PSy0-XKCe4awhIZmU9F5p4";

export const getSupabaseCredentials = () => {
  if (typeof window === "undefined") {
    return { url: DEFAULT_URL, key: DEFAULT_KEY };
  }
  const customUrl = window.localStorage.getItem("umrah_supabase_url");
  const customKey = window.localStorage.getItem("umrah_supabase_anon_key");
  const url = customUrl || DEFAULT_URL;
  const key = customKey || DEFAULT_KEY;
  return { url, key };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseCredentials();
  return Boolean(
    url &&
    key &&
    !key.includes("placeholder") &&
    url.startsWith("https://")
  );
};

let clientInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  const { url, key } = getSupabaseCredentials();
  if (!clientInstance) {
    clientInstance = createClient(url, key);
  }
  return clientInstance;
};

export const resetSupabaseClient = () => {
  clientInstance = null;
};

export const saveSupabaseCredentials = (url: string, key: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("umrah_supabase_url", url.trim());
  window.localStorage.setItem("umrah_supabase_anon_key", key.trim());
  resetSupabaseClient();
  window.dispatchEvent(new Event("storage_updated"));
};

// Dynamic proxy ensuring all calls to supabase.from(...) use the active client
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase();
    const val = (client as any)[prop];
    return typeof val === "function" ? val.bind(client) : val;
  },
});

