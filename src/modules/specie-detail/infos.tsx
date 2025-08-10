import { VulnerabilityBadge } from "@/components/vulnerability-badge";
import { RANK_FIXES } from "@/common/utils/ranks";
import { useGetStatusCode } from "@/hooks/queries/useGetIucnRedListCategory";
import { useGetWikiDetails } from "@/hooks/queries/useGetWikiDetails";
import {
  SkeletonDescription,
  SkeletonText,
  SkeletonVulnerabilityBadge,
} from "@/modules/specie-detail/skeletons";
import { useGetSpecieDetail } from "@/hooks/queries/useGetSpecieDetail";
import { useAtomValue } from "jotai";
import { treeAtom } from "@/store/tree";

export const SpecieInfos = () => {
  const specieKey = useAtomValue(treeAtom.expandedNodes).find(
    (node) => node.rank === "SPECIES",
  )?.key;

  const { data: specieDetail, isLoading } = useGetSpecieDetail({
    specieKey: specieKey!,
  });

  const { data: status, isLoading: isLoadingStatus } = useGetStatusCode({
    specieName:
      (specieDetail?.canonicalName || specieDetail?.scientificName) ?? "",
  });

  const { data: wikiDetails, isLoading: isLoadingWiki } = useGetWikiDetails(
    specieDetail?.canonicalName,
  );

  if (!specieDetail) return <p className="text-center">Dados indisponíveis.</p>;

  if (isLoading) return <SkeletonText />;

  const isOrderClass = RANK_FIXES[specieDetail.class];

  const taxonomyFields = [
    ["Reino", specieDetail.kingdom],
    ["Filo", specieDetail.phylum],
    [isOrderClass ? "Ordem" : "Classe", specieDetail.class],
    ["Ordem", isOrderClass ? undefined : specieDetail.order],
    ["Família", specieDetail.family],
    ["Gênero", specieDetail.genus],
    ["Espécie", specieDetail.species],
  ].filter(([, value]) => !!value);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-extrabold">
          {specieDetail.canonicalName}
        </h2>
        {specieDetail.scientificName && <i>{specieDetail.scientificName}</i>}
      </div>

      {taxonomyFields.length > 0 && (
        <dl className="grid grid-cols-2 gap-4 text-sm">
          {taxonomyFields.map(([label, value]) => (
            <div key={label}>
              <dt className="font-semibold">{label}:</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {isLoadingStatus ? (
        <SkeletonVulnerabilityBadge />
      ) : (
        <VulnerabilityBadge statusCode={status} />
      )}

      {isLoadingWiki ? (
        <SkeletonDescription />
      ) : wikiDetails?.extract || wikiDetails?.description ? (
        <div>
          <h3 className="mt-4 font-semibold">Descrição:</h3>
          <p className="text-sm">
            {wikiDetails.extract || wikiDetails.description}
          </p>
        </div>
      ) : null}

      {(specieDetail.authorship || specieDetail.publishedIn) && (
        <div className="border-t-1 pt-2 text-sm">
          {specieDetail.authorship && (
            <p>
              <strong>Autor:</strong> {specieDetail.authorship}
            </p>
          )}
          {specieDetail.publishedIn && (
            <p>
              <strong>Publicado em:</strong> {specieDetail.publishedIn}
            </p>
          )}
          <p>
            <strong>Fontes:</strong> GBIF, Wikipedia.
          </p>
        </div>
      )}
    </div>
  );
};
