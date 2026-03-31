import { useParams } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { useGetPublicProfile } from "@/hooks/queries/useGetPublicProfile";
import { SpeciesGallery } from "@/modules/species-gallery/species-gallery";
import { Loader2 } from "lucide-react";

export function SpeciesGalleryPageRouter() {
  const { username } = useParams({ strict: false }) as { username: string };
  const userDb = useAtomValue(authStore.userDb);

  if (userDb?.username === username) {
    return <SpeciesGallery backUsername={username} />;
  }

  return <PublicSpeciesGalleryInner username={username} />;
}

function PublicSpeciesGalleryInner({ username }: { username: string }) {
  const { data, isLoading } = useGetPublicProfile(username);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return <SpeciesGallery userId={data.id} backUsername={data.username} />;
}
