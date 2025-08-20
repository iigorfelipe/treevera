import type { User as SupabaseUser } from "@supabase/supabase-js";

export type User = {
  id: SupabaseUser["id"];
  email: SupabaseUser["email"];
  full_name: SupabaseUser["user_metadata"]["full_name"];
  avatar_url: SupabaseUser["user_metadata"]["avatar_url"];
  provider: SupabaseUser["app_metadata"]["provider"];
};
