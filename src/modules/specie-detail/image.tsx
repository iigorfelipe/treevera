import { getRankIcon } from "@/common/utils/ranks";
import { useGetSpecieImage } from "@/hooks/queries/useGetSpecieImage";
import { SkeletonImage } from "@/modules/specie-detail/skeletons";

export const SpecieImageDetail = ({ specieDetail }: { specieDetail: any }) => {
  const { data: imageUrl, isLoading: isLoadingImage } = useGetSpecieImage(
    specieDetail?.key,
    specieDetail?.canonicalName,
  );

  if (isLoadingImage) {
    return <SkeletonImage />;
  }

  if (!imageUrl) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 rounded-xl border border-dashed p-4 text-center text-sm text-gray-500 dark:border-zinc-700 dark:text-gray-400">
        <img
          src={getRankIcon(specieDetail.kingdom)}
          alt={specieDetail.scientificName}
          className={`opacity-30`}
        />
        <span>Imagem não encontrada.</span>
        <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-xs text-yellow-900 dark:border-yellow-600 dark:bg-yellow-900 dark:text-yellow-100">
          <p>
            As imagens são obtidas através da <strong>Wikipedia</strong>,{" "}
            <strong>iNaturalist</strong> e <strong>GBIF</strong>, e podem estar
            ausentes para espécies com pouca documentação visual.
          </p>
        </div>

        <a
          href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
            specieDetail.canonicalName,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Ver no Google Imagens
        </a>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <figure className="flex w-full items-center justify-center rounded-xl shadow-md">
          <img
            src={imageUrl}
            alt={specieDetail.title}
            className="h-full w-fit"
          />
        </figure>
        <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-xs text-yellow-900 dark:border-yellow-600 dark:bg-yellow-900 dark:text-yellow-100">
          <p>
            A imagem é obtida de fontes como{" "}
            <span className="font-semibold">Wikipedia</span> ou{" "}
            <span className="font-semibold">iNaturalist</span> e pode não
            representar exatamente a espécie pesquisada.
          </p>
        </div>
      </div>
    </div>
  );
};
