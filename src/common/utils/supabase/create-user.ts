import type { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "./client";
import type { DbUser } from "@/common/types/user";

export const createUser = async (u: SupabaseUser) => {
  const user = {
    id: u.id,
    email: u.email,
    name: u.user_metadata.full_name,
    avatar_url: u.user_metadata.avatar_url,
    created_at: u.created_at,
    provider: u.app_metadata.provider,
    game_info: {
      activities: [
        {
          title: "Conta criada com sucesso!",
          description: "Bem-vindo ao mundo da taxonomia",
          date: new Date().toISOString(),
        },
      ],
    } as DbUser["game_info"],
  };

  const { data, error } = await supabase
    .from("users")
    .upsert(user, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error("Error creating user:", error);
    throw error;
  }

  if (!data) throw new Error("createUser: upsert retornou vazio");

  return JSON.parse(JSON.stringify(data)) as DbUser;
};
