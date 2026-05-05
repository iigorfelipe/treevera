import { useParams, useSearch } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { useGetPublicProfile } from "@/hooks/queries/useGetPublicProfile";
import { SpeciesGallery } from "@/modules/species-gallery/species-gallery";
import { Loader2 } from "lucide-react";

type GallerySearch = {
  favorites?: boolean | string;
};

const isFavoritesSearchActive = (favorites?: boolean | string) =>
  favorites === true || favorites === "true" || favorites === "1";

export function SpeciesGalleryPageRouter() {
  const { username } = useParams({ strict: false }) as { username: string };
  const search = useSearch({ strict: false }) as GallerySearch;
  const userDb = useAtomValue(authStore.userDb);
  const initialFavoritesOnly = isFavoritesSearchActive(search.favorites);

  if (userDb?.username === username) {
    return (
      <SpeciesGallery
        backUsername={username}
        initialFavoritesOnly={initialFavoritesOnly}
      />
    );
  }

  return (
    <PublicSpeciesGalleryInner
      username={username}
      initialFavoritesOnly={initialFavoritesOnly}
    />
  );
}

function PublicSpeciesGalleryInner({
  username,
  initialFavoritesOnly,
}: {
  username: string;
  initialFavoritesOnly: boolean;
}) {
  const { data, isLoading } = useGetPublicProfile(username);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <SpeciesGallery
      userId={data.id}
      backUsername={data.username}
      initialFavoritesOnly={initialFavoritesOnly}
    />
  );
}
