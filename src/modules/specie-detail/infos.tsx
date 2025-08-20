import { VulnerabilityBadge } from "@/common/components/vulnerability-badge";
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
    <div className="space-y-9">
      <header>
        <h1 className="text-3xl font-bold">{specieDetail.canonicalName}</h1>
        {specieDetail.scientificName && (
          <i className="text-primary/87">{specieDetail.scientificName}</i>
        )}
      </header>

      {taxonomyFields.length > 0 && (
        <dl className="grid grid-cols-2 gap-3 text-sm [@container(min-width:1280px)]:grid-cols-3">
          {taxonomyFields.map(([label, value]) => (
            <div key={label}>
              <dt className="font-semibold">{label}:</dt>
              <dd className="text-primary/87">{value}</dd>
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
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Descrição:</h3>
          <p className="text-primary/87 text-sm leading-relaxed">
            {wikiDetails.extract || wikiDetails.description}
          </p>
        </div>
      ) : null}

      {(specieDetail.authorship || specieDetail.publishedIn) && (
        <div className="text-primary/90 space-y-1">
          <header className="mb-6 space-y-1">
            <h3 className="text-xl font-semibold">
              Detalhes da Nomenclatura e Fontes
            </h3>

            <p className="text-primary/87 text-xs">
              Informações sobre a autoria, publicação e fontes de dados do nome
              científico da espécie.
            </p>
          </header>

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
