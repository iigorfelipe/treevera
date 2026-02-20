import type { DbUser } from "@/common/types/user";
import { supabase } from "./client";

type UpdateFavActivityParams = {
  user: DbUser;
  speciesName: string;
  isFav: boolean;
};

const FAV_TITLE = "Nova espécie favorita!";

export const updateFavActivity = async ({
  user,
  speciesName,
  isFav,
}: UpdateFavActivityParams): Promise<DbUser | null> => {
  const description = `Favoritou a espécie ${speciesName}`;
  const activities = user.game_info.activities ?? [];

  let updatedActivities;

  if (isFav) {
    updatedActivities = [
      { title: FAV_TITLE, description, date: new Date().toISOString() },
      ...activities,
    ];
  } else {
    let removed = false;
    updatedActivities = activities
      .slice()
      .reverse()
      .filter((a) => {
        if (
          !removed &&
          a.title === FAV_TITLE &&
          a.description === description
        ) {
          removed = true;
          return false;
        }
        return true;
      })
      .reverse();
  }

  const { data, error } = await supabase
    .from("users")
    .update({ game_info: { ...user.game_info, activities: updatedActivities } })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating fav activity:", error);
    return null;
  }

  return data as DbUser;
};
