import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const baseClientOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};

const authenticatedClients = new Map<string, SupabaseClient>();

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    ...baseClientOptions,
    auth: { ...baseClientOptions.auth, storageKey: "ps23-public-client" },
  },
);

export const createAuthenticatedSupabaseClient = (accessToken?: string) => {
  const clientKey = accessToken || "anonymous";
  const existingClient = authenticatedClients.get(clientKey);

  if (existingClient) {
    return existingClient;
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    ...baseClientOptions,
    auth: { ...baseClientOptions.auth, storageKey: `ps23-auth-${clientKey}` },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });

  authenticatedClients.set(clientKey, client);
  return client;
};
