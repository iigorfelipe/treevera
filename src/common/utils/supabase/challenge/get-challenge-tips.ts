import { supabase } from "@/common/utils/supabase/client";

export type TipsMap = Record<string, string[]>; // canonical_name → hints[]

export const getChallengeTips = async (
  canonicalNames: string[],
): Promise<TipsMap> => {
  if (canonicalNames.length === 0) return {};

  const { data, error } = await supabase
    .from("challenge_tips")
    .select("canonical_name, hints")
    .in("canonical_name", canonicalNames);

  if (error || !data) {
    console.error("Error fetching challenge tips:", error);
    return {};
  }

  return Object.fromEntries(
    data.map((row) => [row.canonical_name as string, row.hints as string[]]),
  );
};
