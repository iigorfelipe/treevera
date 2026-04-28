import { useCallback, useMemo, useState } from "react";

import {
  useGetSpecieGallery,
  type GalleryImage,
} from "@/hooks/queries/useGetSpecieGallery";

type Params = {
  gbifKey?: number;
  canonicalName?: string | null;
  imageUrl?: string | null;
  imageSource?: string | null;
  imageAttribution?: string | null;
  imageLicense?: string | null;
};

type FailedImageState = {
  key: string;
  urls: Set<string>;
};

const EMPTY_FAILED_URLS = new Set<string>();

export function useRecoverableSpeciesImage({
  gbifKey,
  canonicalName,
  imageUrl,
  imageSource,
  imageAttribution,
  imageLicense,
}: Params) {
  const recoveryKey = `${gbifKey ?? ""}:${imageUrl ?? ""}`;
  const [failedState, setFailedState] = useState<FailedImageState>({
    key: recoveryKey,
    urls: new Set(),
  });

  const failedUrls =
    failedState.key === recoveryKey ? failedState.urls : EMPTY_FAILED_URLS;

  const initialImage = useMemo<GalleryImage | null>(
    () =>
      imageUrl
        ? {
            imgUrl: imageUrl,
            source: imageSource ?? "",
            author: imageAttribution ?? "",
            licenseCode: imageLicense ?? "",
          }
        : null,
    [imageAttribution, imageLicense, imageSource, imageUrl],
  );

  const shouldFetchAlternatives =
    !!gbifKey &&
    !!canonicalName &&
    (!imageUrl || failedUrls.size > 0 || failedUrls.has(imageUrl));

  const { data: gallery = [], isFetching } = useGetSpecieGallery(
    shouldFetchAlternatives ? gbifKey : undefined,
    shouldFetchAlternatives ? canonicalName ?? undefined : undefined,
  );

  const candidates = useMemo(() => {
    const seen = new Set<string>();
    const next: GalleryImage[] = [];

    const add = (image: GalleryImage | null | undefined) => {
      if (!image?.imgUrl) return;
      if (failedUrls.has(image.imgUrl) || seen.has(image.imgUrl)) return;
      seen.add(image.imgUrl);
      next.push(image);
    };

    add(initialImage);
    gallery.forEach(add);

    return next;
  }, [failedUrls, gallery, initialImage]);

  const image = candidates[0] ?? null;
  const imageUrlToFail = image?.imgUrl ?? null;

  const handleImageError = useCallback(() => {
    if (!imageUrlToFail) return;
    setFailedState((prev) => {
      const nextUrls =
        prev.key === recoveryKey ? new Set(prev.urls) : new Set<string>();
      nextUrls.add(imageUrlToFail);
      return { key: recoveryKey, urls: nextUrls };
    });
  }, [imageUrlToFail, recoveryKey]);

  return {
    image,
    isRecovered: !!image && image.imgUrl !== imageUrl,
    isResolving: shouldFetchAlternatives && isFetching,
    handleImageError,
  };
}
