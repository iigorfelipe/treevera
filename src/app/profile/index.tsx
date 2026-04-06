import { FavoriteSpecies } from "@/modules/profile/fav-species/fav-species";
import { HeaderProfile } from "@/modules/profile/header";
import { LatestUserActivities } from "@/modules/profile/latest-user-activities";
import { SpeciesGalleryPreview } from "@/modules/profile/species-gallery-preview";
import { TreeShortcuts } from "@/modules/profile/tree-shortcuts";
import { UserAchievements } from "@/modules/profile/user-achievements";
import { UserListsPreview } from "@/modules/profile/user-lists-preview";
import { UserLikedListsPreview } from "@/modules/profile/user-liked-lists-preview";
import { authStore } from "@/store/auth/atoms";
import { useAtomValue } from "jotai";

export const Profile = () => {
  const userDb = useAtomValue(authStore.userDb);

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-7xl p-4">
        <div className="flex flex-col gap-10 md:gap-14 lg:flex-row lg:items-start lg:gap-20">
          <div className="contents lg:flex lg:flex-2 lg:flex-col lg:gap-14">
            <div className="order-1">
              <HeaderProfile />
            </div>
            <div className="order-2">
              <FavoriteSpecies />
            </div>
            <div className="order-4">
              <UserAchievements />
            </div>
          </div>

          <div className="contents max-w-1/3 lg:flex lg:flex-1 lg:flex-col lg:gap-14">
            <div className="order-3">
              <SpeciesGalleryPreview />
            </div>
            <div className="order-5">
              <UserListsPreview username={userDb?.username} />
            </div>
            <div className="order-6">
              <UserLikedListsPreview />
            </div>
            <div className="order-7">
              <TreeShortcuts />
            </div>
            <div className="order-8">
              <LatestUserActivities />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
