import { VulnerabilityBadge } from "@/common/components/vulnerability-badge";
import { RANK_FIXES } from "@/common/utils/tree/ranks";
import { useGetSpeciesCache } from "@/hooks/queries/useGetSpeciesCache";
import {
  SkeletonDescription,
  SkeletonText,
  SkeletonVulnerabilityBadge,
} from "@/modules/specie-detail/skeletons";
import { useGetSpecieDetail } from "@/hooks/queries/useGetSpecieDetail";
import { useAtomValue } from "jotai";
import { Heart } from "lucide-react";
import { authStore } from "@/store/auth/atoms";
import { useEffect, useState, startTransition } from "react";
import { selectedSpecieKeyAtom, treeAtom } from "@/store/tree";
import { motion } from "framer-motion";
import { toggleFavSpecie } from "@/common/utils/supabase/user-seen-species";
import { updateFavActivity } from "@/common/utils/supabase/update-fav-activity";
import { useGetUserSeenSpecies } from "@/hooks/queries/useGetUserSeenSpecies";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/hooks/queries/keys";
import { useTranslation } from "react-i18next";

export const SpecieInfos = () => {
  const { t } = useTranslation();
  const selectedKey = useAtomValue(selectedSpecieKeyAtom);
  const treeSpecieKey = useAtomValue(treeAtom.expandedNodes).find(
    (node) => node.rank === "SPECIES",
  )?.key;

  const specieKey = selectedKey ?? treeSpecieKey;

  const { data: specieDetail, isLoading } = useGetSpecieDetail({
    specieKey: specieKey!,
  });

  const session = useAtomValue(authStore.session);
  const userId = session?.user?.id;

  const { data: seenSpecies = [] } = useGetUserSeenSpecies();
  const queryClient = useQueryClient();

  const canonicalName =
    specieDetail?.canonicalName || specieDetail?.scientificName;

  const { data: cache, isLoading: isLoadingCache } = useGetSpeciesCache(
    specieKey,
    canonicalName,
  );

  const specie = seenSpecies.find((s) => s.gbif_key === specieKey);
  const [fav, setFav] = useState(specie?.is_favorite ?? false);

  useEffect(() => {
    startTransition(() => setFav(specie?.is_favorite ?? false));
  }, [specie?.is_favorite]);

  const toggleFav = async () => {
    if (!userId || specieKey == null) return;

    const newFav = !fav;
    setFav(newFav);

    await toggleFavSpecie(userId, specieKey, newFav);
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.user_seen_species_key, userId],
    });

    if (newFav) {
      void updateFavActivity({
        userId,
        speciesName: canonicalName ?? "",
        isFav: newFav,
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.user_activities_key, userId],
      });
    }
  };

  if (!specieDetail)
    return (
      <p className="text-muted-foreground text-center">
        {t("specieDetail.dataUnavailable")}
      </p>
    );

  if (isLoading) return <SkeletonText />;

  const isOrderClass = RANK_FIXES[specieDetail.class];

  const taxonomyFields = [
    [t("specieDetail.kingdomLabel"), specieDetail.kingdom],
    [t("specieDetail.phylumLabel"), specieDetail.phylum],
    [
      isOrderClass
        ? t("specieDetail.orderLabel")
        : t("specieDetail.classLabel"),
      specieDetail.class,
    ],
    [
      t("specieDetail.orderLabel"),
      isOrderClass ? undefined : specieDetail.order,
    ],
    [t("specieDetail.familyLabel"), specieDetail.family],
    [t("specieDetail.genusLabel"), specieDetail.genus],
  ].filter(([, value]) => !!value);

  return (
    <div className="space-y-6">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b pb-4"
      >
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h1 className="mb-1 text-2xl font-bold sm:text-3xl">
              {specieDetail.canonicalName}
            </h1>
            {specieDetail.scientificName && (
              <p className="text-muted-foreground text-sm italic sm:text-lg">
                {specieDetail.scientificName}
              </p>
            )}
          </div>

          {userId && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleFav}
              className="mt-1"
            >
              <Heart
                className={`size-7 transition-all ${
                  fav
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground hover:text-red-500"
                }`}
              />
            </motion.button>
          )}
        </div>
      </motion.header>

      {taxonomyFields.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-muted rounded-lg border p-4"
        >
          <div className="mb-3 flex items-center gap-2"></div>
          <dl className="grid grid-cols-2 gap-3 text-sm [@container(min-width:1280px)]:grid-cols-3">
            {taxonomyFields.map(([label, value]) => (
              <div key={label}>
                <dt className="font-semibold">{label}:</dt>
                <dd className="text-primary/87">{value}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isLoadingCache ? (
          <SkeletonVulnerabilityBadge />
        ) : (
          <VulnerabilityBadge statusCode={cache?.iucnCode ?? null} />
        )}
      </motion.div>

      {isLoadingCache ? (
        <SkeletonDescription />
      ) : cache?.wikiDetails?.extract || cache?.wikiDetails?.description ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="flex items-center gap-2 text-xl font-semibold">
            {t("specieDetail.descriptionTitle")}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {cache.wikiDetails.extract || cache.wikiDetails.description}
          </p>
        </motion.div>
      ) : null}

      {(specieDetail.authorship || specieDetail.publishedIn) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3 border-t pt-4"
        >
          <h3 className="text-lg font-semibold">
            {t("specieDetail.nomenclatureTitle")}
          </h3>
          <div className="space-y-2 text-sm">
            {specieDetail.authorship && (
              <p className="text-muted-foreground">
                <strong className="text-foreground">
                  {t("specieDetail.author")}:{" "}
                </strong>
                {specieDetail.authorship}
              </p>
            )}
            {specieDetail.publishedIn && (
              <p className="text-muted-foreground">
                <strong className="text-foreground">
                  {t("specieDetail.publishedIn")}:{" "}
                </strong>
                {specieDetail.publishedIn}
              </p>
            )}
            <p className="text-muted-foreground">
              <strong className="text-foreground">
                {t("specieDetail.sources")}:{" "}
              </strong>
              GBIF, Wikipedia
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
