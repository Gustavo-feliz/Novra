import { createClient } from "@supabase/supabase-js";

export const isSupabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

// createClient lança erro síncrono se faltar URL/key — sem o placeholder, o app
// inteiro fica em tela branca antes mesmo de mostrar o login (ex.: antes do
// usuário configurar o .env com a própria conta Supabase, ver SUPABASE.md).
const url = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(url, anonKey);

export type Role = "admin" | "patient";

export type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  patient_id: string | null;
};

export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data as Profile;
}
