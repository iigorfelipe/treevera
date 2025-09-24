import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Rank } from "./api";

type FavSpecies = {
  key: number;
  name: string;
  img: string;
  family: string;
};

type Node = {
  rank: Rank;
  key: number;
  name: string;
};

type ShortCut = {
  name: string;
  nodes: Node[];
};

export type Shortcuts = {
  animalia: ShortCut[];
  archaea: ShortCut[];
  bacteria: ShortCut[];
  chromista: ShortCut[];
  fungi: ShortCut[];
  protozoa: ShortCut[];
  plantae: ShortCut[];
};

type Activities = {
  title: string;
  description?: string;
  date: string;
};

export type Species_book = {
  key: number;
  date: string;
  fav: boolean;
  specie_name: string;
  family_name: string;
};

type Progress = {
  exploited_species: number;
  challenges_completed: number;
  accuracy_of_hits: number;
  num_achievements: number;
  consecutive_days: number;
  global_ranking: number;
};
type Achievements = {
  unlocked: string[];
  locked: { nome: string; progress: number }[];
};

type GameInfo = {
  activities: Activities[];
  species_book?: Species_book[];
  shortcuts?: Shortcuts;
  progress?: Progress;
  top_fav_species?: FavSpecies[];
  achievements?: Achievements;
};

export type DbUser = {
  id: SupabaseUser["id"];
  email: SupabaseUser["email"];
  name: SupabaseUser["user_metadata"]["full_name"];
  avatar_url: SupabaseUser["user_metadata"]["avatar_url"];
  provider: SupabaseUser["app_metadata"]["provider"];
  created_at: SupabaseUser["created_at"];
  game_info: GameInfo;
};
