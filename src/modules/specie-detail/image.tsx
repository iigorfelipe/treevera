import { getRankIcon } from "@/common/utils/tree/ranks";
import { Image } from "@/common/components/image";
import { useGetSpecieDetail } from "@/hooks/queries/useGetSpecieDetail";
import { useGetSpecieImage } from "@/hooks/queries/useGetSpecieImage";
import { SkeletonImage } from "@/modules/specie-detail/skeletons";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { KEY_KINGDOM_BY_NAME } from "@/common/constants/tree";
import { selectedSpecieKeyAtom, treeAtom } from "@/store/tree";
import { ImageWithZoom } from "@/common/components/image-with-zoom";
import { useTranslation } from "react-i18next";

export const SpecieImageDetail = () => {
  const { t } = useTranslation();
  const selectedKey = useAtomValue(selectedSpecieKeyAtom);
  const treeSpecieKey = useAtomValue(treeAtom.expandedNodes).find(
    (node) => node.rank === "SPECIES",
  )?.key;
  const specieKey = selectedKey ?? treeSpecieKey;

  const { data: specieDetail } = useGetSpecieDetail({
    specieKey: specieKey!,
  });

  const { data: imageData, isLoading: isLoadingImage } = useGetSpecieImage(
    specieKey,
    specieDetail?.canonicalName,
  );

  const [isFallback, setIsFallback] = useState(false);

  if (!specieDetail) return;

  if (isLoadingImage) {
    return <SkeletonImage />;
  }

  const fallbackImage = getRankIcon(
    KEY_KINGDOM_BY_NAME[specieDetail.kingdom.toLowerCase() as "animalia"],
  );

  if (!imageData || isFallback) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 rounded-xl border border-dashed p-4 text-center text-sm">
        <Image
          src={fallbackImage}
          alt={specieDetail.scientificName}
          className="max-h-48 opacity-30"
        />
        <span>{t("specieDetail.imageNotFound")}</span>
        <div className="rounded-md border p-3 text-xs">
          <p>{t("specieDetail.imageNote")}</p>
        </div>

        <a
          href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
            specieDetail.canonicalName,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {t("specieDetail.viewOnGoogle")}
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full">
      <figure>
        <ImageWithZoom
          src={imageData.imgUrl || fallbackImage}
          fallbackSrc={fallbackImage}
          alt={`Imagem da espécie "${specieDetail.scientificName}"`}
          onFallbackChange={setIsFallback}
          zoom={3}
          className="h-auto w-full rounded-lg"
        />
      </figure>

      {imageData.source && (
        <p className="text-muted-foreground px-2 py-1 text-right text-[11px]">
          {t("specieDetail.imageSource")}: {imageData.source}{" "}
          {imageData.author &&
            `${t("specieDetail.imageBy")}${imageData.author.trim()}`}
          {imageData.licenseCode &&
            `${t("specieDetail.imageLicense")}${imageData.licenseCode}`}
        </p>
      )}
    </div>
  );
};
