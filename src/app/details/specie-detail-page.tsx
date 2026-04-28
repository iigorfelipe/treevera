import { SpecieDetail } from "@/app/details/specie-detail";
import { selectedSpecieKeyAtom } from "@/store/tree";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { useParams } from "@tanstack/react-router";
import { parseGbifKeyFromSpeciesSlug } from "@/common/utils/species-url";

export const SpecieDetailPage = () => {
  const { specieKey, speciesSlug } = useParams({ strict: false });
  const setSelectedKey = useSetAtom(selectedSpecieKeyAtom);
  const numericKey = specieKey
    ? Number(specieKey)
    : parseGbifKeyFromSpeciesSlug(speciesSlug);

  useEffect(() => {
    if (numericKey && numericKey > 0) {
      setSelectedKey(numericKey);
    }
    return () => {
      setSelectedKey(null);
    };
  }, [numericKey, setSelectedKey]);

  return <SpecieDetail showBackHeader={false} />;
};
