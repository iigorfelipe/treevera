import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

import { useGetPublicProfile } from "@/hooks/queries/useGetPublicProfile";
import { Skeleton } from "@/common/components/ui/skeleton";
import { HeaderProfile } from "@/modules/profile/header";
import { FavoriteSpecies } from "@/modules/profile/fav-species/fav-species";
import { UserAchievements } from "@/modules/profile/user-achievements";
import { SpeciesGalleryPreview } from "@/modules/profile/species-gallery-preview";
import { UserListsPreview } from "@/modules/profile/user-lists-preview";
import { UserLikedListsPreview } from "@/modules/profile/user-liked-lists-preview";
import { TreeShortcuts } from "@/modules/profile/tree-shortcuts";
import { LatestUserActivities } from "@/modules/profile/latest-user-activities";
import { authStore } from "@/store/auth/atoms";

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-7xl p-4">
      <div className="flex flex-col gap-10 md:gap-14 lg:flex-row lg:items-start lg:gap-20">
        <div className="flex flex-col gap-10 lg:flex-2 lg:gap-14">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-3/4 rounded-xl" />
            ))}
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-10 lg:flex-1 lg:gap-14">
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 rounded-md" />
            ))}
          </div>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserProfilePage({ username }: { username: string }) {
  const { t } = useTranslation();
  const { data, isLoading } = useGetPublicProfile(username);
  const userDb = useAtomValue(authStore.userDb);

  if (isLoading) {
    return (
      <div className="h-full overflow-auto">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full overflow-auto">
        <div className="flex flex-col items-center justify-center gap-3 pt-24 text-center">
          <p className="text-4xl">🌿</p>
          <p className="text-lg font-semibold">
            {t("profilePage.notFoundTitle")}
          </p>
          <p className="text-muted-foreground text-sm">
            {t("profilePage.notFoundDescription", { username })}
          </p>
        </div>
      </div>
    );
  }

  const isOfficialProfile =
    data.username === "treevera" && userDb?.username !== "treevera";

  const publicProfileHeader = {
    name: data.name,
    username: data.username,
    avatar_url: data.avatar_url,
    created_at: data.created_at,
  };

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-7xl p-4">
        <div className="flex flex-col gap-10 md:gap-14 lg:flex-row lg:items-start lg:gap-20">
          <div className="contents lg:flex lg:flex-2 lg:flex-col lg:gap-14">
            <div className="order-1">
              <HeaderProfile publicProfile={publicProfileHeader} />
            </div>
            {!isOfficialProfile && (
              <div className="order-2">
                <FavoriteSpecies
                  favSpecies={data.public_info?.top_fav_species}
                  isOwner={false}
                />
              </div>
            )}
            {!isOfficialProfile && (
              <div className="order-3">
                <SpeciesGalleryPreview
                  userId={data.id}
                  profileUsername={data.username}
                />
              </div>
            )}
            {!isOfficialProfile && (
              <div className="order-5">
                <UserAchievements userId={data.id} isOwner={false} />
              </div>
            )}
          </div>

          <div className="contents max-w-1/3 lg:flex lg:flex-1 lg:flex-col lg:gap-14">
            <div className="order-4">
              <UserListsPreview userId={data.id} username={data.username} />
            </div>
            {!isOfficialProfile && (
              <div className="order-6">
                <UserLikedListsPreview
                  userId={data.id}
                  username={data.username}
                />
              </div>
            )}
            <div className="order-7">
              <TreeShortcuts
                shortcuts={data.public_info?.shortcuts}
                isOwner={false}
              />
            </div>
            {!isOfficialProfile && (
              <div className="order-8">
                <LatestUserActivities userId={data.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
