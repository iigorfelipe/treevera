import { insertActivity } from "./user-activities";

type UpdateFavActivityParams = {
  userId: string;
  speciesName: string;
  isFav: boolean;
};

export const updateFavActivity = async ({
  userId,
  speciesName,
  isFav,
}: UpdateFavActivityParams): Promise<void> => {
  if (!isFav) return;

  await insertActivity(
    userId,
    "Nova espécie favorita!",
    `Favoritou a espécie ${speciesName}`,
  );
};
