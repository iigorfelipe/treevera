import type { DbUser } from "@/common/types/user";
import { supabase } from "./client";

export const fetchUser = async (id: string): Promise<DbUser | null> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return data as DbUser;
};
