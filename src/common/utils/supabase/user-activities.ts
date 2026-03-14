import { supabase } from "./client";

export type UserActivityRow = {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  created_at: string;
};

export const fetchActivities = async (
  userId: string,
  limit = 20,
): Promise<UserActivityRow[]> => {
  const { data, error } = await supabase
    .from("user_activities")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching activities:", error);
    return [];
  }

  return (data as UserActivityRow[]) ?? [];
};

export const insertActivity = async (
  userId: string,
  title: string,
  description?: string,
): Promise<void> => {
  const { error } = await supabase.from("user_activities").insert({
    user_id: userId,
    title,
    description: description ?? null,
    created_at: new Date().toISOString(),
  });

  if (error) console.error("Error inserting activity:", error);
};
