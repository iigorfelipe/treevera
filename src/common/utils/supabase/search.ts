import { supabase } from "./client";

export type UserSearchResult = {
  id: string;
  username: string;
  name: string;
  avatar_url: string | null;
};

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const { data, error } = await supabase.rpc("search_users", {
    p_query: query,
    p_limit: 20,
  });
  if (error) {
    console.error("searchUsers:", error);
    return [];
  }
  return (data as UserSearchResult[]) ?? [];
}
