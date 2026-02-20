import type { DbUser } from "@/common/types/user";
import { supabase } from "./client";

type AddChallengeActivityParams = {
  user: DbUser;
  speciesName: string;
  mode: "DAILY" | "RANDOM";
};

export const addChallengeActivity = async ({
  user,
  speciesName,
  mode,
}: AddChallengeActivityParams): Promise<DbUser | null> => {
  const title = mode === "DAILY" ? "Desafio Diário" : "Desafio Aleatório";
  const description = `Encontrou a espécie ${speciesName}`;

  const newActivity = {
    title,
    description,
    date: new Date().toISOString(),
  };

  const updatedActivities = [newActivity, ...(user.game_info.activities ?? [])];

  const { data, error } = await supabase
    .from("users")
    .update({ game_info: { ...user.game_info, activities: updatedActivities } })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error saving challenge activity:", error);
    return null;
  }

  return data as DbUser;
};
