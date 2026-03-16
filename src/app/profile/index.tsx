// import { useResponsive } from "@/hooks/use-responsive";
import { SpecieDetail } from "@/app/details/specie-detail";
import { FavoriteSpecies } from "@/modules/profile/fav-species/fav-species";
import { HeaderProfile } from "@/modules/profile/header";
import { LatestUserActivities } from "@/modules/profile/latest-user-activities";
// import { UserProgress } from "@/modules/profile/progress";
import { SpeciesGalleryPreview } from "@/modules/profile/species-gallery-preview";
import { TreeShortcuts } from "@/modules/profile/tree-shortcuts";
import { UserAchievements } from "@/modules/profile/user-achievements";
import { authStore } from "@/store/auth/atoms";
import { selectedSpecieKeyAtom } from "@/store/tree";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const Profile = () => {
  const { t } = useTranslation();
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const selectedSpecieKey = useAtomValue(selectedSpecieKeyAtom);
  const navigate = useNavigate();
  // const { isMobile } = useResponsive();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
  }, [isAuthenticated, navigate]);

  return (
    <AnimatePresence mode="wait">
      {selectedSpecieKey !== null ? (
        <motion.div
          key="detail"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="h-screen"
        >
          <SpecieDetail backLabel={t("specieDetail.backToProfile")} />
        </motion.div>
      ) : (
        <motion.div
          key="profile"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-screen overflow-auto"
        >
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

              <div className="contents lg:flex lg:flex-1 lg:flex-col lg:gap-14">
                <div className="order-3">
                  <SpeciesGalleryPreview />
                </div>
                <div className="order-5">
                  <TreeShortcuts />
                </div>
                <div className="order-6">
                  <LatestUserActivities />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
