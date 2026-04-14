import { SpecieDetail } from "@/app/details/specie-detail";
import { selectedSpecieKeyAtom } from "@/store/tree";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { useParams } from "@tanstack/react-router";

export const SpecieDetailPage = () => {
  const { specieKey } = useParams({ strict: false });
  const setSelectedKey = useSetAtom(selectedSpecieKeyAtom);
  const numericKey = Number(specieKey);

  useEffect(() => {
    if (!isNaN(numericKey) && numericKey > 0) {
      setSelectedKey(numericKey);
    }
    return () => {
      setSelectedKey(null);
    };
  }, [numericKey, setSelectedKey]);

  return <SpecieDetail showBackHeader={false} />;
};
