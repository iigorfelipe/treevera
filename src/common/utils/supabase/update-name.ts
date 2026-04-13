import { supabase } from "./client";

export const updateName = async (
  userId: string,
  name: string,
): Promise<void> => {
  const { error } = await supabase
    .from("users")
    .update({ name })
    .eq("id", userId);

  if (error) throw error;
};
