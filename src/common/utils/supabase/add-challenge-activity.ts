import { insertActivity } from "./user-activities";

type AddChallengeActivityParams = {
  userId: string;
  speciesName: string;
  mode: "DAILY" | "RANDOM" | "CUSTOM";
};

export const addChallengeActivity = async ({
  userId,
  speciesName,
  mode,
}: AddChallengeActivityParams): Promise<void> => {
  const title =
    mode === "DAILY"
      ? "Desafio Diário"
      : mode === "CUSTOM"
        ? "Desafio Personalizado"
        : "Desafio Aleatório";
  const description = `Encontrou a espécie ${speciesName}`;

  await insertActivity(userId, title, description);
};
