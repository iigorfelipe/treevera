import type { User } from "@/common/types/user";
import { supabase } from "@/common/utils/supabase-client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export const syncProfile = async ({
  id,
  email,
  user_metadata,
  app_metadata,
}: SupabaseUser): Promise<User> => {
  const profile = {
    id,
    email,
    full_name: user_metadata.full_name,
    avatar_url: user_metadata.avatar_url,
  };

  await supabase.from("profiles").upsert(profile, { onConflict: "id" });

  return {
    ...profile,
    provider: app_metadata.provider,
  };
};
