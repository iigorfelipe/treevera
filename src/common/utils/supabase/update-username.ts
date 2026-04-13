import { supabase } from "./client";

export const checkUsernameAvailable = async (
  username: string,
): Promise<boolean> => {
  const { data, error } = await supabase.rpc("is_username_available", {
    p_username: username,
  });
  if (error) throw error;
  return !!data;
};

export const updateUsername = async (
  userId: string,
  username: string,
): Promise<void> => {
  const { error } = await supabase
    .from("users")
    .update({ username })
    .eq("id", userId);
  if (error) throw error;
};
