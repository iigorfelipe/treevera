import { specieKeyAtom } from "@/store/tree";
import { useAtom } from "jotai";
import { Tree } from "./tree";
import { SpecieDetail } from "./specie-detail";

export const Home = () => {
  const [specieKey, setSpecieKey] = useAtom(specieKeyAtom);

  return (
    <div className="flex h-[calc(100vh-100px)] w-full flex-row gap-4">
      {/* {specieKey ? (
        <button
          className="group flex hover:cursor-pointer"
          title="voltar"
          onClick={() => setSpecieKey(null)}
        >
          <img
            src="./assets/arrow-x-icon.png"
            className="h-7 w-fit rotate-y-180 group-hover:scale-105"
            alt=""
          />
        </button>
      ) : ( */}

      <Tree />
      {/* )} */}
      {specieKey ? (
        <SpecieDetail />
      ) : (
        <div className="flex-1 p-6">
          <div>
            <div className="p-6">
              <div className="py-12 text-center">
                <img
                  src="./assets/microscope.svg"
                  className="mx-auto mb-4 h-16 w-16 text-gray-400"
                />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Selecione um item da taxonomia
                </h3>
                <p className="mx-auto max-w-md text-gray-600">
                  Explore a árvore taxonômica à esquerda para visualizar
                  informações detalhadas sobre cada classificação biológica.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
