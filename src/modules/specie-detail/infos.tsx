import { VulnerabilityBadge } from "@/components/vulnerability-badge";
import { useGetStatusCode } from "@/hooks/queries/useGetIucnRedListCategory";
import { useGetWikiDetails } from "@/hooks/queries/useGetWikiDetails";
import {
  SkeletonDescription,
  SkeletonVulnerabilityBadge,
} from "@/modules/specie-detail/skeletons";

export const SpecieInfos = ({ specieDetail }: { specieDetail: any }) => {
  const { data: status, isLoading: isLoadingStatus } = useGetStatusCode({
    specieName: specieDetail?.canonicalName || specieDetail?.scientificName,
  });

  const { data: wikiDetails, isLoading: isLoadingWiki } = useGetWikiDetails(
    specieDetail?.canonicalName,
  );

  if (!specieDetail) return <p className="text-center">Dados indisponíveis.</p>;

  const taxonomyFields = [
    ["Reino", specieDetail.kingdom],
    ["Filo", specieDetail.phylum],
    ["Ordem", specieDetail.order],
    ["Família", specieDetail.family],
    ["Gênero", specieDetail.genus],
    ["Espécie", specieDetail.species],
  ].filter(([, value]) => !!value);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white">
          {specieDetail.canonicalName}
        </h2>
        {specieDetail.scientificName && (
          <p className="text-gray-500 italic">{specieDetail.scientificName}</p>
        )}
      </div>

      {taxonomyFields.length > 0 && (
        <dl className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
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
          <h3 className="mt-4 font-semibold text-gray-800 dark:text-white">
            Descrição:
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {wikiDetails.extract || wikiDetails.description}
          </p>
        </div>
      ) : null}

      {(specieDetail.authorship || specieDetail.publishedIn) && (
        <div className="border-t border-gray-200 pt-2 text-sm dark:border-zinc-700">
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
