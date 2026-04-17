import type { Curiosidades } from "./types";

export async function loadCuriosidadesByKingdom(
  kingdomKey: number,
): Promise<Curiosidades | null> {
  switch (kingdomKey) {
    case 1:
      return import("./animalia").then((module) => module.curiosidadesAnimalia);
    case 2:
      return import("./archaea").then((module) => module.curiosidadesArchaea);
    case 3:
      return import("./bacteria").then((module) => module.curiosidadesBacteria);
    case 4:
      return import("./chromista").then((module) => module.curiosidadesChromista);
    case 5:
      return import("./fungi").then((module) => module.curiosidadesFungi);
    case 6:
      return import("./plantae").then((module) => module.curiosidadesPlantae);
    case 7:
      return import("./protozoa").then((module) => module.curiosidadesProtozoa);
    default:
      return null;
  }
}
