import { VulnerabilityBadge } from "@/common/components/vulnerability-badge";
import { RANK_FIXES } from "@/common/utils/tree/ranks";
import { useGetStatusCode } from "@/hooks/queries/useGetIucnRedListCategory";
import { useGetWikiDetails } from "@/hooks/queries/useGetWikiDetails";
import {
  SkeletonDescription,
  SkeletonText,
  SkeletonVulnerabilityBadge,
} from "@/modules/specie-detail/skeletons";
import { useGetSpecieDetail } from "@/hooks/queries/useGetSpecieDetail";
import { useAtom, useAtomValue } from "jotai";
import { Heart } from "lucide-react";
import { authStore } from "@/store/auth/atoms";
import { useEffect, useState } from "react";
import { selectedSpecieKeyAtom, treeAtom } from "@/store/tree";
import { motion } from "framer-motion";
import { updateSeenSpecies } from "@/common/utils/supabase/add_species_gallery";

export const SpecieInfos = () => {
  const selectedKey = useAtomValue(selectedSpecieKeyAtom);
  const treeSpecieKey = useAtomValue(treeAtom.expandedNodes).find(
    (node) => node.rank === "SPECIES",
  )?.key;

  const specieKey = selectedKey ?? treeSpecieKey;

  const { data: specieDetail, isLoading } = useGetSpecieDetail({
    specieKey: specieKey!,
  });

  const [userDb, setUserDb] = useAtom(authStore.userDb);

  const seenSpecies = userDb?.game_info?.seen_species ?? [];

  const specie = seenSpecies.find((s) => s.key === specieKey);

  const [fav, setFav] = useState(specie?.fav ?? false);

  const { data: status, isLoading: isLoadingStatus } = useGetStatusCode({
    specieName:
      (specieDetail?.canonicalName || specieDetail?.scientificName) ?? "",
  });

  const { data: wikiDetails, isLoading: isLoadingWiki } = useGetWikiDetails(
    specieDetail?.canonicalName,
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFav(specie?.fav ?? false);
  }, [specie?.fav]);

  const toggleFav = async () => {
    if (!userDb || specieKey == null) return;

    const newFav = !fav;
    setFav(newFav);

    void updateSeenSpecies(userDb, (prev) => {
      const updated = [...prev];
      const index = updated.findIndex((item) => item.key === specieKey);

      if (index !== -1) {
        updated[index] = { ...updated[index], fav: newFav };
      } else if (specieDetail) {
        updated.push({
          key: specieKey,
          date: new Date().toISOString(),
          fav: newFav,
        });
      }

      return updated;
    }).then((updatedUser) => {
      if (updatedUser) setUserDb(updatedUser);
    });
  };

  if (!specieDetail)
    return (
      <p className="text-muted-foreground text-center">Dados indisponíveis.</p>
    );

  if (isLoading) return <SkeletonText />;

  const isOrderClass = RANK_FIXES[specieDetail.class];

  const taxonomyFields = [
    ["Reino", specieDetail.kingdom],
    ["Filo", specieDetail.phylum],
    [isOrderClass ? "Ordem" : "Classe", specieDetail.class],
    ["Ordem", isOrderClass ? undefined : specieDetail.order],
    ["Família", specieDetail.family],
    ["Gênero", specieDetail.genus],
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
            <h1 className="mb-1 text-3xl font-bold">
              {specieDetail.canonicalName}
            </h1>
            {specieDetail.scientificName && (
              <p className="text-muted-foreground text-lg italic">
                {specieDetail.scientificName}
              </p>
            )}
          </div>

          {userDb && (
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
        {isLoadingStatus ? (
          <SkeletonVulnerabilityBadge />
        ) : (
          <VulnerabilityBadge statusCode={status} />
        )}
      </motion.div>

      {isLoadingWiki ? (
        <SkeletonDescription />
      ) : wikiDetails?.extract || wikiDetails?.description ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="flex items-center gap-2 text-xl font-semibold">
            Descrição
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {wikiDetails.extract || wikiDetails.description}
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
          <h3 className="text-lg font-semibold">Detalhes da Nomenclatura</h3>
          <div className="space-y-2 text-sm">
            {specieDetail.authorship && (
              <p className="text-muted-foreground">
                <strong className="text-foreground">Autor: </strong>
                {specieDetail.authorship}
              </p>
            )}
            {specieDetail.publishedIn && (
              <p className="text-muted-foreground">
                <strong className="text-foreground">Publicado em: </strong>
                {specieDetail.publishedIn}
              </p>
            )}
            <p className="text-muted-foreground">
              <strong className="text-foreground">Fontes: </strong>GBIF,
              Wikipedia
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
