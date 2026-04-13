import { supabase } from "../client";
import type {
  UserCustomChallenge,
  CustomChallengeTaxonomy,
} from "@/common/types/api";

type CreateParams = {
  userId: string;
  gbifKey: number;
  speciesName: string;
  familyName: string;
  taxonomy: CustomChallengeTaxonomy;
};

export type CreateChallengeError =
  | "taxonomy_incomplete"
  | "already_exists"
  | "limit_reached"
  | "unknown";

type CreateResult =
  | { success: true; data: UserCustomChallenge }
  | { success: false; error: CreateChallengeError };

export const createCustomChallenge = async (
  params: CreateParams,
): Promise<CreateResult> => {
  const { data, error } = await supabase.rpc("create_custom_challenge", {
    p_user_id: params.userId,
    p_gbif_key: params.gbifKey,
    p_species_name: params.speciesName,
    p_family_name: params.familyName,
    p_taxonomy: params.taxonomy,
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("taxonomy_incomplete"))
      return { success: false, error: "taxonomy_incomplete" };
    if (msg.includes("already_exists"))
      return { success: false, error: "already_exists" };
    if (msg.includes("limit_reached"))
      return { success: false, error: "limit_reached" };
    console.error("createCustomChallenge:", error);
    return { success: false, error: "unknown" };
  }

  const rows = data as UserCustomChallenge[] | null;
  if (!rows || rows.length === 0) return { success: false, error: "unknown" };

  return { success: true, data: rows[0] };
};

export const getUserCustomChallenges = async (
  userId: string,
): Promise<UserCustomChallenge[]> => {
  const { data, error } = await supabase.rpc("get_user_custom_challenges", {
    p_user_id: userId,
  });

  if (error) {
    console.error("getUserCustomChallenges:", error);
    return [];
  }

  return (data as UserCustomChallenge[]) ?? [];
};

export const deleteCustomChallenge = async (
  userId: string,
  challengeId: string,
): Promise<void> => {
  const { error } = await supabase.rpc("delete_custom_challenge", {
    p_user_id: userId,
    p_challenge_id: challengeId,
  });

  if (error) {
    console.error("deleteCustomChallenge:", error);
  }
};
