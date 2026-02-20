import { useResponsive } from "@/hooks/use-responsive";
import { FavoriteSpecies } from "@/modules/profile/fav-species";
import { HeaderProfile } from "@/modules/profile/header";
import { LatestUserActivities } from "@/modules/profile/latest-user-activities";
import { UserProgress } from "@/modules/profile/progress";
import { SpeciesGalleryPreview } from "@/modules/profile/species-gallery-preview";
import { TreeShortcuts } from "@/modules/profile/tree-shortcuts";
import { UserAchievements } from "@/modules/profile/user-achievements";
import { authStore } from "@/store/auth/atoms";
import { useNavigate } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useEffect } from "react";

export const Profile = () => {
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="h-screen overflow-auto">
      <div className="mx-auto max-w-7xl space-y-12 p-4">
        <div className="grid grid-cols-1 gap-20 lg:grid-cols-3">
          <div className="space-y-10 md:space-y-16 lg:col-span-2">
            <HeaderProfile />
            <FavoriteSpecies />
            {!isMobile && <UserAchievements />}
          </div>

          <div className="space-y-10 md:space-y-16">
            <LatestUserActivities />
            <SpeciesGalleryPreview />
            <TreeShortcuts />
            <UserProgress />
            {isMobile && <UserAchievements />}
          </div>
        </div>
      </div>
    </div>
  );
};
