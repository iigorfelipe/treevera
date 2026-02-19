import { FavoriteSpecies } from "@/modules/profile/fav-species";
import { HeaderProfile } from "@/modules/profile/header";
import { LatestUserActivities } from "@/modules/profile/latest-user-activities";
import { UserProgress } from "@/modules/profile/progress";
import { SpeciesGalleryPreview } from "@/modules/profile/species-gallery-preview";
import { TreeShortcuts } from "@/modules/profile/tree-shortcuts";
import { UserAchievements } from "@/modules/profile/user-achievements";
import { authStore } from "@/store/auth/atoms";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";

export const Profile = () => {
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="h-screen overflow-auto">
      <Link to="/" className="flex w-fit items-center gap-3 p-3 md:fixed">
        <ArrowLeft className="size-4" />
        Voltar
      </Link>

      <div className="mx-auto mb-12 max-w-7xl space-y-12 px-3 md:pt-12">
        <div className="grid grid-cols-1 gap-20 lg:grid-cols-3">
          <div className="space-y-18 lg:col-span-2">
            <HeaderProfile />
            <FavoriteSpecies />
            <UserProgress />
            <UserAchievements />
          </div>

          <div className="space-y-18 md:mt-8">
            <LatestUserActivities />
            <SpeciesGalleryPreview />
            <TreeShortcuts />
          </div>
        </div>
      </div>
    </div>
  );
};
