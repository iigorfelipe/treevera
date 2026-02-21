import type { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "./client";
import type { DbUser } from "@/common/types/user";

export const createUser = async (u: SupabaseUser) => {
  const provider =
    u.app_metadata?.provider ||
    u.identities?.[0]?.provider ||
    (u.email?.includes("@") ? "email" : "unknown");

  const user = {
    id: u.id,
    email: u.email,
    name: u.user_metadata.full_name || u.email?.split("@")[0] || "Usuário",
    avatar_url: u.user_metadata.avatar_url || null,
    created_at: u.created_at,
    provider,
    game_info: {
      activities: [
        {
          title: "Conta criada com sucesso!",
          description: "Bem-vindo ao mundo da taxonomia",
          date: u.created_at,
        },
      ],
      seen_species: [],
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
