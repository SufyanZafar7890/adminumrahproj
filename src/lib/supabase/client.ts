import { createClient, SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lbfmxgnxihujjcrzhjzn.supabase.co";
const DEFAULT_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

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

export const supabase = getSupabase();
