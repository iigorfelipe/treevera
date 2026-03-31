export interface ListRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  kingdom_filter: string | null;
  likes_count: number;
  species_count: number;
  is_public: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface ListWithCreator extends ListRow {
  user_name: string;
  user_username: string;
  user_avatar_url: string | null;
  is_liked: boolean;
  total_count: number;
  known_count?: number;
}

export interface ListPreview {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  species_count: number;
  likes_count: number;
  slug: string;
  created_at: string;
  total_count: number;
}

export interface ListPreviewWithCreator extends ListPreview {
  user_username: string;
}

export interface ListLikedPreview extends ListPreview {
  user_name: string;
  user_username: string;
  user_avatar_url: string | null;
}

export interface ListSpeciesRow {
  gbif_key: number;
  canonical_name: string | null;
  family: string | null;
  image_url: string | null;
  is_favorite: boolean;
  sort_position: number;
  total_count: number;
}

export interface ListPickerItem {
  id: string;
  title: string;
  species_count: number;
  already_added: boolean;
}

export interface ToggleLikeResult {
  liked: boolean;
  likes_count: number;
}

export interface ListLiker {
  user_id: string;
  user_name: string;
  user_username: string;
  user_avatar_url: string | null;
}
